"use client";

import { useCallback, useRef, useState } from "react";
import { createDeepgramSpeechService } from "@/lib/speech/deepgram";
import { createSpeechConfig } from "@/hooks/useSpeech";
import type { PronunciationResult } from "@/lib/pronunciation/scoring";
import { scorePronunciation } from "@/lib/pronunciation/scoring";

export function usePronunciation(language: "zh" | "de") {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef<ReturnType<typeof createDeepgramSpeechService> | null>(null);

  const check = useCallback(
    async (expectedText: string, timeoutMs = 8000) => {
      setChecking(true);
      setError(null);
      setResult(null);

      const config = createSpeechConfig(language);

      return new Promise<PronunciationResult | null>((resolve) => {
        let done = false;
        const finish = (value: PronunciationResult | null, err?: Error | null) => {
          if (done) return;
          done = true;
          try {
            serviceRef.current?.stop();
          } catch {}
          setChecking(false);
          if (err) {
            setError(err);
            resolve(null);
          } else {
            if (value) setResult(value);
            resolve(value);
          }
        };

        const timer = setTimeout(() => finish(null, new Error("No speech detected. Try again.")), timeoutMs);

        serviceRef.current = createDeepgramSpeechService(config, {
          onTranscript: async (r) => {
            if (!r.isFinal || !r.text.trim()) return;
            clearTimeout(timer);
            try {
              finish(scorePronunciation(expectedText, r.text, [], language));
            } catch (e) {
              finish(null, e instanceof Error ? e : new Error(String(e)));
            }
          },
          onError: (e) => {
            clearTimeout(timer);
            finish(null, e);
          },
        });

        void serviceRef.current.start().catch((e) => {
          clearTimeout(timer);
          finish(null, e instanceof Error ? e : new Error(String(e)));
        });
      });
    },
    [language]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    try {
      serviceRef.current?.stop();
    } catch {}
    setChecking(false);
  }, []);

  return { checking, result, error, check, reset };
}
