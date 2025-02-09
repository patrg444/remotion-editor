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
exports.SpeakerDiarizationService = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
class SpeakerDiarizationService {
    constructor() {
        this.pythonScript = path.join(__dirname, 'scripts', 'diarize_audio.py');
        this.initializeIPC();
        this.ensureScriptExists();
    }
    initializeIPC() {
        electron_1.ipcMain.handle('diarization:process', this.handleProcessAudio.bind(this));
    }
    ensureScriptExists() {
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
    async handleProcessAudio(_event, audioPath) {
        return new Promise((resolve) => {
            const process = (0, child_process_1.spawn)('python3', [
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
                }
                catch (error) {
                    resolve({
                        success: false,
                        error: 'Failed to parse diarization result'
                    });
                }
            });
        });
    }
}
exports.SpeakerDiarizationService = SpeakerDiarizationService;
exports.default = new SpeakerDiarizationService();
