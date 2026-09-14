"use client"

import { TalkScreen } from "@/components/TalkScreen"
import { BottomNav } from "@/components/BottomNav"
import { TopBar } from "@/components/TopBar"
import { SettingsScreen } from "@/components/SettingsScreen"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useApp } from "@/context/AppContext"

const screenVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

function ScreenRouter() {
  const { activeTab } = useApp()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTab}
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {activeTab === "talk" && <TalkScreen />}
        {activeTab === "themes" && <ThemesScreen />}
        {activeTab === "words" && <WordsScreen />}
        {activeTab === "quiz" && <QuizScreen />}
      </motion.div>
    </AnimatePresence>
  )
}

import { ThemesScreen } from "@/components/ThemesScreen"
import { WordsScreen } from "@/components/WordsScreen"
import { QuizScreen } from "@/components/QuizScreen"
import { useAuthGuard } from "@/hooks/useAuthGuard"

export default function TalkPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { checking } = useAuthGuard()

  if (checking) return null

  return (
    <div className="h-dvh bg-[#FDFBF7] flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 w-full mx-auto overflow-hidden relative
        max-w-md sm:max-w-xl lg:max-w-2xl
        sm:px-2 lg:px-4">
        <TopBar onSettingsPress={() => setIsSettingsOpen(true)} />
        <ScreenRouter />
        <BottomNav />

        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}