import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

export interface DiarizationResult {
    success: boolean;
    error?: string;
    data?: Array<{
        speaker: string;
        start: number;
        end: number;
    }>;
}

export class SpeakerDiarizationService {
    private pythonScript: string;

    constructor() {
        this.pythonScript = path.join(__dirname, 'scripts', 'diarize_audio.py');
        this.initializeIPC();
        this.ensureScriptExists();
    }

    private initializeIPC() {
        ipcMain.handle('diarization:process', this.handleProcessAudio.bind(this));
    }

    private ensureScriptExists() {
        const scriptDir = path.dirname(this.pythonScript);
        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }

        if (!fs.existsSync(this.pythonScript)) {
            const pythonCode = `
from pyannote.audio import Pipeline
import torch
import json
import sys

def diarize_audio(audio_path):
    try:
        # Initialize pipeline with pretrained model
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization",
            use_auth_token="YOUR_ACCESS_TOKEN"  # User will need to provide this
        )

        # Run diarization
        diarization = pipeline(audio_path)
        
        # Convert results to JSON-serializable format
        results = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            results.append({
                "speaker": speaker,
                "start": turn.start,
                "end": turn.end
            })
        
        print(json.dumps({
            "success": True,
            "data": results
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Invalid arguments"
        }))
        sys.exit(1)
        
    audio_path = sys.argv[1]
    diarize_audio(audio_path)
`;
            fs.writeFileSync(this.pythonScript, pythonCode);
        }
    }

    public async handleProcessAudio(_event: Electron.IpcMainInvokeEvent, audioPath: string): Promise<DiarizationResult> {
        return new Promise((resolve) => {
            const process = spawn('python3', [
                this.pythonScript,
                audioPath
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
                        error: errorData || 'Speaker diarization process failed' 
                    });
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    resolve(result);
                } catch (error) {
                    resolve({ 
                        success: false, 
                        error: 'Failed to parse diarization result' 
                    });
                }
            });
        });
    }
}

export default new SpeakerDiarizationService();
