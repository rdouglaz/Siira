"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TTSState, TTSVoice } from "@/lib/tts/types";
import { audioCacheKey, getCachedAudio, putCachedAudio } from "@/lib/audio/cache";

const TTS_ENDPOINT = "/api/deepgram/tts";

export interface UseTTSOptions {
  language: "zh" | "de";
  autoPlay?: boolean;
  onStateChange?: (state: TTSState) => void;
  onError?: (error: Error) => void;
}

export interface UseTTSReturn {
  state: TTSState;
  speak: (text: string, options?: { voice?: TTSVoice; language?: "zh" | "de" }) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useTTS(options: UseTTSOptions): UseTTSReturn {
  const { language, autoPlay = false, onStateChange, onError } = options;
  
  const [state, setState] = useState<TTSState>({ status: "idle" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);
  const playedRef = useRef<string | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = useCallback(
    async (text: string, speakOptions?: { voice?: TTSVoice; language?: "zh" | "de" }) => {
      if (!text.trim()) return;

      setState((prev) => ({ ...prev, status: "loading", error: undefined }));

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }

      try {
        const activeLanguage = speakOptions?.language || language;
        const cacheKey = audioCacheKey(text.trim(), activeLanguage, speakOptions?.voice);

        let audioBlob: Blob | null = await getCachedAudio(cacheKey);

        if (!audioBlob) {
          const response = await fetch(TTS_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: text.trim(),
              language: activeLanguage,
              voice: speakOptions?.voice,
              preferFemale: true,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `TTS failed: ${response.status}`);
          }

          audioBlob = await response.blob();
          await putCachedAudio(cacheKey, audioBlob, activeLanguage);
        }

        const audioUrl = URL.createObjectURL(audioBlob);

        audioRef.current = new Audio(audioUrl);
        
        const handleEnded = () => {
          URL.revokeObjectURL(audioUrl);
          if (isMountedRef.current) {
            setState({ status: "idle" });
          }
        };

        const handleError = () => {
          URL.revokeObjectURL(audioUrl);
          if (isMountedRef.current) {
            const error = new Error("Audio playback failed");
            setState({ status: "error", error });
            onError?.(error);
          }
        };

        const handlePause = () => {
          if (isMountedRef.current) {
            setState({ status: "paused" });
          }
        };

        audioRef.current.onended = handleEnded;
        audioRef.current.onerror = handleError;
        audioRef.current.onpause = handlePause;

        setState({ status: "playing" });
        onStateChange?.({ status: "playing" });

        await audioRef.current.play();

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (isMountedRef.current) {
          setState({ status: "error", error: err });
          onError?.(err);
        }
      }
    },
    [language, onStateChange, onError]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }
    setState({ status: "idle" });
    onStateChange?.({ status: "idle" });
  }, [onStateChange]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setState({ status: "paused" });
      onStateChange?.({ status: "paused" });
    }
  }, [onStateChange]);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setState({ status: "playing" });
      onStateChange?.({ status: "playing" });
    }
  }, [onStateChange]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  return {
    state,
    speak,
    stop,
    pause,
    resume,
    isPlaying: state.status === "playing",
    error: state.error ?? null,
    clearError,
  };
}

// Hook for auto-playing AI responses
export function useAutoTTS(
  aiResponse: string | null,
  options: UseTTSOptions & { enabled?: boolean }
) {
  const { enabled = true, ...ttsOptions } = options;
  const tts = useTTS(ttsOptions);
  const hasSpokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !aiResponse || tts.isPlaying) return;
    
    // Avoid re-speaking the same response
    if (hasSpokenRef.current === aiResponse) return;
    
    hasSpokenRef.current = aiResponse;
    
    const speakText = aiResponse.split("—")[0]?.trim() || aiResponse;
    tts.speak(speakText, { language: ttsOptions.language });
  }, [aiResponse, enabled, tts, ttsOptions.language]);

  return tts;
}