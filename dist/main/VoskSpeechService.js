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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoskSpeechService = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const download_1 = require("../main/utils/download");
const SpeakerDiarizationService_1 = __importDefault(require("./speech/SpeakerDiarizationService"));
const CaptionCombiner_1 = require("./speech/CaptionCombiner");
class VoskSpeechService {
    constructor() {
        this.modelPath = path.join(process.env.APPDATA || process.env.HOME || '', '.remotion-editor', 'models', 'vosk-model-small-en-us-0.15');
        this.pythonScript = path.join(__dirname, 'scripts', 'transcribe.py');
        this.initializeIPC();
        this.ensureScriptExists();
    }
    initializeIPC() {
        electron_1.ipcMain.handle('vosk:transcribe', this.handleTranscribe.bind(this));
        electron_1.ipcMain.handle('vosk:downloadModel', this.handleModelDownload.bind(this));
    }
    ensureScriptExists() {
        const scriptDir = path.dirname(this.pythonScript);
        if (!fs.existsSync(scriptDir)) {
            fs.mkdirSync(scriptDir, { recursive: true });
        }
        if (!fs.existsSync(this.pythonScript)) {
            const pythonCode = `
import sys
import json
import vosk
import wave
import os

def transcribe_audio(audio_path, model_path):
    try:
        if not os.path.exists(model_path):
            print(json.dumps({
                'success': False,
                'error': 'Model not found'
            }))
            return

        wf = wave.open(audio_path, "rb")
        model = vosk.Model(model_path)
        rec = vosk.KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)

        results = []
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                part_result = json.loads(rec.Result())
                if part_result.get('result'):
                    results.extend(part_result['result'])

        part_result = json.loads(rec.FinalResult())
        if part_result.get('result'):
            results.extend(part_result['result'])

        # Convert results to caption format
        captions = []
        current_text = []
        current_start = None
        
        for word in results:
            if current_start is None:
                current_start = float(word['start'])
            
            current_text.append(word['word'])
            
            # Group words into ~3 second segments
            if float(word['end']) - current_start >= 3.0:
                captions.append({
                    'text': ' '.join(current_text),
                    'start': current_start,
                    'end': float(word['end']),
                    'conf': sum(float(w.get('conf', 1)) for w in results) / len(results)
                })
                current_text = []
                current_start = None
        
        # Add any remaining words
        if current_text:
            captions.append({
                'text': ' '.join(current_text),
                'start': current_start,
                'end': float(results[-1]['end']),
                'conf': sum(float(w.get('conf', 1)) for w in results) / len(results)
            })

        print(json.dumps({
            'success': True,
            'transcript': captions
        }))

    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            'success': False,
            'error': 'Invalid arguments'
        }))
        sys.exit(1)

    audio_path = sys.argv[1]
    model_path = sys.argv[2]
    transcribe_audio(audio_path, model_path)
`;
            fs.writeFileSync(this.pythonScript, pythonCode);
        }
    }
    async handleModelDownload(_event, modelUrl) {
        try {
            if (!fs.existsSync(this.modelPath)) {
                fs.mkdirSync(this.modelPath, { recursive: true });
            }
            await (0, download_1.download)(modelUrl, this.modelPath);
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
    async handleTranscribe(_event, audioPath, options) {
        return new Promise(async (resolve) => {
            try {
                // First get the transcription
                const transcriptionResult = await this.runTranscription(audioPath);
                if (!transcriptionResult.success) {
                    resolve(transcriptionResult);
                    return;
                }
                // Get speaker diarization if enabled
                if (options?.enableDiarization) {
                    const diarizationResult = await SpeakerDiarizationService_1.default.handleProcessAudio(_event, audioPath);
                    if (diarizationResult.success) {
                        // Combine transcription with speaker information using CaptionCombiner
                        const combinedTranscript = CaptionCombiner_1.CaptionCombiner.combineCaptions(transcriptionResult.transcript, diarizationResult.data || [], {
                            minSpeakerOverlap: 0.5,
                            enableSpeakerColors: true
                        });
                        resolve({
                            success: true,
                            transcript: combinedTranscript
                        });
                        return;
                    }
                    // If diarization fails, fall back to regular transcription
                    console.warn('Speaker diarization failed, falling back to regular transcription');
                }
                // Return regular transcription if diarization is disabled or failed
                resolve(transcriptionResult);
            }
            catch (error) {
                resolve({
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
    async runTranscription(audioPath) {
        return new Promise((resolve) => {
            const process = (0, child_process_1.spawn)('python3', [
                this.pythonScript,
                audioPath,
                this.modelPath
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
                        error: errorData || 'Transcription process failed'
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
                        error: 'Failed to parse transcription result'
                    });
                }
            });
        });
    }
}
exports.VoskSpeechService = VoskSpeechService;
exports.default = new VoskSpeechService();
