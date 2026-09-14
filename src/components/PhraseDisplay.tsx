import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "../context/AppContext"
import type { Language } from "../context/AppContext"

interface Phrase {
  target: string
  pinyin?: string
  translation: string
}

const phrases: Record<Language, Phrase[]> = {
  zh: [
    { target: "你好！", pinyin: "Nǐ hǎo!", translation: "Hello!" },
    { target: "谢谢你", pinyin: "Xièxie nǐ", translation: "Thank you" },
    { target: "再见", pinyin: "Zàijiàn", translation: "Goodbye" },
  ],
  de: [
    { target: "Hallo!", translation: "Hello!" },
    { target: "Danke schön", translation: "Thank you very much" },
    { target: "Auf Wiedersehen", translation: "Goodbye" },
  ],
}

interface PhraseDisplayProps {
  phraseIndex: number
}

export function PhraseDisplay({ phraseIndex }: PhraseDisplayProps) {
  const { language } = useApp()
  const phrase = phrases[language][phraseIndex % phrases[language].length]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${language}-${phraseIndex}`}
        className="flex flex-col items-center gap-1 py-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <span
          className="text-4xl font-bold tracking-tight text-[#1C1917]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {phrase.target}
        </span>
        {phrase.pinyin && (
          <span className="text-sm font-medium text-[#A8A29E] tracking-wide">{phrase.pinyin}</span>
        )}
        <span className="text-base text-[#78716C] font-medium">{phrase.translation}</span>
      </motion.div>
    </AnimatePresence>
  )
}
