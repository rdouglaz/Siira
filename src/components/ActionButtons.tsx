import { motion } from "framer-motion"
import { MessageSquare, Mic, MicOff, FileText } from "lucide-react"

interface SideButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

function SideButton({ icon, label, onClick }: SideButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[64px] min-h-[44px]"
      whileTap={{ scale: 0.93 }}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-[#F0EDE8] shadow-sm flex items-center justify-center text-[#78716C] hover:bg-[#F8F5F0] hover:text-[#44403C] transition-colors duration-200">
        {icon}
      </div>
      <span className="text-[11px] sm:text-xs font-medium text-[#A8A29E]">{label}</span>
    </motion.button>
  )
}

interface ActionButtonsProps {
  isMicOn: boolean
  onMicToggle: () => void
  onMeaning?: () => void
  onTranscript?: () => void
}

export function ActionButtons({ isMicOn, onMicToggle, onMeaning, onTranscript }: ActionButtonsProps) {
  return (
    <div className="flex items-start justify-center gap-5 min-[380px]:gap-6 sm:gap-8 py-1">
      <SideButton icon={<MessageSquare size={20} strokeWidth={1.75} />} label="Meaning" onClick={onMeaning} />

      {/* Main mic button */}
      <motion.button
        onClick={onMicToggle}
        className="flex flex-col items-center gap-1 min-w-[80px] min-h-[44px]"
        whileTap={{ scale: 0.91 }}
      >
        <motion.div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
          style={{
            background: isMicOn
              ? "linear-gradient(135deg, #EA580C 0%, #9333EA 100%)"
              : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
            boxShadow: isMicOn
              ? "0 8px 32px rgba(249,115,22,0.4), 0 2px 12px rgba(147,51,234,0.3)"
              : "0 6px 24px rgba(249,115,22,0.3), 0 2px 8px rgba(192,38,211,0.2)",
          }}
          animate={
            isMicOn
              ? { boxShadow: ["0 8px 32px rgba(249,115,22,0.4)", "0 12px 40px rgba(249,115,22,0.55)", "0 8px 32px rgba(249,115,22,0.4)"] }
              : {}
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Sheen */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 38% 30%, rgba(255,255,255,0.28) 0%, transparent 55%)",
            }}
          />
          <motion.div
            animate={isMicOn ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.6 }}
          >
            {isMicOn ? (
              <MicOff size={26} strokeWidth={2} className="text-white relative z-10" />
            ) : (
              <Mic size={26} strokeWidth={2} className="text-white relative z-10" />
            )}
          </motion.div>
        </motion.div>
        <span className="text-[11px] sm:text-xs font-medium text-[#A8A29E]">{isMicOn ? "Stop" : "Speak"}</span>
      </motion.button>

      <SideButton icon={<FileText size={20} strokeWidth={1.75} />} label="Transcript" onClick={onTranscript} />
    </div>
  )
}
