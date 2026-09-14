"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Flame, BookOpen, Star, RotateCcw, User, LogOut } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { useWords } from "@/context/WordsContext"
import { useAuth, getLevel, type SpeakingSpeed, type DailyGoalMinutes } from "@/context/AuthContext"
import { wordData } from "@/data/words"
import { ProgressCharts } from "@/components/progress/ProgressCharts"
import { Download, Upload } from "lucide-react"

// ─── Segmented control ────────────────────────────────────────────────────────

function SegmentControl<T extends string>({
  id,
  options,
  value,
  onChange,
}: {
  id: string
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex p-1 rounded-xl gap-0.5" style={{ background: "#F5F1EC" }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 relative py-2 px-1 rounded-lg text-xs font-bold transition-colors duration-150"
          style={{ color: value === opt.value ? "#1C1917" : "#A8A29E" }}
        >
          {value === opt.value && (
            <motion.div
              layoutId={`seg-${id}`}
              className="absolute inset-0 rounded-lg bg-white"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold tracking-widest text-[#C7BDB8] uppercase mb-2 px-1">
        {title}
      </p>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1.5px solid #F0EDE8",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SettingRow({
  label,
  sublabel,
  children,
  noDivider,
}: {
  label: string
  sublabel?: string
  children: ReactNode
  noDivider?: boolean
}) {
  return (
    <div
      className="px-4 py-3.5"
      style={{ borderBottom: noDivider ? "none" : "1px solid #F5F5F4" }}
    >
      <div className="flex items-center justify-between gap-3 mb-0">
        <div>
          <p className="text-sm font-semibold text-[#1C1917]">{label}</p>
          {sublabel && <p className="text-[11px] text-[#A8A29E] mt-0.5">{sublabel}</p>}
        </div>
      </div>
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  )
}

function StatRow({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #F5F5F4" }}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "#FFF4ED" }}
      >
        {icon}
      </div>
      <span className="flex-1 text-sm text-[#78716C]">{label}</span>
      <span className="text-sm font-bold" style={{ color: color ?? "#1C1917" }}>
        {value}
      </span>
    </div>
  )
}

// ─── Reset button with confirmation ──────────────────────────────────────────

function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  function handleConfirm() {
    onReset()
    setDone(true)
    setConfirming(false)
    setTimeout(() => setDone(false), 2500)
  }

  if (done) {
    return (
      <motion.div
        className="px-4 py-3.5 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-sm font-semibold text-[#16A34A]">✓ Progress reset</span>
      </motion.div>
    )
  }

  return (
    <div className="px-4 py-3.5">
      <AnimatePresence mode="wait">
        {!confirming ? (
          <motion.button
            key="trigger"
            onClick={() => setConfirming(true)}
            className="text-sm font-semibold text-[#DC2626] hover:opacity-80 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Reset all progress…
          </motion.button>
        ) : (
          <motion.div
            key="confirm"
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm text-[#78716C] flex-1">This cannot be undone.</p>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-semibold text-[#A8A29E] px-3 py-1.5 rounded-full"
              style={{ background: "#F5F5F4" }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-full"
              style={{ background: "#DC2626" }}
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sign-in prompt (onboarding at /auth handles the actual sign-in) ──────────

function SignInPrompt() {
  return (
    <div className="px-4 py-6 text-center">
      <p
        className="font-bold text-[#1C1917] text-base"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Sign in to sync your progress
      </p>
      <p className="text-[13px] text-[#A8A29E] mt-1 mb-4">
        Your streaks, words, and preferences are saved to your account.
      </p>
      <a
        href="/auth"
        className="inline-block w-full py-3 rounded-xl font-semibold text-white text-center"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
      >
        Go to sign in
      </a>
    </div>
  )
}

// ─── User Profile Header ─────────────────────────────────────────────────────

function UserProfileHeader({ onSignOut }: { onSignOut: () => void }) {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    onSignOut?.()
  }

  return (
    <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #F5F5F4" }}>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #FF7A35 0%, #9333EA 100%)",
          boxShadow: "0 4px 16px rgba(249,115,22,0.25)",
        }}
      >
        <User size={24} className="text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1C1917] text-base truncate">
          {profile?.display_name || user?.email || "Language Learner"}
        </p>
        <p className="text-xs text-[#A8A29E] mt-0.5 truncate">{user?.email}</p>
      </div>
      <motion.button
        onClick={handleSignOut}
        className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#DC2626] bg-[#FEE2E2] hover:bg-[#FECACA] transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <LogOut size={12} strokeWidth={2} className="inline-block mr-1" />
        Sign out
      </motion.button>
    </div>
  )
}

// ─── Main settings screen ────────────────────────────────────────────────────

interface SettingsScreenProps {
  onClose: () => void
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { language, setLanguage, clearConversation, setSelectedThemeId } = useApp()
  const { streak, prefs, updatePrefs, profile, user, loading: authLoading } = useAuth()
  const { cards, learnedSet, toggleLearned, rateCard, ensureWords, resetAllProgress, isLoading: wordsLoading } = useWords()

  // Compute stats
  const allWords = [...wordData.zh, ...wordData.de].flatMap((c) => c.words)
  const masteredCount = allWords.filter((w) => cards[w.id]?.status === "mastered").length
  const inSRSCount = Object.keys(cards).length
  const level = getLevel(masteredCount)

  function handleReset() {
    resetAllProgress()
    clearConversation()
    setSelectedThemeId(null)
  }

  function handleExport() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      language,
      cards,
      learned: Array.from(learnedSet),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siira-srs-${language}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const ids: string[] = Array.isArray(data.learned)
        ? data.learned.filter((x: unknown): x is string => typeof x === "string")
        : [];
      ids.forEach((id) => {
        if (!learnedSet.has(id)) toggleLearned(id);
      });
      if (data.cards && typeof data.cards === "object") {
        const entries = Object.entries(data.cards as Record<string, { status?: string }>);
        const toEnsure = entries.map(([id]) => id).filter(Boolean);
        if (toEnsure.length > 0) ensureWords(toEnsure);
        for (const [id, c] of entries) {
          if (c.status === "mastered") rateCard(id, "easy");
          else if (c.status === "review") rateCard(id, "good");
          else if (c.status === "learning") rateCard(id, "hard");
        }
      }
    } catch (e) {
      console.warn("[Import] failed:", e);
    }
  }

  // Show sign-in form if not authenticated
  if (!user) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "#FDFBF7", maxWidth: 672, margin: "0 auto", paddingBottom: "env(safe-area-inset-bottom)" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <header className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <motion.button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#F0EDE8] shadow-sm flex items-center justify-center text-[#78716C] hover:bg-[#F5F1EC] transition-colors"
            whileTap={{ scale: 0.93 }}
            aria-label="Close settings"
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </motion.button>
          <span
            className="text-xl font-bold text-[#1C1917]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Settings
          </span>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <SignInPrompt />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#FDFBF7", maxWidth: 672, margin: "0 auto", paddingBottom: "env(safe-area-inset-bottom)" }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
        <motion.button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white border border-[#F0EDE8] shadow-sm flex items-center justify-center text-[#78716C] hover:bg-[#F5F1EC] transition-colors"
          whileTap={{ scale: 0.93 }}
          aria-label="Close settings"
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </motion.button>
        <span
          className="text-xl font-bold text-[#1C1917]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Settings
        </span>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 pt-3">
        {/* User Profile */}
        <UserProfileHeader onSignOut={onClose} />

        {/* ── LEARNING ── */}
        <Section title="Learning">
          <SettingRow label="Language" sublabel="What are you practicing?">
            <SegmentControl
              id="language"
              value={language}
              onChange={setLanguage}
              options={[
                { label: "🇨🇳  Chinese", value: "zh" as const },
                { label: "🇩🇪  German", value: "de" as const },
              ]}
            />
          </SettingRow>

          <SettingRow label="Speaking speed" sublabel="How fast the AI tutor replies">
            <SegmentControl
              id="speed"
              value={prefs.speakingSpeed}
              onChange={(v: SpeakingSpeed) => updatePrefs({ speakingSpeed: v })}
              options={[
                { label: "Slow", value: "slow" as const },
                { label: "Normal", value: "normal" as const },
                { label: "Fast", value: "fast" as const },
              ]}
            />
          </SettingRow>

          <SettingRow label="Daily goal" sublabel="Review target per day" noDivider>
            <SegmentControl
              id="goal"
              value={String(prefs.dailyGoalMinutes)}
              onChange={(v) => updatePrefs({ dailyGoalMinutes: Number(v) as 10 | 15 | 20 })}
              options={[
                { label: "10 min", value: "10" },
                { label: "15 min", value: "15" },
                { label: "20 min", value: "20" },
              ]}
            />
          </SettingRow>
        </Section>

        {/* ── PROGRESS ── */}
        <Section title="Your Progress">
          <StatRow
            icon={<Flame size={16} className="text-[#F97316]" strokeWidth={2} />}
            label="Current streak"
            value={`${streak} days 🔥`}
            color="#F97316"
          />
          <StatRow
            icon={<BookOpen size={16} className="text-[#6D28D9]" strokeWidth={2} />}
            label="Words in review"
            value={String(inSRSCount)}
          />
          <StatRow
            icon={<Star size={16} className="text-[#16A34A]" strokeWidth={2} />}
            label="Mastered"
            value={`${masteredCount} words`}
            color="#16A34A"
          />
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold" style={{ color: level.color }}>
                {level.label}
              </span>
              <span className="text-[11px] text-[#A8A29E]">
                {masteredCount} / {level.nextAt} to next level
              </span>
            </div>
            <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: level.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (masteredCount / level.nextAt) * 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
          <div className="px-4 pb-3">
            <ProgressCharts language={language} />
          </div>
          <ResetButton onReset={handleReset} />
        </Section>

        {/* ── ACCOUNT ── */}
        <Section title="Account">
          <div className="px-4 py-3">
            <p className="text-sm text-[#78716C]">
              Your progress, streaks, and preferences are saved to your account.
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-[#78716C]">
              Signed in as <span className="font-semibold text-[#1C1917]">{user?.email}</span>
            </p>
          </div>
          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1C1917] bg-[#F5F5F4]"
            >
              <Download size={14} /> Export SRS
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1C1917] bg-[#F5F5F4] cursor-pointer">
              <Upload size={14} /> Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleImportFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </Section>

        {/* ── ABOUT ── */}
        <Section title="About">
          <div className="px-4 py-4 flex items-start gap-4" style={{ borderBottom: "1px solid #F5F5F4" }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #FF7A35 0%, #9333EA 100%)",
                boxShadow: "0 4px 16px rgba(249,115,22,0.25)",
              }}
            >
              <span className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                s
              </span>
            </div>
            <div>
              <p
                className="font-bold text-[#1C1917] text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                siira
              </p>
              <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">
                Speak every day.
              </p>
              <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">
                A calm, speech-first language companion that helps you actually speak Mandarin and German through real conversation.
              </p>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-[#A8A29E]">Version</span>
            <span className="text-sm font-semibold text-[#78716C]">0.1 · Prototype</span>
          </div>
        </Section>
      </div>
    </motion.div>
  )
}