"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  RotateCcw, Mic, MicOff, Send, Loader2, MessageSquare, FileText, 
  AlertTriangle, Volume2, VolumeX, Play, Pause, Settings2 
} from "lucide-react"
import { Orb, type OrbState } from "@/components/Orb"
import { ActionButtons } from "@/components/ActionButtons"
import { LanguagePill } from "@/components/LanguagePill"
import { WaveformIndicator } from "@/components/WaveformIndicator"
import { MeaningPanel } from "@/components/MeaningPanel"
import { TranscriptPanel } from "@/components/TranscriptPanel"
import { useApp } from "@/context/AppContext"
import { themes } from "@/data/themes"
import { type Exchange, type WordBreakdown } from "@/data/conversations"
import { useTutor, type TutorMessage } from "@/hooks/useTutor"
import { useSpeech, createSpeechConfig } from "@/hooks/useSpeech"
import { useTTS } from "@/hooks/useTTS"
import { useWords } from "@/context/WordsContext"
import { getWordsByLanguage } from "@/data/word-inventory"
import { extractVocabFromBreakdown, findInventoryIdByText } from "@/lib/vocabulary/extract"
import { getScaffoldingLevel, scaffoldingHint, shouldForceQuality, type StuckSignals } from "@/lib/scaffolding/stuck"

// ─── Timing constants (ms) ───────────────────────────────────────────────────
const T_IDLE_RETURN = 6800

// ─── Status text per orb state ───────────────────────────────────────────────
const statusText: Record<OrbState, string> = {
  idle: "Ready when you are",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Speaking...",
}

// ─── Animated phrase display ─────────────────────────────────────────────────
interface CurrentPhraseProps {
  exchange: Exchange | null
  language: "zh" | "de"
  onPlayTTS?: () => void
  onStopTTS?: () => void
  isTTSPlaying?: boolean
  ttsError?: Error | null
}

function CurrentPhrase({ 
  exchange, 
  language, 
  onPlayTTS, 
  onStopTTS, 
  isTTSPlaying,
  ttsError 
}: CurrentPhraseProps) {
  const welcome = language === "zh"
    ? { target: "你好！", sub: "Nǐ hǎo!", translation: "Hello!" }
    : { target: "Hallo!", sub: undefined, translation: "Hello!" }

  const display = exchange
    ? { target: exchange.aiText, sub: exchange.aiRomanization, translation: exchange.aiTranslation }
    : welcome

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={exchange?.id ?? "welcome"}
        className="flex flex-col items-center gap-0.5 py-0.5 w-full max-w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center gap-1.5 w-full max-w-full">
          <span
            className="font-bold tracking-tight text-[#1C1917] text-center leading-tight px-2 flex-1 min-w-0 break-words line-clamp-2"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: display.target.length > 16 ? "clamp(1.05rem, 4.5vw, 1.35rem)" : display.target.length > 8 ? "clamp(1.3rem, 6vw, 1.75rem)" : "clamp(1.5rem, 7.5vw, 2rem)",
            }}
          >
            {display.target}
          </span>
          
          {/* TTS Play/Stop button */}
          {exchange && onPlayTTS && onStopTTS && (
            <motion.button
              onClick={isTTSPlaying ? onStopTTS : onPlayTTS}
              className="p-2 rounded-xl transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ 
                background: isTTSPlaying 
                  ? "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(192,38,211,0.15) 100%)"
                  : "rgba(249,115,22,0.08)"
              }}
              whileTap={{ scale: 0.9 }}
              aria-label={isTTSPlaying ? "Stop speech" : "Play speech"}
            >
              {isTTSPlaying ? (
                <Pause size={18} strokeWidth={2.5} className="text-[#F97316]" />
              ) : (
                <Play size={18} strokeWidth={2.5} className="text-[#F97316]" />
              )}
            </motion.button>
          )}
        </div>
        
        {display.sub && (
          <span className="text-[13px] sm:text-sm font-medium text-[#F97316] tracking-wide text-center px-2 truncate max-w-full">{display.sub}</span>
        )}
        <span className="text-[13px] sm:text-sm text-[#A8A29E] font-medium text-center px-2 truncate max-w-full">{display.translation}</span>
        
        {/* TTS Error indicator */}
        {ttsError && (
          <motion.p
            className="text-[11px] text-[#DC2626] text-center mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Speech unavailable
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Text Input Fallback (secondary option) ────────────────────────────────────
function TextInputFallback({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (text: string) => void
  disabled: boolean
  placeholder: string
}) {
  const [text, setText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full mt-1.5 mb-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-w-0 px-4 min-h-[44px] rounded-2xl border border-[#F0EDE8] bg-white text-[#1C1917] placeholder-[#C7BDB8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 disabled:opacity-50 text-[15px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
          autoFocus
        />
        <motion.button
          type="submit"
          disabled={disabled || !text.trim()}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl flex items-center justify-center text-white self-center"
          style={{
            background: disabled || !text.trim()
              ? "#D6D3D1"
              : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
            boxShadow: disabled || !text.trim()
              ? "none"
              : "0 4px 16px rgba(249,115,22,0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
        >
          {disabled ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} strokeWidth={2} />}
        </motion.button>
      </div>
      <p className="text-[11px] text-[#C7BDB8] mt-1.5 text-center">
        Text fallback — tap mic for voice
      </p>
    </form>
  )
}

// ─── Auto-play Toggle ─────────────────────────────────────────────────────────
function AutoPlayToggle({ 
  enabled, 
  onToggle 
}: { 
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl transition-all"
      style={{
        background: enabled 
          ? "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(192,38,211,0.12) 100%)"
          : "#F5F5F4",
        border: enabled ? "1px solid rgba(249,115,22,0.2)" : "1px solid #F0EDE8",
      }}
    >
      <Volume2 size={14} strokeWidth={2} className="text-[#F97316]" />
      <span className="text-[13px] font-medium" style={{ color: enabled ? "#F97316" : "#A8A29E" }}>
        {enabled ? "Auto-play ON" : "Auto-play OFF"}
      </span>
    </button>
  )
}

// ─── Speech Status Indicator ───────────────────────────────────────────────────
interface SpeechStatusConfig {
  icon: React.ElementType
  color: string
  label: string
  spin?: boolean
}

function SpeechStatusIndicator({ 
  state, 
  transcript, 
  error,
  onRetry,
}: { 
  state: "idle" | "requesting-permission" | "connecting" | "listening" | "processing" | "error"
  transcript: string
  error: Error | null
  onRetry: () => void
}) {
  if (state === "idle") return null

  const statusConfig: Record<string, SpeechStatusConfig> = {
    "requesting-permission": { icon: Mic, color: "text-[#F97316]", label: "Requesting microphone access...", spin: false },
    "connecting": { icon: Loader2, color: "text-[#F97316]", label: "Connecting to speech service...", spin: true },
    "listening": { icon: Mic, color: "text-[#F97316]", label: "Listening... speak now", spin: false },
    "processing": { icon: Loader2, color: "text-[#F97316]", label: "Processing speech...", spin: true },
    "error": { icon: AlertTriangle, color: "text-[#DC2626]", label: error?.message || "Speech recognition failed", spin: false },
  }

  const config = statusConfig[state] || { icon: Mic, color: "text-[#A8A29E]", label: "Ready", spin: false }
  const Icon = config.icon

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-1 mb-1 flex flex-col items-center gap-1.5 px-2 shrink-0"
      >
        <div className="flex items-center gap-1.5">
          {config.spin ? (
            <Icon width={16} height={16} className={`${config.color} animate-spin`} strokeWidth={2} />
          ) : (
            <Icon width={16} height={16} className={`${config.color}`} strokeWidth={2} />
          )}
          <span className="text-[13px] font-medium" style={{ color: config.color.replace("text-", "") }}>
            {config.label}
          </span>
        </div>

        {transcript && state === "listening" && (
          <motion.p
            className="text-[13px] text-[#78716C] text-center max-w-full truncate italic px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            "{transcript}"
          </motion.p>
        )}

        {state === "error" && (
          <motion.button
            onClick={onRetry}
            className="px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TalkScreen() {
  const { language, selectedThemeId, setSelectedThemeId, setActiveTab, addMessage, clearConversation, conversationHistory } = useApp()

  const [orbState, setOrbState] = useState<OrbState>("idle")
  const [exchangeIndex, setExchangeIndex] = useState(0)
  const [currentExchange, setCurrentExchange] = useState<Exchange | null>(null)
  const [isMeaningOpen, setIsMeaningOpen] = useState(false)
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastUserMessage, setLastUserMessage] = useState<string>("")
  const [showTextInput, setShowTextInput] = useState(false)
  const [autoPlayTTS, setAutoPlayTTS] = useState(true)
  const [ttsError, setTtsError] = useState<Error | null>(null)
  const [stuckSignals, setStuckSignals] = useState<StuckSignals>({
    consecutiveErrors: 0,
    emptyTranscripts: 0,
    helpRequests: 0,
    againCount: 0,
    silenceCount: 0,
  })
  const { ensureWords } = useWords()

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  // Phase 5: persist conversation in background (never block UI)
  function persistConversation(entry: {
    role: "user" | "ai";
    content: string;
    romanization?: string;
    translation?: string;
    breakdown?: unknown;
  }) {
    try {
      void fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          themeId: selectedThemeId,
          role: entry.role,
          content: entry.content,
          romanization: entry.romanization,
          translation: entry.translation,
          breakdown: entry.breakdown ?? [],
        }),
      }).catch(() => {});
    } catch {}
  }

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // Reset conversation when language changes
  useEffect(() => {
    handleReset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  // Cleanup timers on unmount
  useEffect(() => () => clearTimers(), [])

  const handleReset = useCallback(() => {
    clearTimers()
    abortControllerRef.current?.abort()
    setOrbState("idle")
    setExchangeIndex(0)
    setCurrentExchange(null)
    setIsProcessing(false)
    setLastUserMessage("")
    setShowTextInput(false)
    setTtsError(null)
    setStuckSignals({
      consecutiveErrors: 0,
      emptyTranscripts: 0,
      helpRequests: 0,
      againCount: 0,
      silenceCount: 0,
    })
    clearConversation()
  }, [clearConversation])

  // Handle user message (speech or text) - defined before hooks to avoid temporal dead zone
  const handleUserMessage = useCallback(
    async (userText: string, opts?: { helpRequested?: boolean }) => {
      if (isProcessing) return

      const trimmed = userText.trim();
      if (!trimmed) {
        setStuckSignals((s) => ({ ...s, emptyTranscripts: s.emptyTranscripts + 1 }));
        return;
      }

      const helpRequested =
        opts?.helpRequested ??
        /don't know|dont know|help|不知道|不懂|不明白|hilf|hilfe|weiß nicht|weiss nicht/i.test(trimmed);
      if (helpRequested) {
        setStuckSignals((s) => ({ ...s, helpRequests: s.helpRequests + 1 }));
      }

      const level = getScaffoldingLevel(stuckSignals);
      const forceQuality = opts?.helpRequested ? true : shouldForceQuality(level);

      setIsProcessing(true)
      setLastUserMessage(trimmed)
      setOrbState("listening")
      setTtsError(null)

      // Add user message to transcript immediately
      addMessage({ role: "user", text: trimmed })
      persistConversation({ role: "user", content: trimmed })
      setOrbState("thinking")

      try {
        // Build recent exchanges for context
        const recentExchanges = conversationHistory.slice(-6).reduce<Array<{ user: string; ai: string }>>(
          (acc, msg, idx, arr) => {
            if (msg.role === "user" && idx + 1 < arr.length && arr[idx + 1].role === "ai") {
              acc.push({ user: msg.text, ai: arr[idx + 1].text })
            }
            return acc
          },
          []
        )

        // Call LLM
        const response = await fetch("/api/llm/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: trimmed }],
            language,
            context: {
              themeId: selectedThemeId || undefined,
              recentExchanges,
            },
            forceQuality,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`)
        }

        // Parse AI response
        const aiContent = data.content

        const newExchange: Exchange = {
          id: `ex-${Date.now()}`,
          userText: trimmed,
          aiText: aiContent.split("—")[0]?.trim() || aiContent,
          aiRomanization: language === "zh" ? extractPinyin(aiContent) : undefined,
          aiTranslation: extractTranslation(aiContent),
          breakdown: extractBreakdown(aiContent, language),
        }

        addMessage({
          role: "ai",
          text: newExchange.aiText,
          romanization: newExchange.aiRomanization,
          translation: newExchange.aiTranslation,
          breakdown: newExchange.breakdown,
        })
        persistConversation({
          role: "ai",
          content: newExchange.aiText,
          romanization: newExchange.aiRomanization,
          translation: newExchange.aiTranslation,
          breakdown: newExchange.breakdown,
        })

        setCurrentExchange(newExchange)
        setOrbState("speaking")
        setStuckSignals((s) => ({ ...s, consecutiveErrors: 0 }))

        // Phase 4: extract vocabulary from real conversation -> SRS
        try {
          const inventoryWords = getWordsByLanguage(language);
          const extracted = extractVocabFromBreakdown(newExchange.breakdown, language, (text) =>
            findInventoryIdByText(
              inventoryWords.map((w) => ({ id: w.id, target: w.target })),
              text
            )
          );
          const ids = extracted.map((e) => e.wordId).filter((id): id is string => Boolean(id));
          if (ids.length > 0) ensureWords(ids);
        } catch (e) {
          console.warn("[Vocab] extraction failed:", e);
        }

        // Auto-play TTS if enabled
        if (autoPlayTTS && newExchange.aiText) {
          const speakText = newExchange.aiText.split("—")[0]?.trim() || newExchange.aiText
          speakTTS(speakText, { language }).catch((err) => {
            console.warn("Auto TTS failed:", err)
            setTtsError(err)
          })
        }

        // Return to idle after a delay
        const t = setTimeout(() => {
          setOrbState("idle")
          setIsProcessing(false)
          setExchangeIndex((i) => i + 1)
        }, T_IDLE_RETURN)
        timersRef.current.push(t)
      } catch (error) {
        console.error("LLM error:", error)
        setOrbState("idle")
        setIsProcessing(false)
        setStuckSignals((s) => ({ ...s, consecutiveErrors: s.consecutiveErrors + 1 }))

        // Fallback to a friendly error message
        const fallbackExchange: Exchange = {
          id: `ex-fallback-${Date.now()}`,
          userText: trimmed,
          aiText: language === "zh" ? "抱歉，我有点问题。请再试一次。" : "Entschuldigung, da gab es ein Problem. Bitte versuch es noch mal.",
          aiRomanization: language === "zh" ? "Bàoqiàn, wǒ yǒudiǎn wèntí. Qǐng zài shì yīcì." : undefined,
          aiTranslation: "Sorry, I had a problem. Please try again.",
          breakdown: [],
        }

        addMessage({
          role: "ai",
          text: fallbackExchange.aiText,
          romanization: fallbackExchange.aiRomanization,
          translation: fallbackExchange.aiTranslation,
          breakdown: [],
        })

        setCurrentExchange(fallbackExchange)
        setOrbState("speaking")

        // Auto-play fallback TTS
        if (autoPlayTTS) {
          speakTTS(fallbackExchange.aiText, { language }).catch(() => {})
        }

        const t = setTimeout(() => {
          setOrbState("idle")
          setExchangeIndex((i) => i + 1)
        }, T_IDLE_RETURN)
        timersRef.current.push(t)
      }
    },
    [language, selectedThemeId, conversationHistory, addMessage, autoPlayTTS, stuckSignals, ensureWords]
  )

  // LLM Hook
  const { isLoading: llmLoading, lastError: llmError } = useTutor({
    language,
    themeId: selectedThemeId || undefined,
    onError: (error) => {
      console.error("Tutor error:", error)
      setOrbState("idle")
      setIsProcessing(false)
    },
  })

  // Speech Hook
  const speechConfig = createSpeechConfig(language)
  const { 
    state: speechState, 
    startListening, 
    stopListening, 
    isListening, 
    lastTranscript,
    error: speechError,
    clearError: clearSpeechError,
  } = useSpeech({
    config: speechConfig,
    onFinalTranscript: handleUserMessage,
    onSpeechStarted: () => {
      // Phase 3 barge-in: user started speaking while AI was speaking -> stop TTS, go to listening
      try {
        stopTTS();
      } catch {}
      setOrbState("listening");
    },
    onError: (error) => {
      console.error("Speech error:", error)
      setOrbState("idle")
      setIsProcessing(false)
    },
enabled: true,
  })

  // TTS Hook
  const { 
    state: ttsState, 
    speak: speakTTS, 
    stop: stopTTS, 
    isPlaying: isTTSPlaying,
    error: ttsErrorState,
  } = useTTS({
    language,
    autoPlay: false,
    onStateChange: (state) => {
      if (state.status === "playing") {
        setOrbState("speaking")
      } else if (state.status === "idle" && orbState === "speaking") {
        setOrbState("idle")
      }
      if (state.status === "error") {
        setTtsError(state.error || new Error("TTS error"))
      }
    },
    onError: (error) => {
      console.error("TTS error:", error)
      setTtsError(error)
    },
  })

  // Manual TTS play/stop for current exchange
  const handlePlayTTS = useCallback(() => {
    if (!currentExchange) return
    setTtsError(null)
    const speakText = currentExchange.aiText.split("—")[0]?.trim() || currentExchange.aiText
    speakTTS(speakText, { language }).catch((err) => setTtsError(err))
  }, [currentExchange, speakTTS, language])

  const handleStopTTS = useCallback(() => {
    stopTTS()
    setTtsError(null)
  }, [stopTTS])

  // Mic toggle handler
  const handleMicToggle = useCallback(() => {
    if (isListening || speechState === "connecting" || speechState === "requesting-permission") {
      stopListening()
      clearTimers()
      abortControllerRef.current?.abort()
      setOrbState("idle")
      setIsProcessing(false)
      setShowTextInput(false)
      return
    }

    if (speechState === "error") {
      clearSpeechError()
      startListening()
      return
    }

    // Start listening
    setShowTextInput(false)
    startListening()
  }, [isListening, speechState, startListening, stopListening, clearSpeechError])

  const handleTextSubmit = useCallback((text: string) => {
    if (!text.trim() || isProcessing) return
    setShowTextInput(false)
    handleUserMessage(text)
  }, [isProcessing, handleUserMessage])

  const activeTheme = selectedThemeId ? themes.find((t) => t.id === selectedThemeId) : null
  const conversationEnded = exchangeIndex > 5 && orbState === "idle"

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 w-full items-center px-4 sm:px-6 pt-1 sm:pt-2 pb-1.5 sm:pb-2 overflow-hidden">
        {/* Top controls row */}
        <div className="flex items-center justify-between w-full shrink-0 min-h-[44px]">
          <LanguagePill />
          {/* New conversation button */}
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-full text-[#A8A29E] hover:text-[#78716C] hover:bg-[#F5F1EC] transition-colors"
            whileTap={{ scale: 0.92 }}
            aria-label="New conversation"
          >
            <RotateCcw size={13} strokeWidth={2.5} />
            <span className="text-[11px] font-semibold">New</span>
          </motion.button>
        </div>

        {/* Active theme banner */}
        <AnimatePresence>
          {activeTheme && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 6 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full overflow-hidden shrink-0"
            >
              <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-[#FFF4ED] border border-[#FED7AA]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{activeTheme.emoji}</span>
                  <span className="text-xs font-bold text-[#C2410C] truncate">{activeTheme.title}</span>
                </div>
                <button
                  onClick={() => setSelectedThemeId(null)}
                  className="text-[11px] text-[#F97316] font-semibold hover:text-[#EA580C] transition-colors px-2 py-1 min-h-[32px] shrink-0"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orb section — flexible, absorbs leftover height */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 gap-1 sm:gap-1.5 py-1 w-full">
          <Orb state={orbState} />

          {/* Waveform (listening/thinking/speaking) — fixed slot to avoid jumps */}
          <div className="h-5 sm:h-6 flex items-center justify-center shrink-0">
            <AnimatePresence>
              {(orbState === "listening" || orbState === "thinking" || isListening || isTTSPlaying) && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <WaveformIndicator active={orbState === "listening" || isListening || isTTSPlaying} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Orb status text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={orbState}
              className="text-[13px] sm:text-sm font-medium text-[#A8A29E] leading-none"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              {statusText[orbState]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Current phrase / AI reply with TTS controls — reserved slot */}
        <div className="w-full shrink-0 min-h-[3.75rem] sm:min-h-[4.25rem] flex items-center justify-center">
          <CurrentPhrase
            exchange={currentExchange}
            language={language}
            onPlayTTS={handlePlayTTS}
            onStopTTS={handleStopTTS}
            isTTSPlaying={isTTSPlaying}
            ttsError={ttsError || ttsErrorState}
          />
        </div>

        {/* Speech status indicator */}
        <SpeechStatusIndicator
          state={speechState}
          transcript={lastTranscript}
          error={speechError}
          onRetry={startListening}
        />

        {/* Phase 4: scaffolding hint + help */}
        {(() => {
          const level = getScaffoldingLevel(stuckSignals);
          const hint = scaffoldingHint(level, language);
          if (!hint) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 px-3 py-1.5 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center gap-2 w-full shrink-0"
            >
              <span className="text-[12px] font-semibold text-[#9A3412] flex-1 min-w-0 truncate">{hint}</span>
              <button
                onClick={() => void handleUserMessage(
                  language === "zh" ? "我不懂，请帮帮我" : "Ich verstehe nicht, bitte hilf mir",
                  { helpRequested: true }
                )}
                disabled={isProcessing}
                className="text-[12px] font-bold text-white px-3 py-2 min-h-[36px] rounded-full disabled:opacity-50 shrink-0"
                style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
              >
                {language === "zh" ? "帮帮我" : "Hilfe"}
              </button>
            </motion.div>
          );
        })()}

        {/* LLM Error indicator */}
        <AnimatePresence>
          {llmError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 px-3 py-1.5 rounded-full bg-[#FEE2E2] border border-[#FECACA] shrink-0 max-w-full"
            >
              <p className="text-[12px] font-semibold text-[#B91C1C] truncate">
                AI temporarily unavailable — using fallback
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation ended nudge */}
        <AnimatePresence>
          {conversationEnded && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 px-3 py-1.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] shrink-0 max-w-full"
            >
              <p className="text-[12px] font-semibold text-[#166534] truncate">
                Great work! Tap <span className="font-bold">New</span> to practice again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons with TTS toggle */}
        <div className="mt-1 sm:mt-1.5 w-full shrink-0">
          <div className="flex items-center justify-center mb-0.5">
            <AutoPlayToggle 
              enabled={autoPlayTTS} 
              onToggle={() => setAutoPlayTTS(!autoPlayTTS)} 
            />
          </div>
          <ActionButtons
            isMicOn={isListening || speechState === "connecting" || speechState === "requesting-permission"}
            onMicToggle={handleMicToggle}
            onMeaning={() => currentExchange && setIsMeaningOpen(true)}
            onTranscript={() => setIsTranscriptOpen(true)}
          />
        </div>

        {/* Text Input Fallback (secondary) */}
        <AnimatePresence>
          {showTextInput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1 w-full shrink-0"
            >
              <TextInputFallback
                onSend={handleTextSubmit}
                disabled={isProcessing}
                placeholder={language === "zh" ? "Type in Chinese, pinyin, or English..." : "Type in German or English..."}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer hints — single compact line, hidden when typing */}
        {!showTextInput && (
          <div className="mt-1 text-center shrink-0 min-h-[1.25rem] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={isProcessing ? "processing" : speechState}
                className="text-[12px] sm:text-[13px] text-[#A8A29E] leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isProcessing
                  ? "AI is thinking..."
                  : speechState === "listening"
                  ? "Tap to stop listening"
                  : speechState === "connecting"
                  ? "Connecting..."
                  : speechState === "error"
                  ? "Microphone error — tap to retry"
                  : isTTSPlaying
                  ? "AI is speaking..."
                  : "Tap mic to speak · English welcome"}
              </motion.p>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-3 mt-0.5">
              {speechState !== "listening" && !isProcessing && (
                <button
                  onClick={() => setShowTextInput(true)}
                  className="text-[11px] text-[#C7BDB8] hover:text-[#A8A29E] transition-colors px-2 py-1 min-h-[28px]"
                >
                  Or type instead →
                </button>
              )}
              {!activeTheme && exchangeIndex === 0 && !llmError && speechState !== "error" && (
                <button
                  onClick={() => setActiveTab("themes")}
                  className="text-[11px] text-[#C7BDB8] hover:text-[#A8A29E] transition-colors px-2 py-1 min-h-[28px]"
                >
                  Pick a theme →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Panels (rendered outside the layout flow via fixed positioning) */}
      <MeaningPanel
        exchange={currentExchange}
        isOpen={isMeaningOpen}
        onClose={() => setIsMeaningOpen(false)}
      />
      <TranscriptPanel
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
      />
    </>
  )
}

// ─── Helper functions to parse AI response ────────────────────────────────────

function extractPinyin(content: string): string | undefined {
  const pinyinMatch = content.match(/[💡📖]?\s*Tip:?\s*([^。.]+?[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)/i)
  if (pinyinMatch) return pinyinMatch[1].trim()
  const pinyinPattern = /[a-zA-Z]+[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+/g
  const matches = content.match(pinyinPattern)
  return matches?.[0]
}

function extractTranslation(content: string): string {
  const translationMatch = content.match(/—\s*(.+?)(?:\s*[💡📖]|$)/)
  if (translationMatch) return translationMatch[1].trim()
  const parts = content.split(/[。.!?]/)
  return parts.length > 1 ? parts.slice(1).join(".").trim() : "Translation not available"
}

function extractBreakdown(content: string, language: "zh" | "de"): WordBreakdown[] {
  const breakdown: WordBreakdown[] = []

  if (language === "zh") {
    const tipMatches = content.matchAll(/💡\s*Tip:\s*([^。.]+)/g)
    for (const match of tipMatches) {
      const tip = match[1]
      const wordMatch = tip.match(/([\u4e00-\u9fff]+)\s*\(([^)]+)\)/)
      if (wordMatch) {
        breakdown.push({
          word: wordMatch[1],
          romanization: wordMatch[2],
          translation: tip.replace(wordMatch[0], "").trim(),
        })
      }
    }
  }

  return breakdown
}