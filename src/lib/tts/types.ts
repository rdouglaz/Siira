export type TTSVoice = 
  // English voices
  | "aura-asteria-en"    // Female, warm
  | "aura-orpheus-en"    // Male, deep
  | "aura-arcas-en"      // Male, clear
  | "aura-persephone-en" // Female, bright
  | "aura-helios-en"     // Male, energetic
  | "aura-zeus-en"       // Male, authoritative
  // Chinese voices (if available)
  | "aura-asteria-zh"    // Female Chinese
  | "aura-orpheus-zh"    // Male Chinese
  // German voices (if available)
  | "aura-asteria-de"    // Female German
  | "aura-orpheus-de";   // Male German

export interface TTSConfig {
  apiKey: string;
  voice: TTSVoice;
  model?: string;
  encoding?: "linear16" | "mp3" | "wav" | "opus" | "flac";
  sampleRate?: number;
  container?: "none" | "wav" | "mp3";
}

export interface TTSRequest {
  text: string;
  voice?: TTSVoice;
  language?: "zh" | "de" | "en";
}

export interface TTSResponse {
  audioUrl: string; // blob URL for playback
  durationMs?: number;
}

export interface TTSState {
  status: "idle" | "loading" | "playing" | "paused" | "error";
  error?: Error;
}

export interface TTSService {
  speak: (request: TTSRequest) => Promise<TTSResponse>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getState: () => TTSState;
  setVoice: (voice: TTSVoice) => void;
  subscribe: (listener: (state: TTSState) => void) => () => void;
}