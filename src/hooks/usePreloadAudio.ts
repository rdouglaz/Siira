"use client";

import { useEffect, useRef } from "react";
import { audioCacheKey, getCachedAudio, putCachedAudio } from "@/lib/audio/cache";

export function usePreloadAudio(
  items: { text: string; language: "zh" | "de" }[],
  enabled = true,
  maxItems = 20
) {
  const startedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || items.length === 0) return;
    const fingerprint = items
      .slice(0, maxItems)
      .map((i) => `${i.language}:${i.text}`)
      .join("|");
    if (startedRef.current === fingerprint) return;
    startedRef.current = fingerprint;

    let cancelled = false;

    async function preload() {
      for (const item of items.slice(0, maxItems)) {
        if (cancelled) return;
        try {
          const key = audioCacheKey(item.text, item.language);
          const cached = await getCachedAudio(key);
          if (cached) continue;

          const res = await fetch("/api/deepgram/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: item.text, language: item.language }),
          });
          if (!res.ok) continue;
          const blob = await res.blob();
          await putCachedAudio(key, blob, item.language);
          // Small delay to avoid hammering the proxy
          await new Promise((r) => setTimeout(r, 150));
        } catch {
          // Best-effort background preload; never break UI
          continue;
        }
      }
    }

    void preload();
    return () => {
      cancelled = true;
    };
  }, [items, enabled, maxItems]);
}
