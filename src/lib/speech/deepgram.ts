"use client";

import { DeepgramConfig, SpeechState, TranscriptResult, SpeechCallbacks, SpeechService } from "./types";

const DEEPGRAM_BASE_URL = "wss://api.deepgram.com/v1/listen";
const TOKEN_ENDPOINT = "/api/deepgram/token";

function buildDeepgramUrl(config: DeepgramConfig): string {
  const params = new URLSearchParams({
    model: config.model || "nova-2",
    language: config.language || "en",
    smart_format: String(config.smartFormat ?? true),
    interim_results: String(config.interimResults ?? true),
    punctuate: String(config.punctuate ?? true),
    endpointing: String(config.endpointing ?? 300),
    vad_events: String(config.vadEvents ?? true),
    encoding: "linear16",
    sample_rate: "16000",
    channels: "1",
  });

  return `${DEEPGRAM_BASE_URL}?${params.toString()}`;
}

async function fetchDeepgramToken(): Promise<string> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to get Deepgram token: ${response.status} - ${error.error || "Unknown error"}`);
  }

  const data = await response.json();
  return data.token;
}

export function createDeepgramSpeechService(
  config: DeepgramConfig,
  callbacks: SpeechCallbacks
): SpeechService {
  let ws: WebSocket | null = null;
  let audioContext: AudioContext | null = null;
  let workletNode: AudioWorkletNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let stream: MediaStream | null = null;
  let state: SpeechState = "idle";
  let isManuallyStopped = false;
  let currentToken: string | null = null;

  function setState(newState: SpeechState) {
    state = newState;
    callbacks.onStateChange?.(newState);
  }

  function handleError(error: Error) {
    console.error("[Deepgram] Error:", error);
    callbacks.onError?.(error);
    setState("error");
    cleanup();
  }

  async function getMicrophoneStream(): Promise<MediaStream> {
    try {
      setState("requesting-permission");

      // Race getUserMedia against a 15 s timeout so the browser never hangs
      // indefinitely (e.g. when the permission dialog is blocked in an iframe).
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Microphone access timed out. Please allow microphone access and try again.")),
          15000
        );
      });

      const micStream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }),
        timeoutPromise,
      ]);

      clearTimeout(timeoutId!);
      return micStream;
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          throw new Error("Microphone permission denied. Please allow microphone access in your browser settings.");
        }
        if (error.name === "NotFoundError") {
          throw new Error("No microphone found. Please connect a microphone and try again.");
        }
        if (error.name === "SecurityError") {
          throw new Error("Microphone access is blocked in this context. Please open the app directly in your browser.");
        }
      }
      throw new Error(`Microphone access failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async function setupAudioProcessing(micStream: MediaStream) {
    audioContext = new AudioContext({ sampleRate: 16000 });
    await audioContext.audioWorklet.addModule('/deepgram-processor.js');
    source = audioContext.createMediaStreamSource(micStream);
    workletNode = new AudioWorkletNode(audioContext, 'deepgram-processor');
    workletNode.port.onmessage = (event) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(event.data);
      }
    };
    source.connect(workletNode);
    workletNode.connect(audioContext.destination);
  }

  async function setupWebSocket() {
    try {
      currentToken = await fetchDeepgramToken();
    } catch (error) {
      throw new Error(`Failed to get Deepgram token: ${error instanceof Error ? error.message : String(error)}`);
    }

    const url = buildDeepgramUrl(config);
    const urlWithToken = `${url}&token=${encodeURIComponent(currentToken)}`;
    ws = new WebSocket(urlWithToken);

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("[Deepgram] Connected");
      callbacks.onOpen?.();
      setState("listening");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "Results" && data.channel?.alternatives?.[0]) {
          const alt = data.channel.alternatives[0];
          const transcript = alt.transcript;
          
          if (transcript) {
            const result: TranscriptResult = {
              text: transcript,
              isFinal: data.is_final === true,
              confidence: alt.confidence || 0,
            };
            callbacks.onTranscript?.(result);
            
            if (data.speech_final === true) {
              console.log("[Deepgram] Speech final detected");
            }
          }
        } else if (data.type === "SpeechStarted") {
          console.log("[Deepgram] Speech started");
          callbacks.onSpeechStarted?.();
        } else if (data.type === "UtteranceEnd") {
          console.log("[Deepgram] Utterance end");
          callbacks.onUtteranceEnd?.();
        }
      } catch (error) {
        console.warn("[Deepgram] Failed to parse message:", error);
      }
    };

    ws.onerror = (event) => {
      console.error("[Deepgram] WebSocket error:", event);
      handleError(new Error("Deepgram connection error"));
    };

    ws.onclose = (event) => {
      console.log("[Deepgram] Disconnected:", event.code, event.reason);
      callbacks.onClose?.();
      if (!isManuallyStopped) {
        setState("error");
      } else {
        setState("idle");
      }
    };
  }

  async function start() {
    if (state === "listening" || state === "connecting") return;
    
    isManuallyStopped = false;
    setState("connecting");

    try {
      stream = await getMicrophoneStream();
      await setupAudioProcessing(stream);
      await setupWebSocket();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  function stop() {
    isManuallyStopped = true;
    cleanup();
    setState("idle");
  }

  function cleanup() {
    if (workletNode) {
      workletNode.disconnect();
      workletNode.port.close();
      workletNode = null;
    }
    if (source) {
      source.disconnect();
      source = null;
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    currentToken = null;
  }

  return {
    start,
    stop,
    getState: () => state,
  };
}