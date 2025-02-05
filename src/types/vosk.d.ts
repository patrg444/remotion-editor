export interface VoskWord {
    text: string;
    start: number;
    end: number;
    conf: number;
}

export interface VoskResult {
    result: VoskWord[];
}

export interface TranscriptionResult {
    success: boolean;
    transcript?: VoskWord[];
    error?: string;
}

export interface ModelDownloadResult {
    success: boolean;
    error?: string;
}

export interface VoskSpeechServiceInterface {
    transcribe(audioPath: string): Promise<TranscriptionResult>;
    downloadModel(modelUrl: string): Promise<ModelDownloadResult>;
}
