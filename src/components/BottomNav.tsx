import { motion } from "framer-motion"
import { Mic2, Compass, BookOpen, GraduationCap } from "lucide-react"
import { useApp, type Tab } from "../context/AppContext"

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "talk", label: "Talk", icon: <Mic2 size={22} strokeWidth={1.75} /> },
  { id: "themes", label: "Themes", icon: <Compass size={22} strokeWidth={1.75} /> },
  { id: "words", label: "Words", icon: <BookOpen size={22} strokeWidth={1.75} /> },
  { id: "quiz", label: "Quiz", icon: <GraduationCap size={22} strokeWidth={1.75} /> },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav
      className="shrink-0 bg-white/90 backdrop-blur-md border-t border-[#F0EDE8]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-2 sm:py-3 min-h-[60px] sm:min-h-[64px] relative transition-colors duration-200"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#F97316]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}

              <motion.span
                animate={{ color: isActive ? "#F97316" : "#A8A29E", scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {tab.icon}
              </motion.span>

              <motion.span
                className="text-[11px] font-semibold tracking-wide"
                animate={{ color: isActive ? "#F97316" : "#A8A29E" }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
