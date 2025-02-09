"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceTrackingService = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
class FaceTrackingService {
    constructor() {
        // Default model path in the app's data directory
        this.modelPath = path.join(process.env.APPDATA || process.env.HOME || '', '.remotion-editor', 'models', 'openSeeface');
        this.pythonScript = path.join(__dirname, 'scripts', 'track_faces.py');
        this.config = {
            modelPath: this.modelPath,
            samplingRate: 1,
            minConfidence: 0.8,
            useGPU: true,
            minFaceSize: 0.1,
            maxFaceSize: 0.8,
            tracking: true,
            smoothing: 0.5,
            zoom: 1.0,
            neutralZone: {
                size: 0.3,
                position: {
                    x: 0.5,
                    y: 0.5 // Center of frame
                },
                reframeThreshold: 0.2,
                reframeSpeed: 0.5
            }
        };
        this.initializeIPC();
        this.ensureScriptExists();
    }
    initializeIPC() {
        electron_1.ipcMain.handle('face-tracking:process', this.handleProcessVideo.bind(this));
        electron_1.ipcMain.handle('face-tracking:downloadModel', this.handleModelDownload.bind(this));
    }
    ensureScriptExists() {
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
    async handleModelDownload(_event, modelUrl) {
        try {
            if (!fs.existsSync(this.modelPath)) {
                fs.mkdirSync(this.modelPath, { recursive: true });
            }
            // Download and extract model files
            // Implementation similar to VoskSpeechService's handleModelDownload
            return { success: true };
        }
        catch (error) {
            console.error('Error downloading model:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    async handleProcessVideo(_event, videoPath) {
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
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `Cannot access video file: ${error instanceof Error ? error.message : String(error)}`
                });
                return;
            }
            const process = (0, child_process_1.spawn)('python3', [
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
                }
                catch (error) {
                    resolve({
                        success: false,
                        error: 'Failed to parse face tracking result'
                    });
                }
            });
        });
    }
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}
exports.FaceTrackingService = FaceTrackingService;
exports.default = new FaceTrackingService();
