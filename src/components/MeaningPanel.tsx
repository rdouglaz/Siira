import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import type { Exchange, WordBreakdown } from "../data/conversations"
import { useApp } from "../context/AppContext"

// Tone colors for Mandarin (classic mnemonic colors)
const toneColors: Record<number, string> = {
  1: "#EF4444", // Tone 1 — red (flat, like a steady line)
  2: "#F97316", // Tone 2 — orange (rising)
  3: "#22C55E", // Tone 3 — green (dipping)
  4: "#3B82F6", // Tone 4 — blue (falling)
  0: "#A8A29E", // Neutral — gray
}

function WordChip({ item, isZh }: { item: WordBreakdown; isZh: boolean }) {
  const toneColor = isZh && item.tone !== undefined ? toneColors[item.tone] : "#78716C"

  return (
    <div
      className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl"
      style={{
        background: "#F8F5F0",
        border: `1.5px solid ${isZh && item.tone !== undefined ? toneColors[item.tone] + "33" : "#F0EDE8"}`,
      }}
    >
      <span
        className="font-bold text-[#1C1917] leading-none"
        style={{
          fontSize: item.word.length <= 2 ? "1.5rem" : item.word.length <= 4 ? "1.1rem" : "0.9rem",
          fontFamily: isZh ? "inherit" : "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {item.word}
      </span>
      {item.romanization && (
        <span className="text-[11px] font-semibold leading-none mt-0.5" style={{ color: toneColor }}>
          {item.romanization}
        </span>
      )}
      <span className="text-[10px] text-[#A8A29E] leading-tight text-center mt-0.5">
        {item.translation}
      </span>
      {item.note && (
        <span className="text-[9px] text-[#C7BDB8] leading-tight text-center italic">{item.note}</span>
      )}
    </div>
  )
}

interface MeaningPanelProps {
  exchange: Exchange | null
  isOpen: boolean
  onClose: () => void
}

export function MeaningPanel({ exchange, isOpen, onClose }: MeaningPanelProps) {
  const { language } = useApp()
  const isZh = language === "zh"
  const sheetRef = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence>
      {isOpen && exchange && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(28, 25, 23, 0.3)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto overflow-hidden"
            style={{
              background: "white",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -8px 48px rgba(0,0,0,0.12)",
              maxHeight: "78vh",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E7E5E4]" />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <span
                className="text-[11px] font-bold tracking-widest text-[#A8A29E] uppercase"
              >
                Meaning
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#F5F5F4] flex items-center justify-center text-[#78716C] hover:bg-[#E7E5E4] transition-colors"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(78vh - 80px)" }}>
              {/* AI reply in target language */}
              <p
                className="font-bold text-[#1C1917] leading-snug mb-1"
                style={{
                  fontSize: exchange.aiText.length > 30 ? "1.35rem" : "1.6rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {exchange.aiText}
              </p>

              {/* Romanization */}
              {exchange.aiRomanization && (
                <p className="text-sm font-medium text-[#F97316] mb-1">{exchange.aiRomanization}</p>
              )}

              {/* Translation */}
              <p className="text-[15px] text-[#78716C] mb-5 leading-relaxed">{exchange.aiTranslation}</p>

              {/* What you said */}
              <div className="mb-5 px-3 py-2.5 rounded-xl" style={{ background: "#FFF4ED", border: "1px solid #FED7AA" }}>
                <p className="text-[10px] font-bold tracking-widest text-[#F97316] uppercase mb-1">You said</p>
                <p className="text-sm text-[#92400E] font-medium">{exchange.userText}</p>
              </div>

              {/* Word breakdown */}
              {exchange.breakdown.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-[#F0EDE8]" />
                    <span className="text-[10px] font-bold tracking-widest text-[#C7BDB8] uppercase">
                      Word by word
                    </span>
                    <div className="h-px flex-1 bg-[#F0EDE8]" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exchange.breakdown.map((item, i) => (
                      <WordChip key={i} item={item} isZh={isZh} />
                    ))}
                  </div>

                  {/* Tone guide (Chinese only) */}
                  {isZh && (
                    <div className="mt-4 px-3 py-2.5 rounded-xl bg-[#FAFAF9] border border-[#F0EDE8]">
                      <p className="text-[10px] font-bold tracking-widest text-[#C7BDB8] uppercase mb-2">
                        Tone guide
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {([1, 2, 3, 4] as const).map((t) => (
                          <div key={t} className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: toneColors[t] }}
                            />
                            <span className="text-[11px] text-[#78716C]">
                              Tone {t}
                              {t === 1 && " — flat"}
                              {t === 2 && " — rising"}
                              {t === 3 && " — dip-rise"}
                              {t === 4 && " — falling"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
