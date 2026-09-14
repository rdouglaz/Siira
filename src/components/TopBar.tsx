"use client"

import { SlidersHorizontal, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Flame } from "lucide-react"

interface TopBarProps {
  onSettingsPress: () => void
}

export function TopBar({ onSettingsPress }: TopBarProps) {
  const { streak, profile, user } = useAuth()

  return (
    <header
      className="flex items-center justify-between shrink-0 px-4 sm:px-6 pb-2 pt-3 sm:pt-4"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#F97316]" />
        <span
          className="text-[#1C1917] font-bold text-lg tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          siira
        </span>
      </div>

      <div className="flex items-center gap-2">
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: "#FFF4ED" }}>
            <Flame size={13} className="text-[#F97316]" strokeWidth={2} />
            <span className="text-[12px] font-bold text-[#F97316]">{streak}</span>
          </div>
        )}

        {user && profile?.display_name && (
          <span className="text-[12px] font-medium text-[#78716C] hidden sm:block">
            {profile.display_name}
          </span>
        )}

        <button
          onClick={onSettingsPress}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white shadow-sm border border-[#F0EDE8] flex items-center justify-center text-[#78716C] hover:bg-[#F5F1EC] active:scale-95 transition-all duration-150"
          aria-label="Settings"
        >
          {user ? <User size={16} strokeWidth={2} /> : <SlidersHorizontal size={16} strokeWidth={2} />}
        </button>
      </div>
    </header>
  )
}