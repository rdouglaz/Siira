"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { SpeechState, TranscriptResult, DeepgramConfig } from "@/lib/speech/types";
import { createDeepgramSpeechService } from "@/lib/speech/deepgram";

export interface UseSpeechOptions {
  config: DeepgramConfig;
  onFinalTranscript: (text: string) => void;
  onSpeechStarted?: () => void;
  onUtteranceEnd?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseSpeechReturn {
  state: SpeechState;
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  lastTranscript: string;
  error: Error | null;
  clearError: () => void;
}

export function useSpeech(options: UseSpeechOptions): UseSpeechReturn {
  const { config, onFinalTranscript, onSpeechStarted, onUtteranceEnd, onError, enabled = true } = options;
  
  const [state, setState] = useState<SpeechState>("idle");
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState<Error | null>(null);
  
  const serviceRef = useRef<ReturnType<typeof createDeepgramSpeechService> | null>(null);
  const isMountedRef = useRef(true);

  // Initialize service
  useEffect(() => {
    if (!enabled) return;
    
    serviceRef.current = createDeepgramSpeechService(config, {
      onStateChange: (newState) => {
        if (isMountedRef.current) {
          setState(newState);
        }
      },
      onTranscript: (result: TranscriptResult) => {
        if (isMountedRef.current) {
          setLastTranscript(result.text);
          if (result.isFinal && result.text.trim()) {
            onFinalTranscript(result.text.trim());
          }
        }
      },
      onSpeechStarted: () => {
        if (isMountedRef.current) {
          onSpeechStarted?.();
        }
      },
      onUtteranceEnd: () => {
        if (isMountedRef.current) {
          onUtteranceEnd?.();
        }
      },
      onError: (err) => {
        if (isMountedRef.current) {
          setError(err);
          onError?.(err);
        }
      },
      onOpen: () => {
        console.log("[Speech] Service connected");
      },
      onClose: () => {
        console.log("[Speech] Service disconnected");
      },
    });

    return () => {
      isMountedRef.current = false;
      serviceRef.current?.stop();
    };
  }, [config, onFinalTranscript, onSpeechStarted, onUtteranceEnd, onError, enabled]);

  const startListening = useCallback(async () => {
    setError(null);
    if (serviceRef.current && state !== "listening") {
      try {
        await serviceRef.current.start();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    }
  }, [state, onError]);

  const stopListening = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    startListening,
    stopListening,
    isListening: state === "listening",
    lastTranscript,
    error,
    clearError,
  };
}

// Helper to create config from environment
// Phase 3: prefer Flux real-time model, fallback to Nova-2 via env override.
export function createSpeechConfig(language: "zh" | "de"): DeepgramConfig {
  const languageMap: Record<"zh" | "de", string> = {
    zh: "zh-CN",
    de: "de",
  };

  const model =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEEPGRAM_STT_MODEL) ||
    "flux-general-multi";

  return {
    model,
    language: languageMap[language],
    smartFormat: true,
    interimResults: true,
    punctuate: true,
    endpointing: 300,
    vadEvents: true,
  };
}