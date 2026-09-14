"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Brain, Flame, Star, Volume2, GraduationCap, ChevronRight } from "lucide-react"
import { getWordsByLanguage, getCategories, getWordById, type WordEntry } from "@/data/word-inventory"
import { useApp } from "@/context/AppContext"
import { useWords, type SRSStatus } from "@/context/WordsContext"
import { ReviewSession } from "@/components/srs/ReviewSession"
import { useTTS } from "@/hooks/useTTS"
import { usePreloadAudio } from "@/hooks/usePreloadAudio"

// ─── SRS status dot ───────────────────────────────────────────────────────────

const statusDot: Record<SRSStatus, { bg: string; pulse: boolean }> = {
  new:      { bg: "#D6D3D1", pulse: false },
  learning: { bg: "#F59E0B", pulse: false },
  review:   { bg: "#F97316", pulse: true },
  mastered: { bg: "#22C55E", pulse: false },
}

function SRSDot({ status }: { status: SRSStatus }) {
  const { bg, pulse } = statusDot[status]
  return (
    <span className="relative flex-shrink-0">
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: bg, opacity: 0.4 }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span className="block w-2 h-2 rounded-full" style={{ background: bg }} />
    </span>
  )
}

// ─── Play button component ──────────────────────────────────────────────────────

interface PlayButtonProps {
  text: string
  language: "zh" | "de"
  className?: string
  onPlayingChange?: (playing: boolean) => void
}

function PlayButton({ text, language, className = "", onPlayingChange }: PlayButtonProps) {
  const { speak, stop, isPlaying, state } = useTTS({ language })
  const [localPlaying, setLocalPlaying] = useState(false)

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (localPlaying || isPlaying) {
      stop()
      setLocalPlaying(false)
      onPlayingChange?.(false)
    } else {
      setLocalPlaying(true)
      onPlayingChange?.(true)
      try {
        await speak(text, { language })
      } catch (err) {
        console.warn("TTS failed:", err)
      } finally {
        if (state.status === "idle") {
          setLocalPlaying(false)
          onPlayingChange?.(false)
        }
      }
    }
  }, [text, language, speak, stop, isPlaying, state.status, localPlaying])

  // Sync with global TTS state
  useEffect(() => {
    setLocalPlaying(isPlaying)
  }, [isPlaying])

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center p-1.5 min-w-[32px] min-h-[32px] rounded-xl transition-colors ${
        localPlaying
          ? "bg-[#FEF3C7] text-[#F97316]"
          : "bg-white text-[#A8A29E] hover:bg-[#FEF3C7] hover:text-[#F97316]"
      } ${className}`}
      aria-label={localPlaying ? "Stop pronunciation" : "Play pronunciation"}
      style={{ border: "1.5px solid #F0EDE8" }}
    >
      <Volume2 size={localPlaying ? 16 : 14} strokeWidth={2.5} />
      {localPlaying && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F97316] animate-ping opacity-75" />
      )}
    </button>
  )
}

// ─── Word card components ─────────────────────────────────────────────────────

interface CardProps {
  word: { id: string; text: string; romanization?: string; translation: string }
  learned: boolean
  srsStatus?: SRSStatus
  onToggle: () => void
  language: "zh" | "de"
  onPlay?: (playing: boolean) => void
}

function CharCard({ word, learned, srsStatus, onToggle, language, onPlay }: CardProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative flex flex-col items-center justify-center gap-1 rounded-2xl p-3 aspect-square text-center"
      style={{
        background: learned ? "#FFF4ED" : "white",
        border: learned ? "1.5px solid rgba(249,115,22,0.35)" : "1.5px solid #F0EDE8",
        boxShadow: learned ? "0 2px 12px rgba(249,115,22,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
      whileTap={{ scale: 0.91 }}
    >
      <div className="flex flex-col items-center gap-0.5 flex-1">
        <span
          className="font-bold leading-none"
          style={{
            fontSize: word.text.length === 1 ? "2rem" : word.text.length <= 3 ? "1.35rem" : "1.1rem",
            color: learned ? "#F97316" : "#1C1917",
            fontFamily: word.romanization ? "inherit" : "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {word.text}
        </span>
        {word.romanization && (
          <span className="text-[10px] text-[#A8A29E] font-medium leading-tight">{word.romanization}</span>
        )}
        <span className="text-[10px] text-[#78716C] leading-tight">{word.translation}</span>
      </div>

      {/* Top right: Play button + SRS status + Learned check */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        <PlayButton text={word.text} language={language} />
        {/* SRS status dot */}
        {srsStatus && srsStatus !== "new" && (
          <span className="flex-shrink-0">
            <SRSDot status={srsStatus} />
          </span>
        )}
        {/* Learned check */}
        {learned && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle2 size={12} className="text-[#F97316]" strokeWidth={2} />
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}

function PhraseRow({ word, learned, srsStatus, onToggle, language, onPlay }: CardProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
      style={{
        background: learned ? "#FFF9F5" : "white",
        border: learned ? "1.5px solid rgba(249,115,22,0.3)" : "1.5px solid #F0EDE8",
        boxShadow: learned ? "0 2px 12px rgba(249,115,22,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
      whileTap={{ scale: 0.97 }}
    >
      {srsStatus && srsStatus !== "new" && (
        <span className="flex-shrink-0">
          <SRSDot status={srsStatus} />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm leading-snug"
          style={{ color: learned ? "#C2410C" : "#1C1917", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {word.text}
        </p>
        {word.romanization && (
          <p className="text-[11px] text-[#A8A29E] mt-0.5 font-medium">{word.romanization}</p>
        )}
        <p className="text-[12px] text-[#78716C] mt-0.5">{word.translation}</p>
      </div>
      <div className="flex items-center gap-2">
        <PlayButton text={word.text} language={language} />
        <motion.div animate={{ opacity: learned ? 1 : 0 }} className="flex-shrink-0">
          <CheckCircle2 size={18} className="text-[#F97316]" strokeWidth={2} />
        </motion.div>
      </div>
    </motion.button>
  )
}

// ─── Category tab chip ────────────────────────────────────────────────────────

function CategoryTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold"
      style={{ color: active ? "white" : "#78716C" }}
    >
      {active && (
        <motion.div
          layoutId="category-pill"
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

// ─── Word grid / phrase list ──────────────────────────────────────────────────

function WordGrid({ category, learnedSet, getCardStatus, onToggle, language }: {
  category: { id: string; label: string; words: { id: string; text: string; romanization?: string; translation: string }[] }
  learnedSet: Set<string>
  getCardStatus: (id: string) => SRSStatus | undefined
  onToggle: (id: string) => void
  language: "zh" | "de"
}) {
  const isPhrases = category.id === "phrases"
  const [playingIds, setPlayingIds] = useState<Set<string>>(new Set())

  const handlePlayChange = useCallback((id: string, playing: boolean) => {
    setPlayingIds(prev => {
      const next = new Set(prev)
      if (playing) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {isPhrases ? (
          <div className="flex flex-col gap-2.5">
            {category.words.map((word) => (
              <PhraseRow
                key={word.id}
                word={word}
                learned={learnedSet.has(word.id)}
                srsStatus={getCardStatus(word.id)}
                onToggle={() => onToggle(word.id)}
                language={language}
                onPlay={(playing) => {
                  if (playing) setPlayingIds(prev => new Set(prev).add(word.id))
                  else setPlayingIds(prev => { const n = new Set(prev); n.delete(word.id); return n })
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {category.words.map((word) => (
              <CharCard
                key={word.id}
                word={word}
                learned={learnedSet.has(word.id)}
                srsStatus={getCardStatus(word.id)}
                onToggle={() => onToggle(word.id)}
                language={language}
                onPlay={(playing) => {
                  if (playing) setPlayingIds(prev => new Set(prev).add(word.id))
                  else setPlayingIds(prev => { const n = new Set(prev); n.delete(word.id); return n })
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ mastered, learned, total }: { mastered: number; learned: number; total: number }) {
  const pct = total > 0 ? ((mastered + learned) / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #F97316, #C026D3)" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[12px] font-semibold text-[#A8A29E] tabular-nums flex-shrink-0">
        {mastered + learned} / {total}
      </span>
    </div>
  )
}

// ─── Review queue banner ──────────────────────────────────────────────────────

function ReviewBanner({ dueCount, hasCards, onStart }: { dueCount: number; hasCards: boolean; onStart: () => void }) {
  if (!hasCards) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
        style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA" }}
      >
        <Brain size={18} className="text-[#F97316] flex-shrink-0" strokeWidth={2} />
        <div className="flex-1">
          <p className="text-sm font-bold text-[#1C1917]">No reviews yet</p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Practice a conversation or tap words you know — reviews appear here.</p>
        </div>
      </div>
    )
  }

  if (dueCount === 0) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
        style={{ background: "#DCFCE7", border: "1.5px solid #BBF7D0" }}
      >
        <Star size={18} className="text-[#16A34A] flex-shrink-0" strokeWidth={2} />
        <div className="flex-1">
          <p className="text-sm font-bold text-[#15803D]">All caught up!</p>
          <p className="text-[11px] text-[#16A34A] mt-0.5">No reviews due today. Come back tomorrow.</p>
        </div>
        <span className="text-xl">🎉</span>
      </div>
    )
  }

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
      style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(192,38,211,0.06) 100%)",
        border: "1.5px solid rgba(249,115,22,0.22)",
      }}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
      >
        <Brain size={18} className="text-white" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#1C1917]">
          {dueCount} {dueCount === 1 ? "word" : "words"} due today
        </p>
        <p className="text-[11px] text-[#78716C] mt-0.5">Keep your streak going — review now</p>
      </div>
      <motion.button
        onClick={onStart}
        className="px-3 py-1.5 rounded-full text-white text-xs font-bold flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
        whileTap={{ scale: 0.93 }}
      >
        Start
      </motion.button>
    </motion.div>
  )
}

// ─── Quizzes entry banner ─────────────────────────────────────────────────────

function QuizBanner() {
  const { setActiveTab } = useApp()
  return (
    <motion.button
      onClick={() => setActiveTab("quiz")}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 text-left"
      style={{
        background: "linear-gradient(135deg, #FFF4ED 0%, #FDE8FF 55%, #EDE9FF 100%)",
        border: "1px solid rgba(249,115,22,0.22)",
        boxShadow: "0 4px 24px rgba(249,115,22,0.10), 0 1px 4px rgba(0,0,0,0.04)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
      >
        <GraduationCap size={18} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#1C1917]">Practice with quizzes</p>
        <p className="text-[11px] text-[#78716C] mt-0.5">Multiple choice · Matching · Fill in the blank</p>
      </div>
      <ChevronRight size={16} className="text-[#F97316] flex-shrink-0" strokeWidth={2.5} />
    </motion.button>
  )
}

// ─── SRS legend ───────────────────────────────────────────────────────────────

function SRSLegend() {
  return (
    <div className="flex items-center gap-4 mb-3 px-1">
      {([ ["#F97316", "Due"], ["#F59E0B", "Learning"], ["#22C55E", "Mastered"] ] as const).map(([color, label]) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-[10px] text-[#A8A29E] font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Streak chip ──────────────────────────────────────────────────────────────

function StreakChip({ mastered }: { mastered: number }) {
  if (mastered === 0) return null
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7" }}>
      <Flame size={11} className="text-[#D97706]" strokeWidth={2} />
      <span className="text-[11px] font-bold text-[#B45309]">{mastered} mastered</span>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function WordsScreen() {
  const { language } = useApp()
  const { cards, getDueCards, getCard, learnedSet, toggleLearned } = useWords()
  const categories = getCategories(language).map(cat => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
    words: getWordsByLanguage(language).filter(w => w.category === cat).map(w => ({
      id: w.id,
      text: w.target,
      romanization: w.romanization,
      translation: w.meaning,
    }))
  }))
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || "")
  const [inReview, setInReview] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveCategoryId(getCategories(language)[0] || "")
    setInReview(false)
  }, [language])

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0]

  // Phase 2: background pre-generate/cache audio for visible category (on-device storage)
  usePreloadAudio(
    (activeCategory?.words ?? []).map((w) => ({ text: w.text, language })),
    !inReview,
    20
  )

  const totalWords = getWordsByLanguage(language).length
  const dueCards = getDueCards(language)
  const dueCount = dueCards.length

  // Count mastered across all SRS cards for this language
  const masteredCount = getWordsByLanguage(language)
    .filter((w) => getCard(w.id)?.status === "mastered").length

  const learnedCount = learnedSet.size

  function getCardStatus(wordId: string): SRSStatus | undefined {
    return getCard(wordId)?.status
  }

  return (
    <AnimatePresence mode="wait">
      {inReview ? (
        <motion.div
          key="review"
          className="flex flex-col flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <ReviewSession onClose={() => setInReview(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="browse"
          className="flex flex-col flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {/* Sticky header */}
          <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 bg-[#FDFBF7] flex-shrink-0">
            {/* Title row */}
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <h1
                className="text-[22px] sm:text-2xl font-bold text-[#1C1917] leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Words
              </h1>
              <StreakChip mastered={masteredCount} />
            </div>

            {/* Progress bar */}
            <div className="mb-3 sm:mb-4">
              <ProgressBar mastered={masteredCount} learned={learnedCount} total={totalWords} />
            </div>

            {/* Review banner */}
            <ReviewBanner dueCount={dueCount} hasCards={Object.keys(cards).length > 0} onStart={() => setInReview(true)} />

            {/* Quizzes entry */}
            <QuizBanner />

            {/* SRS legend */}
            <SRSLegend />

            {/* Category tabs */}
            <div
              ref={tabsRef}
              className="flex gap-1 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((cat) => (
                <CategoryTab
                  key={cat.id}
                  label={cat.label}
                  active={activeCategoryId === cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Scrollable word grid */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-4">
            <WordGrid
              category={activeCategory}
              learnedSet={learnedSet}
              getCardStatus={getCardStatus}
              onToggle={toggleLearned}
              language={language}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}