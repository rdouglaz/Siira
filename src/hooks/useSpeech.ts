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

  // Stable refs for callbacks — always call the latest version without restarting the service.
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onSpeechStartedRef = useRef(onSpeechStarted);
  const onUtteranceEndRef = useRef(onUtteranceEnd);
  const onErrorRef = useRef(onError);
  onFinalTranscriptRef.current = onFinalTranscript;
  onSpeechStartedRef.current = onSpeechStarted;
  onUtteranceEndRef.current = onUtteranceEnd;
  onErrorRef.current = onError;

  // Unmount cleanup only — keeps isMountedRef accurate for the full component lifetime.
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      serviceRef.current?.stop();
    };
  }, []);

  // Recreate service only when config shape or enabled flag changes — NOT on callback changes.
  useEffect(() => {
    if (!enabled) return;

    serviceRef.current = createDeepgramSpeechService(config, {
      onStateChange: (newState) => {
        if (isMountedRef.current) setState(newState);
      },
      onTranscript: (result: TranscriptResult) => {
        if (!isMountedRef.current) return;
        setLastTranscript(result.text);
        if (result.isFinal && result.text.trim()) {
          onFinalTranscriptRef.current(result.text.trim());
        }
      },
      onSpeechStarted: () => {
        if (isMountedRef.current) onSpeechStartedRef.current?.();
      },
      onUtteranceEnd: () => {
        if (isMountedRef.current) onUtteranceEndRef.current?.();
      },
      onError: (err) => {
        if (!isMountedRef.current) return;
        setError(err);
        onErrorRef.current?.(err);
      },
      onOpen: () => console.log("[Speech] Service connected"),
      onClose: () => console.log("[Speech] Service disconnected"),
    });

    return () => {
      serviceRef.current?.stop();
      serviceRef.current = null;
    };
  }, [config, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(async () => {
    setError(null);
    if (serviceRef.current && state !== "listening") {
      try {
        await serviceRef.current.start();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      }
    }
  }, [state]);

  const stopListening = useCallback(() => {
    serviceRef.current?.stop();
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
