"use client";

/**
 * @deprecated PHASE 1 SECURITY: Do not use direct Deepgram calls from client.
 * The UI uses `useTTS`, which streams audio through the Supabase Edge Function.
 * This file is kept for reference/tests only and must not receive a real API key in the browser.
 */

import { TTSConfig, TTSRequest, TTSResponse, TTSState, TTSService, TTSVoice } from "./types";

const DEEPGRAM_TTS_URL = "https://api.deepgram.com/v1/speak";

const VOICE_MAP: Record<"zh" | "de" | "en", { female: TTSVoice; male: TTSVoice }> = {
  zh: { female: "aura-asteria-zh", male: "aura-orpheus-zh" },
  de: { female: "aura-asteria-de", male: "aura-orpheus-de" },
  en: { female: "aura-asteria-en", male: "aura-orpheus-en" },
};

let currentAudio: HTMLAudioElement | null = null;
let currentVoice: TTSVoice = "aura-asteria-en";

function getVoiceForLanguage(language: "zh" | "de" | "en", preferFemale = true): TTSVoice {
  const voices = VOICE_MAP[language] || VOICE_MAP.en;
  return preferFemale ? voices.female : voices.male;
}

function cleanupAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio.load();
    currentAudio = null;
  }
}

export function createDeepgramTTSService(config: TTSConfig): TTSService {
  let state: TTSState = { status: "idle" };
  const listeners = new Set<(state: TTSState) => void>();

  function setState(newState: Partial<TTSState>) {
    state = { ...state, ...newState };
    listeners.forEach((listener) => listener(state));
  }

  async function speak(request: TTSRequest): Promise<TTSResponse> {
    cleanupAudio();
    setState({ status: "loading", error: undefined });

    const voice = request.voice || getVoiceForLanguage(request.language || "en");
    currentVoice = voice;

    try {
      const response = await fetch(`${DEEPGRAM_TTS_URL}?model=${voice}`, {
        method: "POST",
        headers: {
          Authorization: `Token ${config.apiKey}`,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: request.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.err_msg || `TTS API error: ${response.status}`
        );
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      currentAudio = new Audio(audioUrl);
      
      currentAudio.onplay = () => setState({ status: "playing" });
      currentAudio.onpause = () => setState({ status: "paused" });
      currentAudio.onended = () => {
        cleanupAudio();
        setState({ status: "idle" });
      };
      currentAudio.onerror = () => {
        const error = new Error("Audio playback failed");
        setState({ status: "error", error });
      };

      await currentAudio.play();

      return {
        audioUrl,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ status: "error", error: err });
      throw err;
    }
  }

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setState({ status: "idle" });
    }
  }

  function pause() {
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      setState({ status: "paused" });
    }
  }

  function resume() {
    if (currentAudio && currentAudio.paused) {
      currentAudio.play().catch(() => {});
      setState({ status: "playing" });
    }
  }

  function setVoice(voice: TTSVoice) {
    currentVoice = voice;
  }

  return {
    speak,
    stop,
    pause,
    resume,
    getState: () => state,
    setVoice,
    subscribe: (listener: (state: TTSState) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Standalone function for simple usage without full service
export async function synthesizeSpeech(
  text: string,
  apiKey: string,
  language: "zh" | "de" | "en" = "en",
  preferFemale = true
): Promise<string> {
  const voice = getVoiceForLanguage(language, preferFemale);
  
  const response = await fetch(`${DEEPGRAM_TTS_URL}?model=${voice}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.err_msg || `TTS API error: ${response.status}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

export function playAudioBlob(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch(reject);
  });
}

export function stopCurrentAudio() {
  cleanupAudio();
}
