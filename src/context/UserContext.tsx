import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type SpeakingSpeed = "slow" | "normal" | "fast"
export type DailyGoalMinutes = 10 | 15 | 20

export interface UserPrefs {
  speakingSpeed: SpeakingSpeed
  dailyGoalMinutes: DailyGoalMinutes
}

interface UserContextValue {
  streak: number
  prefs: UserPrefs
  updatePrefs: (p: Partial<UserPrefs>) => void
}

const defaultPrefs: UserPrefs = {
  speakingSpeed: "normal",
  dailyGoalMinutes: 15,
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  // Streak is simulated for the prototype — seeded at a satisfying number
  const [streak] = useState(7)
  const [prefs, setPrefs] = useState<UserPrefs>(defaultPrefs)

  const updatePrefs = useCallback((p: Partial<UserPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...p }))
  }, [])

  return (
    <UserContext.Provider value={{ streak, prefs, updatePrefs }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}

// ─── Level utility ────────────────────────────────────────────────────────────

export interface LevelInfo {
  label: string
  color: string
  nextAt: number
}

export function getLevel(mastered: number): LevelInfo {
  if (mastered >= 200) return { label: "Advanced",     color: "#8B5CF6", nextAt: 500  }
  if (mastered >= 50)  return { label: "Intermediate", color: "#3B82F6", nextAt: 200  }
  if (mastered >= 15)  return { label: "Elementary",   color: "#22C55E", nextAt: 50   }
  if (mastered >= 5)   return { label: "Beginner",     color: "#F97316", nextAt: 15   }
  return                      { label: "Newbie",       color: "#A8A29E", nextAt: 5    }
}
