import { ChevronDown } from "lucide-react"
import { useApp, type Language } from "../context/AppContext"

const labels: Record<Language, string> = {
  zh: "A little everyday Chinese",
  de: "A little everyday German",
}

export function LanguagePill() {
  const { language, setLanguage } = useApp()

  function toggle() {
    setLanguage(language === "zh" ? "de" : "zh")
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 pl-3 pr-2.5 sm:px-4 py-2 min-h-[44px] rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] active:scale-95 transition-all duration-200 group max-w-[72%] sm:max-w-none"
      aria-label="Switch language"
    >
      <span className="text-[13px] sm:text-sm font-medium text-[#92400E] truncate">{labels[language]}</span>
      <ChevronDown
        size={13}
        strokeWidth={2.5}
        className="text-[#B45309] group-hover:translate-y-0.5 transition-transform duration-200"
      />
    </button>
  )
}
