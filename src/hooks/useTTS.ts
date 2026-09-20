"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TTSState, TTSVoice } from "@/lib/tts/types";
import { audioCacheKey, getCachedAudio, putCachedAudio } from "@/lib/audio/cache";
import { fetchEdgeAudio } from "@/lib/supabase/edge";

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
  const { language, onStateChange, onError } = options;

  const [state, setState] = useState<TTSState>({ status: "idle" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);

  // Stable refs so speak/stop/pause/resume don't change identity when callbacks change.
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);
  onStateChangeRef.current = onStateChange;
  onErrorRef.current = onError;

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
          audioBlob = await fetchEdgeAudio({ text: text.trim(), language: activeLanguage, voice: speakOptions?.voice, preferFemale: true });
          await putCachedAudio(cacheKey, audioBlob, activeLanguage);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);

        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (isMountedRef.current) {
            const next: TTSState = { status: "idle" };
            setState(next);
            onStateChangeRef.current?.(next);
          }
        };

        audioRef.current.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          if (isMountedRef.current) {
            const err = new Error("Audio playback failed");
            const next: TTSState = { status: "error", error: err };
            setState(next);
            onStateChangeRef.current?.(next);
            onErrorRef.current?.(err);
          }
        };

        audioRef.current.onpause = () => {
          if (isMountedRef.current) {
            const next: TTSState = { status: "paused" };
            setState(next);
            onStateChangeRef.current?.(next);
          }
        };

        const next: TTSState = { status: "playing" };
        setState(next);
        onStateChangeRef.current?.(next);

        await audioRef.current.play();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (isMountedRef.current) {
          const next: TTSState = { status: "error", error: err };
          setState(next);
          onStateChangeRef.current?.(next);
          onErrorRef.current?.(err);
        }
      }
    },
    [language] // stable — callbacks go through refs
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }
    const next: TTSState = { status: "idle" };
    setState(next);
    onStateChangeRef.current?.(next);
  }, []); // stable

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      const next: TTSState = { status: "paused" };
      setState(next);
      onStateChangeRef.current?.(next);
    }
  }, []); // stable

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      const next: TTSState = { status: "playing" };
      setState(next);
      onStateChangeRef.current?.(next);
    }
  }, []); // stable

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

export function useAutoTTS(
  aiResponse: string | null,
  options: UseTTSOptions & { enabled?: boolean }
) {
  const { enabled = true, ...ttsOptions } = options;
  const tts = useTTS(ttsOptions);
  const hasSpokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !aiResponse || tts.isPlaying) return;
    if (hasSpokenRef.current === aiResponse) return;
    hasSpokenRef.current = aiResponse;
    const speakText = aiResponse.split("—")[0]?.trim() || aiResponse;
    tts.speak(speakText, { language: ttsOptions.language });
  }, [aiResponse, enabled, tts, ttsOptions.language]);

  return tts;
}
