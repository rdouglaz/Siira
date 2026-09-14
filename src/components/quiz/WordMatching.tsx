"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import type { MatchingPair } from "@/lib/quiz/generator"

interface Props {
  pairs: MatchingPair[]
  onComplete: (correctFirstTry: number, mistakes: number) => void
}

export function WordMatching({ pairs, onComplete }: Props) {
  const rightOrder = useMemo(() => {
    const arr = [...pairs]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [pairs])

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongKey, setWrongKey] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const done = matched.size === pairs.length

  function attempt(leftId: string | null, rightId: string | null) {
    if (!leftId || !rightId || done) return
    if (leftId === rightId) {
      const next = new Set(matched)
      next.add(leftId)
      setMatched(next)
      setSelectedLeft(null)
      setSelectedRight(null)
      setWrongKey(null)
    } else {
      setMistakes((m) => m + 1)
      setWrongKey(`${leftId}:${rightId}`)
      setTimeout(() => {
        setSelectedLeft(null)
        setSelectedRight(null)
        setWrongKey(null)
      }, 450)
    }
  }

  function tapLeft(id: string) {
    if (matched.has(id)) return
    if (selectedLeft === id) {
      setSelectedLeft(null)
      return
    }
    const next = id
    setSelectedLeft(next)
    if (selectedRight) attempt(next, selectedRight)
  }

  function tapRight(id: string) {
    if (matched.has(id)) return
    if (selectedRight === id) {
      setSelectedRight(null)
      return
    }
    const next = id
    setSelectedRight(next)
    if (selectedLeft) attempt(selectedLeft, next)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-[#A8A29E] text-center">
        Tap a word, then its meaning. Match all {pairs.length} pairs.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Left: target words */}
        <div className="flex flex-col gap-2.5">
          {pairs.map((p) => {
            const isMatched = matched.has(p.id)
            const isSelected = selectedLeft === p.id
            const isWrong = wrongKey?.startsWith(p.id + ":")
            return (
              <motion.button
                key={"L" + p.id}
                onClick={() => tapLeft(p.id)}
                disabled={isMatched}
                className="px-3 py-3 rounded-2xl text-sm font-bold text-center"
                style={{
                  background: isMatched ? "#DCFCE7" : isWrong ? "#FEE2E2" : isSelected ? "#FFF4ED" : "white",
                  border: isMatched
                    ? "1.5px solid #86EFAC"
                    : isWrong
                      ? "1.5px solid #FECACA"
                      : isSelected
                        ? "1.5px solid rgba(249,115,22,0.5)"
                        : "1.5px solid #F0EDE8",
                  color: isMatched ? "#15803D" : "#1C1917",
                  opacity: isMatched ? 0.85 : 1,
                }}
                whileTap={isMatched ? {} : { scale: 0.96 }}
              >
                <span className="block truncate">{p.left}</span>
                {p.leftSub && <span className="block text-[10px] font-medium text-[#F97316] truncate">{p.leftSub}</span>}
                {isMatched && <Check size={14} className="mx-auto mt-1 text-[#16A34A]" strokeWidth={2.5} />}
              </motion.button>
            )
          })}
        </div>

        {/* Right: meanings */}
        <div className="flex flex-col gap-2.5">
          {rightOrder.map((p) => {
            const isMatched = matched.has(p.id)
            const isSelected = selectedRight === p.id
            const isWrong = wrongKey?.endsWith(":" + p.id)
            return (
              <motion.button
                key={"R" + p.id}
                onClick={() => tapRight(p.id)}
                disabled={isMatched}
                className="px-3 py-3 rounded-2xl text-sm font-semibold text-center min-h-[52px] flex items-center justify-center"
                style={{
                  background: isMatched ? "#DCFCE7" : isWrong ? "#FEE2E2" : isSelected ? "#FFF4ED" : "white",
                  border: isMatched
                    ? "1.5px solid #86EFAC"
                    : isWrong
                      ? "1.5px solid #FECACA"
                      : isSelected
                        ? "1.5px solid rgba(249,115,22,0.5)"
                        : "1.5px solid #F0EDE8",
                  color: isMatched ? "#15803D" : "#1C1917",
                  opacity: isMatched ? 0.85 : 1,
                }}
                whileTap={isMatched ? {} : { scale: 0.96 }}
              >
                <span className="line-clamp-2">{p.right}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <p className="text-[12px] text-[#A8A29E] text-center tabular-nums">
        {matched.size} / {pairs.length} matched · {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}
      </p>

      {done && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onComplete(pairs.length - Math.min(mistakes, pairs.length), mistakes)}
          className="w-full py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
          whileTap={{ scale: 0.98 }}
        >
          See results
        </motion.button>
      )}
    </div>
  )
}
