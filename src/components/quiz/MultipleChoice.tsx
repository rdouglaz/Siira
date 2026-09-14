"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import type { MCQQuestion } from "@/lib/quiz/generator"
import { SpeakButton } from "./SpeakButton"

interface Props {
  question: MCQQuestion
  language: "zh" | "de"
  onNext: (correct: boolean) => void
}

export function MultipleChoice({ question, language, onNext }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const answered = selectedId !== null
  const correct = answered && selectedId === question.answerId

  function handleSelect(id: string) {
    if (answered) return
    setSelectedId(id)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt card */}
      <div className="rounded-3xl bg-white p-6 text-center" style={{ border: "1.5px solid #F0EDE8" }}>
        <div className="flex items-center justify-center gap-2">
          <span
            className="font-bold text-[#1C1917] leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "2rem" }}
          >
            {question.prompt}
          </span>
          {question.direction === "target-to-meaning" && (
            <SpeakButton text={question.prompt} language={language} />
          )}
        </div>
        {question.promptSub && question.direction === "target-to-meaning" && (
          <p className="text-sm font-medium text-[#F97316] mt-1">{question.promptSub}</p>
        )}
        <p className="text-[11px] text-[#C7BDB8] mt-2">
          {question.direction === "target-to-meaning"
            ? `What does this mean in English?`
            : `Which word means this in ${language === "zh" ? "Chinese" : "German"}?`}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isAnswer = opt.id === question.answerId
          const isSelected = opt.id === selectedId
          const showCorrect = answered && isAnswer
          const showWrong = answered && isSelected && !isAnswer

          return (
            <motion.button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left font-semibold text-sm"
              style={{
                background: showCorrect ? "#DCFCE7" : showWrong ? "#FEE2E2" : "white",
                border: showCorrect
                  ? "1.5px solid #86EFAC"
                  : showWrong
                    ? "1.5px solid #FECACA"
                    : "1.5px solid #F0EDE8",
                color: showCorrect ? "#15803D" : showWrong ? "#B91C1C" : "#1C1917",
              }}
              whileTap={answered ? {} : { scale: 0.98 }}
            >
              <span className="flex-1">{opt.text}</span>
              {showCorrect && <Check size={18} strokeWidth={2.5} />}
              {showWrong && <X size={18} strokeWidth={2.5} />}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback + next */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-4 py-3"
          style={{ background: correct ? "#DCFCE7" : "#FEF3C7", border: "1.5px solid " + (correct ? "#BBF7D0" : "#FDE68A") }}
        >
          <p className="text-sm font-bold" style={{ color: correct ? "#15803D" : "#92400E" }}>
            {correct ? "Correct — nice!" : "Not quite — good try."}
          </p>
          <p className="text-[12px] text-[#78716C] mt-1">{question.explanation}</p>
          <motion.button
            onClick={() => onNext(correct)}
            className="mt-3 w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
            whileTap={{ scale: 0.98 }}
          >
            Next
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
