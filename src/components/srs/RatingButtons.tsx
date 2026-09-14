import { motion } from "framer-motion"
import type { SRSRating } from "../../context/WordsContext"

interface RatingConfig {
  rating: SRSRating
  label: string
  sublabel: string
  bg: string
  activeBg: string
  text: string
  border: string
}

const ratings: RatingConfig[] = [
  { rating: "again",  label: "Again",  sublabel: "< 1 day",  bg: "#FEE2E2", activeBg: "#FECACA", text: "#B91C1C", border: "#FECACA" },
  { rating: "hard",   label: "Hard",   sublabel: "2 days",   bg: "#FEF3C7", activeBg: "#FDE68A", text: "#B45309", border: "#FDE68A" },
  { rating: "good",   label: "Good",   sublabel: "1 week",   bg: "#DCFCE7", activeBg: "#BBF7D0", text: "#15803D", border: "#BBF7D0" },
  { rating: "easy",   label: "Easy",   sublabel: "2+ weeks", bg: "#DBEAFE", activeBg: "#BFDBFE", text: "#1D4ED8", border: "#BFDBFE" },
]

interface RatingButtonsProps {
  onRate: (rating: SRSRating) => void
}

export function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <motion.div
      className="flex gap-2.5 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
    >
      {ratings.map(({ rating, label, sublabel, bg, activeBg, text, border }) => (
        <motion.button
          key={rating}
          onClick={() => onRate(rating)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 rounded-2xl font-semibold transition-colors duration-150"
          style={{ background: bg, border: `1.5px solid ${border}`, color: text }}
          whileHover={{ background: activeBg }}
          whileTap={{ scale: 0.93, background: activeBg }}
        >
          <span className="text-sm font-bold">{label}</span>
          <span className="text-[10px] font-medium opacity-70">{sublabel}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
