export type SpeechState = "idle" | "requesting-permission" | "connecting" | "listening" | "processing" | "error";

export interface DeepgramConfig {
  apiKey?: string;
  model?: string;
  language?: string;
  smartFormat?: boolean;
  interimResults?: boolean;
  punctuate?: boolean;
  endpointing?: number;
  vadEvents?: boolean;
}

export interface TranscriptResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  speaker?: number;
}

export interface SpeechCallbacks {
  onStateChange?: (state: SpeechState) => void;
  onTranscript?: (result: TranscriptResult) => void;
  onSpeechStarted?: () => void;
  onUtteranceEnd?: () => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface SpeechService {
  start: () => Promise<void>;
  stop: () => void;
  getState: () => SpeechState;
}