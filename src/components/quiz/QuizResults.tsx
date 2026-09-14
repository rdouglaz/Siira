"use client"

import { motion } from "framer-motion"
import { Sparkles, RotateCcw, LayoutGrid, BookOpen } from "lucide-react"

interface Props {
  score: number
  total: number
  best: number | null
  isNewBest: boolean
  onRetry: () => void
  onOther: () => void
  onWords: () => void
}

function messageFor(pct: number): string {
  if (pct >= 90) return "Outstanding — you're on fire!"
  if (pct >= 70) return "Great work — keep the streak going!"
  if (pct >= 50) return "Good effort — practice makes permanent."
  return "Every attempt counts — try again!"
}

export function QuizResults({ score, total, best, isNewBest, onRetry, onOther, onWords }: Props) {
  const pct = Math.round((score / Math.max(total, 1)) * 100)

  return (
    <motion.div
      className="flex flex-col flex-1 items-center justify-center gap-5 px-6 py-8"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(192,38,211,0.12) 100%)" }}
      >
        <Sparkles size={32} className="text-[#F97316]" />
      </div>

      <div className="text-center">
        <p className="text-[11px] font-bold tracking-widest text-[#C7BDB8] uppercase">Your score</p>
        <p
          className="font-bold text-[#1C1917] tabular-nums"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "3rem", lineHeight: 1 }}
        >
          {score}
          <span className="text-[#A8A29E] text-2xl">/{total}</span>
        </p>
        <p className="text-sm text-[#78716C] mt-2">{messageFor(pct)}</p>
        <p className="text-[12px] text-[#A8A29E] mt-1">
          {isNewBest ? "New personal best!" : best !== null ? `Best: ${best}%` : `${pct}%`}
        </p>
      </div>

      <div className="w-full flex flex-col gap-2.5">
        <motion.button
          onClick={onRetry}
          className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw size={16} strokeWidth={2.5} /> Retry quiz
        </motion.button>
        <motion.button
          onClick={onOther}
          className="w-full py-3 rounded-xl font-bold text-sm bg-white text-[#1C1917] flex items-center justify-center gap-2"
          style={{ border: "1.5px solid #F0EDE8" }}
          whileTap={{ scale: 0.98 }}
        >
          <LayoutGrid size={16} strokeWidth={2} /> Try another quiz
        </motion.button>
        <motion.button
          onClick={onWords}
          className="w-full py-3 rounded-xl font-semibold text-sm text-[#78716C]"
          whileTap={{ scale: 0.98 }}
        >
          <span className="inline-flex items-center gap-2">
            <BookOpen size={14} strokeWidth={2} /> Review words
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
