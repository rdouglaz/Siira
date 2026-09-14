import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw } from "lucide-react"
import { useApp, type ConversationMessage } from "../context/AppContext"

function UserBubble({ message }: { message: ConversationMessage }) {
  return (
    <motion.div
      className="flex justify-end"
      initial={{ opacity: 0, x: 16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div
        className="max-w-[78%] px-4 py-2.5 rounded-[18px] rounded-tr-[6px]"
        style={{
          background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
          boxShadow: "0 2px 12px rgba(249,115,22,0.22)",
        }}
      >
        <p className="text-white text-sm font-medium leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  )
}

function AIBubble({ message }: { message: ConversationMessage }) {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, x: -16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div
        className="max-w-[82%] px-4 py-3 rounded-[18px] rounded-tl-[6px] space-y-1"
        style={{
          background: "white",
          border: "1.5px solid #F0EDE8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Target language text */}
        <p
          className="font-bold text-[#1C1917] leading-snug"
          style={{
            fontSize: message.text.length > 24 ? "1rem" : "1.15rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {message.text}
        </p>

        {/* Romanization */}
        {message.romanization && (
          <p className="text-[12px] font-medium text-[#F97316]">{message.romanization}</p>
        )}

        {/* Translation */}
        {message.translation && (
          <p className="text-[12px] text-[#A8A29E] leading-snug">{message.translation}</p>
        )}
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "#FFF4ED" }}
      >
        <span className="text-2xl">💬</span>
      </div>
      <p className="text-sm text-[#A8A29E] font-medium text-center">
        Tap the mic to start your conversation
      </p>
      <p className="text-[12px] text-[#C7BDB8] text-center">
        Your full chat history will appear here
      </p>
    </div>
  )
}

interface TranscriptPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function TranscriptPanel({ isOpen, onClose }: TranscriptPanelProps) {
  const { conversationHistory, clearConversation } = useApp()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversationHistory, isOpen])

  function handleClear() {
    clearConversation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto flex flex-col"
            style={{
              background: "#FDFBF7",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -8px 48px rgba(0,0,0,0.12)",
              height: "82vh",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#E7E5E4]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0 border-b border-[#F0EDE8]">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold tracking-widest text-[#A8A29E] uppercase">
                  Transcript
                </span>
                {conversationHistory.length > 0 && (
                  <span className="text-[11px] font-semibold text-[#C7BDB8]">
                    {Math.ceil(conversationHistory.length / 2)} turns
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {conversationHistory.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[#A8A29E] hover:bg-[#E7E5E4] hover:text-[#78716C] transition-colors text-[11px] font-semibold"
                  >
                    <RotateCcw size={11} strokeWidth={2.5} />
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-[#F5F5F4] flex items-center justify-center text-[#78716C] hover:bg-[#E7E5E4] transition-colors"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {conversationHistory.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {conversationHistory.map((msg) =>
                      msg.role === "user" ? (
                        <UserBubble key={msg.id} message={msg} />
                      ) : (
                        <AIBubble key={msg.id} message={msg} />
                      ),
                    )}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 flex-shrink-0 border-t border-[#F0EDE8]">
              <p className="text-[11px] text-[#C7BDB8] text-center">
                Tap <span className="font-semibold text-[#A8A29E]">Meaning</span> after any reply for a word-by-word breakdown
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
