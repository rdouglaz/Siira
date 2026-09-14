/**
 * Phase 3: Real-time conversation pipeline state machine.
 *
 * Blueprint: Mic → Deepgram STT → LLM → Deepgram TTS → Speaker
 *
 * Turn management is driven by Deepgram VAD events:
 * - SpeechStarted => user barged in (cancel TTS, go to listening)
 * - Final transcript => thinking (LLM)
 * - LLM done => speaking (TTS)
 * - TTS ended / idle timeout => idle, ready for next turn
 * - UtteranceEnd => end-of-turn hint, do not auto-close mic (push-to-talk stays open)
 */

export type PipelineState = "idle" | "listening" | "thinking" | "speaking";

export interface PipelineEvent {
  type:
    | "MIC_START"
    | "MIC_STOP"
    | "SPEECH_STARTED"
    | "FINAL_TRANSCRIPT"
    | "LLM_START"
    | "LLM_DONE"
    | "TTS_START"
    | "TTS_END"
    | "ERROR";
}

export function nextPipelineState(current: PipelineState, event: PipelineEvent): PipelineState {
  switch (event.type) {
    case "MIC_START":
      return "listening";
    case "SPEECH_STARTED":
      // Barge-in: even if speaking, go back to listening
      return "listening";
    case "FINAL_TRANSCRIPT":
    case "LLM_START":
      return "thinking";
    case "LLM_DONE":
    case "TTS_START":
      return "speaking";
    case "TTS_END":
    case "MIC_STOP":
      return current === "listening" ? current : "idle";
    case "ERROR":
      return "idle";
    default:
      return current;
  }
}
