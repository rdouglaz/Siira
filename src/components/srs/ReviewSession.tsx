import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Mic, X, Sparkles, Volume2 } from "lucide-react"
import { RatingButtons } from "./RatingButtons"
import { useWords, type SRSCard, type SRSRating } from "../../context/WordsContext"
import { getWordById, type WordEntry } from "../../data/word-inventory"
import { useApp } from "../../context/AppContext"
import { useTTS } from "../../hooks/useTTS"
import { usePronunciation } from "../../hooks/usePronunciation"
import { PronunciationFeedback } from "../PronunciationFeedback"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewItem {
  card: SRSCard
  word: WordEntry
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusStyle = {
  new:      { bg: "#F5F5F4", text: "#78716C",  label: "New" },
  learning: { bg: "#FEF3C7", text: "#B45309",  label: "Learning" },
  review:   { bg: "#EDE9FE", text: "#6D28D9",  label: "Review" },
  mastered: { bg: "#DCFCE7", text: "#15803D",  label: "Mastered" },
}

// ─── Play button for review card ──────────────────────────────────────────────

function ReviewPlayButton({ text, language }: { text: string; language: "zh" | "de" }) {
  const { speak, stop, isPlaying, state } = useTTS({ language })
  const [localPlaying, setLocalPlaying] = useState(false)

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (localPlaying || isPlaying) {
      stop()
      setLocalPlaying(false)
    } else {
      setLocalPlaying(true)
      try {
        await speak(text, { language })
      } catch (err) {
        console.warn("TTS failed:", err)
      } finally {
        if (state.status === "idle") {
          setLocalPlaying(false)
        }
      }
    }
  }, [text, language, speak, stop, isPlaying, state.status, localPlaying])

  useEffect(() => {
    setLocalPlaying(isPlaying)
  }, [isPlaying])

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center p-2 rounded-xl transition-colors ${
        localPlaying
          ? "bg-[#FEF3C7] text-[#F97316]"
          : "bg-white text-[#A8A29E] hover:bg-[#FEF3C7] hover:text-[#F97316]"
      }`}
      aria-label={localPlaying ? "Stop pronunciation" : "Play pronunciation"}
      style={{ border: "1.5px solid #F0EDE8" }}
    >
      <Volume2 size={localPlaying ? 18 : 16} strokeWidth={2.5} />
      {localPlaying && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F97316] animate-ping opacity-75" />
      )}
    </button>
  )
}

// ─── Individual review card ───────────────────────────────────────────────────

interface ReviewCardProps {
  item: ReviewItem
  isZh: boolean
  onRate: (rating: SRSRating) => void
  cardKey: string
}

function ReviewCard({ item, isZh, onRate, cardKey }: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false)
  const { word, card } = item
  const style = statusStyle[card.status]
  const { checking, result, error, check, reset } = usePronunciation(isZh ? "zh" : "de")

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardKey]);

  return (
    <motion.div
      key={cardKey}
      className="flex flex-col flex-1 w-full"
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -48, scale: 0.96 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {/* Status badge */}
      <div className="flex justify-center mb-4">
        <span
          className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
          style={{ background: style.bg, color: style.text }}
        >
          {style.label}
        </span>
      </div>

      {/* Card face */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center rounded-3xl mx-1 cursor-pointer select-none relative overflow-hidden"
        style={{
          background: "white",
          border: "1.5px solid #F0EDE8",
          boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          minHeight: 280,
        }}
        onClick={() => !revealed && setRevealed(true)}
        whileTap={!revealed ? { scale: 0.98 } : {}}
      >
        {/* Front: word side */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="front"
              className="flex flex-col items-center justify-center gap-3 p-8 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Main word */}
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-[#1C1917] text-center leading-none"
                  style={{
                    fontSize:
                      word.target.length === 1 ? "5rem"
                      : word.target.length <= 3 ? "3.2rem"
                      : word.target.length <= 6 ? "2.2rem"
                      : "1.6rem",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {word.target}
                </span>
                <ReviewPlayButton text={word.target} language={isZh ? "zh" : "de"} />
              </div>

              {/* Romanization */}
              {word.romanization && (
                <span className="text-lg font-semibold text-[#F97316]">{word.romanization}</span>
              )}

              {/* Tap hint */}
              <div className="flex flex-col items-center gap-1 mt-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#D6D3D1]"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-[#C7BDB8] font-medium">Tap to reveal</span>
              </div>

              {/* Corner gradient accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-16 rounded-b-3xl"
                style={{ background: "linear-gradient(to top, rgba(253,251,247,0.8), transparent)" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="flex flex-col items-center justify-center gap-4 p-8 w-full h-full"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Small reminder of the word */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-[#1C1917]"
                    style={{
                      fontSize: word.target.length <= 3 ? "1.35rem" : "1.1rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {word.target}
                  </span>
                  <ReviewPlayButton text={word.target} language={isZh ? "zh" : "de"} />
                </div>
                {word.romanization && (
                  <span className="text-sm font-medium text-[#F97316]">{word.romanization}</span>
                )}
              </div>

              {/* Divider */}
              <div className="w-12 h-px bg-[#F0EDE8]" />

              {/* Meaning — the big reveal */}
              <span
                className="font-bold text-[#1C1917] text-center leading-tight"
                style={{
                  fontSize: word.meaning.length > 20 ? "1.5rem" : "2rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {word.meaning}
              </span>

              {isZh && word.romanization && (
                <div
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#92400E]"
                  style={{ background: "#FEF3C7" }}
                >
                  {isZh ? "Mandarin Chinese" : "German"}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pronunciation practice — after reveal */}
      {revealed && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <motion.button
              onClick={() => void check(word.target)}
              disabled={checking}
              className="px-4 py-2 rounded-full text-xs font-bold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
              whileTap={{ scale: 0.95 }}
            >
              {checking ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" /> Listening…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Mic size={14} /> Check pronunciation
                </span>
              )}
            </motion.button>
          </div>
          {error && <p className="text-[12px] text-[#DC2626] text-center">{error.message}</p>}
          <PronunciationFeedback result={result} />
        </div>
      )}

      {/* Rating buttons — slide up after reveal */}
      <div className="mt-4">
        <AnimatePresence>
          {revealed ? (
            <RatingButtons onRate={onRate} />
          ) : (
            <motion.p
              className="text-center text-[12px] text-[#C7BDB8] pb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              How well did you know this?
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Done screen ──────────────────────────────────────────────────────────────

function DoneScreen({ count, onClose }: { count: number; onClose: () => void }) {
  return (
    <motion.div
      className="flex flex-col flex-1 items-center justify-center gap-6 px-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(192,38,211,0.12) 100%)",
        }}
      >
        <Sparkles size={32} className="text-[#F97316]" />
      </div>

      {/* Copy */}
      <div className="text-center">
        <h2
          className="text-2xl font-bold text-[#1C1917] mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Session complete!
        </h2>
        <p className="text-[#78716C] text-base">
          You reviewed{" "}
          <span className="font-bold text-[#1C1917]">{count}</span>{" "}
          {count === 1 ? "word" : "words"} today.
        </p>
        <p className="text-sm text-[#A8A29E] mt-2">
          Your next review is scheduled automatically.
        </p>
      </div>

      {/* Back button */}
      <motion.button
        onClick={onClose}
        className="px-8 py-3 rounded-full font-bold text-white text-sm"
        style={{
          background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
          boxShadow: "0 4px 20px rgba(249,115,22,0.25)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Words
      </motion.button>
    </motion.div>
  )
}

// ─── Main ReviewSession component ─────────────────────────────────────────────

interface ReviewSessionProps {
  onClose: () => void
}

export function ReviewSession({ onClose }: ReviewSessionProps) {
  const { language } = useApp()
  const { getDueCards, rateCard } = useWords()
  const isZh = language === "zh"

  // Build session queue once on mount — snapshot of due cards
  const initialQueue = useMemo<ReviewItem[]>(() => {
    const due = getDueCards(language)
    return due
      .map((card) => {
        const word = getWordById(language, card.wordId)
        return word ? { card, word } : null
      })
      .filter(Boolean) as ReviewItem[]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once

  const [queue, setQueue] = useState<ReviewItem[]>(initialQueue)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [direction, setDirection] = useState(1)

  const isDone = currentIdx >= queue.length
  const current = queue[currentIdx]
  const progress = reviewedCount / Math.max(initialQueue.length, 1)

  function handleRate(rating: SRSRating) {
    if (!current) return

    rateCard(current.card.wordId, rating)

    if (rating === "again") {
      // Push back to end of session queue for another chance
      setQueue((q) => [...q, { ...current, card: { ...current.card } }])
    } else {
      setReviewedCount((n) => n + 1)
    }

    setDirection(1)
    setCurrentIdx((i) => i + 1)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Session header */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F4] flex items-center justify-center text-[#78716C] hover:bg-[#E7E5E4] transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>

          {!isDone && (
            <span className="text-sm font-semibold text-[#A8A29E]">
              {currentIdx + 1} / {queue.length}
            </span>
          )}

          <div className="w-8" /> {/* Spacer to center the counter */}
        </div>

        {/* Progress bar */}
        {!isDone && (
          <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #F97316, #C026D3)" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {/* Card area */}
      <div className="flex flex-col flex-1 px-5 pb-5 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {isDone ? (
            <DoneScreen key="done" count={reviewedCount} onClose={onClose} />
          ) : (
            <ReviewCard
              key={`${current.card.wordId}-${currentIdx}`}
              cardKey={`${current.card.wordId}-${currentIdx}`}
              item={current}
              isZh={isZh}
              onRate={handleRate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}