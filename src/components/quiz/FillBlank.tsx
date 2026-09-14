"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Lightbulb } from "lucide-react"
import type { FillBlankQuestion } from "@/lib/quiz/generator"
import { SpeakButton } from "./SpeakButton"

interface Props {
  question: FillBlankQuestion
  language: "zh" | "de"
  onNext: (correct: boolean) => void
}

export function FillBlank({ question, language, onNext }: Props) {
  const [value, setValue] = useState("")
  const [checked, setChecked] = useState(false)
  const correct =
    checked && value.trim().toLowerCase() === question.answer.trim().toLowerCase()

  function choose(text: string) {
    if (checked) return
    setValue(text)
  }

  function handleCheck() {
    if (!value.trim() || checked) return
    setChecked(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sentence card */}
      <div className="rounded-3xl bg-white p-6 text-center" style={{ border: "1.5px solid #F0EDE8" }}>
        <p
          className="font-bold text-[#1C1917] leading-snug"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.35rem" }}
        >
          {question.before}
          <span
            className="inline-block min-w-[72px] px-2 mx-1 rounded-lg align-baseline"
            style={{
              background: checked ? (correct ? "#DCFCE7" : "#FEE2E2") : "#FFF4ED",
              border: "1.5px dashed rgba(249,115,22,0.5)",
              color: checked ? (correct ? "#15803D" : "#B91C1C") : "#C2410C",
            }}
          >
            {checked ? question.answer : value || "___"}
          </span>
          {question.after}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[11px] text-[#A8A29E]">{question.hint}</span>
          <SpeakButton text={question.answer} language={language} />
        </div>
      </div>

      {/* Options (tap to fill) */}
      {!checked && (
        <div className="grid grid-cols-2 gap-2.5">
          {question.options.map((opt) => (
            <motion.button
              key={opt.id}
              onClick={() => choose(opt.text)}
              className="px-3 py-3 rounded-2xl text-sm font-bold bg-white"
              style={{
                border:
                  value === opt.text
                    ? "1.5px solid rgba(249,115,22,0.5)"
                    : "1.5px solid #F0EDE8",
                background: value === opt.text ? "#FFF4ED" : "white",
                color: "#1C1917",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {opt.text}
            </motion.button>
          ))}
        </div>
      )}

      {/* Type alternative */}
      {!checked && (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCheck()
          }}
          placeholder={language === "zh" ? "Type the missing word…" : "Type the missing word…"}
          className="w-full px-4 py-3 rounded-2xl border border-[#F0EDE8] bg-white text-[#1C1917] placeholder-[#C7BDB8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
        />
      )}

      {!checked ? (
        <motion.button
          onClick={handleCheck}
          disabled={!value.trim()}
          className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
          whileTap={{ scale: 0.98 }}
        >
          Check
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-4 py-3"
          style={{
            background: correct ? "#DCFCE7" : "#FEF3C7",
            border: "1.5px solid " + (correct ? "#BBF7D0" : "#FDE68A"),
          }}
        >
          <p
            className="text-sm font-bold flex items-center gap-1.5"
            style={{ color: correct ? "#15803D" : "#92400E" }}
          >
            {correct ? <Check size={16} strokeWidth={2.5} /> : <X size={16} strokeWidth={2.5} />}
            {correct ? "Correct — nice!" : `The answer is “${question.answer}”.`}
          </p>
          {!correct && (
            <p className="text-[12px] text-[#78716C] mt-1 flex items-start gap-1.5">
              <Lightbulb size={13} className="mt-0.5 flex-shrink-0" />
              {question.hint}
            </p>
          )}
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
