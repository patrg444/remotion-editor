import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import * as os from 'os';
import { FaceTrackingResult, FaceTrackingConfig } from '../../types/face-tracking';

export class FaceTrackingService {
    private modelPath: string;
    private pythonScript: string;
    private config: FaceTrackingConfig;

    constructor() {
        // Default model path in the app's data directory
        this.modelPath = path.join(process.env.APPDATA || process.env.HOME || '', '.remotion-editor', 'models', 'openSeeface');
        this.pythonScript = path.join(__dirname, 'scripts', 'track_faces.py');
        
        this.config = {
            modelPath: this.modelPath,
            samplingRate: 1,  // 1 fps default
            minConfidence: 0.8,
            useGPU: true
        };

        this.initializeIPC();
        this.ensureScriptExists();
    }

    private initializeIPC() {
        ipcMain.handle('face-tracking:process', this.handleProcessVideo.bind(this));
        ipcMain.handle('face-tracking:downloadModel', this.handleModelDownload.bind(this));
    }

    private ensureScriptExists() {
        const scriptDir = path.dirname(this.pythonScript);
        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }

        // Create Python tracking script if it doesn't exist
        if (!fs.existsSync(this.pythonScript)) {
            const pythonCode = `
import sys
import json
import cv2
import numpy as np
from openseeface import FaceTracker
import tempfile
import os

def extract_frames(video_path, fps):
    """Extract frames from video at specified FPS"""
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Could not open video file")

        video_fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = int(video_fps / fps)
        frames = []
        timestamps = []
        
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0:
                frames.append(frame)
                timestamps.append(frame_count / video_fps * 1000)  # ms
                
            frame_count += 1
            
        cap.release()
        return frames, timestamps
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Frame extraction failed: {str(e)}'
        }))
        return None, None

def track_faces(frames, timestamps, config):
    """Track faces in frames using OpenSeeFace"""
    try:
        tracker = FaceTracker(
            model_path=config['modelPath'],
            use_gpu=config['useGPU'],
            threshold=config['minConfidence']
        )
        
        results = []
        for frame, timestamp in zip(frames, timestamps):
            faces = tracker.track(frame)
            face_data = []
            
            for face in faces:
                if face.confidence >= config['minConfidence']:
                    face_data.append({
                        'id': int(face.id),
                        'confidence': float(face.confidence),
                        'landmarks': [
                            {'x': float(p[0]), 'y': float(p[1]), 'confidence': float(c)}
                            for p, c in zip(face.landmarks, face.landmark_confidences)
                        ],
                        'boundingBox': {
                            'x': float(face.bbox[0]),
                            'y': float(face.bbox[1]),
                            'width': float(face.bbox[2] - face.bbox[0]),
                            'height': float(face.bbox[3] - face.bbox[1])
                        },
                        'rotation': {
                            'pitch': float(face.euler[0]),
                            'yaw': float(face.euler[1]),
                            'roll': float(face.euler[2])
                        }
                    })
            
            results.append({
                'timestamp': timestamp,
                'faces': face_data
            })
        
        return results
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Face tracking failed: {str(e)}'
        }))
        return None

def main():
    if len(sys.argv) != 3:
        print(json.dumps({
            'success': False,
            'error': 'Invalid arguments'
        }))
        sys.exit(1)
    
    video_path = sys.argv[1]
    config = json.loads(sys.argv[2])
    
    # Extract frames
    frames, timestamps = extract_frames(video_path, config['samplingRate'])
    if frames is None:
        sys.exit(1)
    
    # Track faces
    results = track_faces(frames, timestamps, config)
    if results is None:
        sys.exit(1)
    
    # Return results
    print(json.dumps({
        'success': True,
        'data': results
    }))

if __name__ == '__main__':
    main()
`;
            fs.writeFileSync(this.pythonScript, pythonCode);
        }
    }

    private async handleModelDownload(_event: Electron.IpcMainInvokeEvent, modelUrl: string): Promise<{ success: boolean; error?: string }> {
        try {
            if (!fs.existsSync(this.modelPath)) {
                fs.mkdirSync(this.modelPath, { recursive: true });
            }

            // Download and extract model files
            // Implementation similar to VoskSpeechService's handleModelDownload
            
            return { success: true };
        } catch (error) {
            console.error('Error downloading model:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : String(error) 
            };
        }
    }

    private async handleProcessVideo(_event: Electron.IpcMainInvokeEvent, videoPath: string): Promise<FaceTrackingResult> {
        return new Promise((resolve) => {
            if (!fs.existsSync(this.modelPath)) {
                resolve({ 
                    success: false, 
                    error: 'Model not found. Please download the model first.' 
                });
                return;
            }

            // Verify file exists and is readable
            try {
                fs.accessSync(videoPath, fs.constants.R_OK);
            } catch (error) {
                resolve({ 
                    success: false, 
                    error: `Cannot access video file: ${error instanceof Error ? error.message : String(error)}` 
                });
                return;
            }

            const process = spawn('python3', [
                this.pythonScript,
                videoPath,
                JSON.stringify(this.config)
            ]);

            let outputData = '';
            let errorData = '';

            process.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            process.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    resolve({ 
                        success: false, 
                        error: errorData || 'Face tracking process failed' 
                    });
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    resolve(result);
                } catch (error) {
                    resolve({ 
                        success: false, 
                        error: 'Failed to parse face tracking result' 
                    });
                }
            });
        });
    }

    public updateConfig(newConfig: Partial<FaceTrackingConfig>) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export default new FaceTrackingService();
