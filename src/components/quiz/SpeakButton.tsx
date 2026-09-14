"use client"

import { useState, useEffect, useCallback } from "react"
import { Volume2 } from "lucide-react"
import { useTTS } from "@/hooks/useTTS"

export function SpeakButton({ text, language }: { text: string; language: "zh" | "de" }) {
  const { speak, stop, isPlaying } = useTTS({ language })
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isPlaying)
  }, [isPlaying])

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (active || isPlaying) {
        stop()
        setActive(false)
      } else {
        setActive(true)
        try {
          await speak(text, { language })
        } catch {
          // graceful — TTS failure never breaks quiz UI
        } finally {
          setActive(false)
        }
      }
    },
    [active, isPlaying, speak, stop, text, language],
  )

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center p-2 rounded-xl transition-colors bg-white text-[#A8A29E] hover:bg-[#FEF3C7] hover:text-[#F97316]"
      style={{ border: "1.5px solid #F0EDE8" }}
      aria-label={active ? "Stop pronunciation" : "Hear pronunciation"}
    >
      <Volume2 size={16} strokeWidth={2.5} />
    </button>
  )
}
