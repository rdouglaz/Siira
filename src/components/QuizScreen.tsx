"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ListChecks, Link2, PenLine, ChevronRight, ArrowLeft, Loader2 } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { createClient } from "@/lib/supabase/client"
import {
  generateMultipleChoice,
  generateMatchingSet,
  generateFillBlank,
  getBestScore,
  saveBestScore,
  type QuizType,
  type MCQQuestion,
  type MatchingPair,
  type FillBlankQuestion,
} from "@/lib/quiz/generator"
import type {
  DailyMCQContent,
  DailyMatchingContent,
  DailyFillBlankContent,
} from "@/lib/quiz/prompts"
import { MultipleChoice } from "@/components/quiz/MultipleChoice"
import { WordMatching } from "@/components/quiz/WordMatching"
import { FillBlank } from "@/components/quiz/FillBlank"
import { QuizResults } from "@/components/quiz/QuizResults"

const QUIZ_META: { id: QuizType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "Pick the right meaning — 10 quick questions.",
    icon: <ListChecks size={22} strokeWidth={2} />,
  },
  {
    id: "matching",
    title: "Word Matching",
    description: "Match words with their meanings.",
    icon: <Link2 size={22} strokeWidth={2} />,
  },
  {
    id: "fill-blank",
    title: "Fill in the Blank",
    description: "Complete the sentence — tap or type.",
    icon: <PenLine size={22} strokeWidth={2} />,
  },
]

type View = "overview" | "playing" | "results"

type QuizSource = "daily" | "fallback" | "local"

const QUESTION_COUNT = 10

// ─── Daily (AI-generated, DB-backed) content mappers ──────────────────────────
// Return null when the saved content is missing or malformed so the caller
// falls back to the offline word-list generator.

function mapDailyMCQ(content: unknown): MCQQuestion[] | null {
  const c = content as DailyMCQContent
  if (!c || !Array.isArray(c.questions) || c.questions.length < 4) return null
  try {
    return c.questions.slice(0, 10).map((q, i) => {
      if (!q.prompt || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`bad daily MCQ ${i}`)
      }
      const answerIndex = q.answerIndex >= 0 && q.answerIndex <= 3 ? q.answerIndex : 0
      const options = q.options.map((text, oi) => ({
        id: `daily-mcq-${i}-opt-${oi}`,
        text,
        correct: oi === answerIndex,
      }))
      return {
        id: `daily-mcq-${i}`,
        prompt: q.prompt,
        promptSub: q.promptSub,
        direction: q.direction === "meaning-to-target" ? "meaning-to-target" as const : "target-to-meaning" as const,
        options,
        answerId: options[answerIndex].id,
        explanation: q.explanation || "",
      }
    })
  } catch {
    return null
  }
}

function mapDailyMatching(content: unknown): MatchingPair[] | null {
  const c = content as DailyMatchingContent
  if (!c || !Array.isArray(c.pairs) || c.pairs.length < 4) return null
  try {
    return c.pairs.slice(0, 6).map((p, i) => {
      if (!p.left || !p.right) throw new Error(`bad daily pair ${i}`)
      return { id: `daily-match-${i}`, left: p.left, leftSub: p.leftSub, right: p.right }
    })
  } catch {
    return null
  }
}

function mapDailyFillBlank(content: unknown): FillBlankQuestion[] | null {
  const c = content as DailyFillBlankContent
  if (!c || !Array.isArray(c.questions) || c.questions.length < 4) return null
  try {
    return c.questions.slice(0, 10).map((q, i) => {
      if (!q.answer || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`bad daily fill-blank ${i}`)
      }
      const answerIndex = q.answerIndex >= 0 && q.answerIndex <= 3 ? q.answerIndex : 0
      const options = q.options.map((text, oi) => ({
        id: `daily-fib-${i}-opt-${oi}`,
        text,
        correct: oi === answerIndex,
      }))
      return {
        id: `daily-fib-${i}`,
        before: q.before ?? "",
        after: q.after ?? "",
        answer: q.answer,
        answerSub: q.answerSub,
        hint: q.hint || `Meaning: ${q.answer}`,
        options,
        answerId: options[answerIndex].id,
      }
    })
  } catch {
    return null
  }
}

async function fetchDailyQuiz(
  language: "zh" | "de",
  type: QuizType
): Promise<{ source: QuizSource; content: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    const { data: todayQuiz } = await supabase.from("daily_quizzes").select("content, quiz_date").eq("language", language).eq("quiz_type", type).eq("quiz_date", today).maybeSingle()
    if (todayQuiz?.content) return { source: "daily", content: todayQuiz.content }
    const { data: previous } = await supabase.from("daily_quizzes").select("content").eq("language", language).eq("quiz_type", type).order("quiz_date", { ascending: false }).limit(20)
    const data = previous?.length ? { content: previous[Math.floor(Math.random() * previous.length)].content } : null
    if (!data?.content) return { source: "local", content: null }
    return {
      source: "fallback",
      content: data.content,
    }
  } catch {
    return { source: "local", content: null }
  } finally {
    clearTimeout(timeout)
  }
}

export function QuizScreen() {
  const { language, setActiveTab } = useApp()
  const [view, setView] = useState<View>("overview")
  const [quizType, setQuizType] = useState<QuizType>("multiple-choice")
  const [runId, setRunId] = useState(0)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const [startingType, setStartingType] = useState<QuizType | null>(null)
  const [dailyMCQ, setDailyMCQ] = useState<MCQQuestion[] | null>(null)
  const [dailyMatching, setDailyMatching] = useState<MatchingPair[] | null>(null)
  const [dailyFill, setDailyFill] = useState<FillBlankQuestion[] | null>(null)
  const [quizSource, setQuizSource] = useState<QuizSource>("local")

  const localMCQ = useMemo<MCQQuestion[]>(
    () => (view === "playing" && quizType === "multiple-choice" && !dailyMCQ ? generateMultipleChoice(language, QUESTION_COUNT) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, quizType, language, runId, dailyMCQ],
  )
  const localMatching = useMemo<MatchingPair[]>(
    () => (view === "playing" && quizType === "matching" && !dailyMatching ? generateMatchingSet(language, 6) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, quizType, language, runId, dailyMatching],
  )
  const localFill = useMemo<FillBlankQuestion[]>(
    () => (view === "playing" && quizType === "fill-blank" && !dailyFill ? generateFillBlank(language, QUESTION_COUNT) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, quizType, language, runId, dailyFill],
  )

  const mcqQuestions = dailyMCQ ?? localMCQ
  const matchingPairs = dailyMatching ?? localMatching
  const fillQuestions = dailyFill ?? localFill

  const total = quizType === "matching"
    ? matchingPairs.length
    : quizType === "fill-blank"
      ? fillQuestions.length
      : mcqQuestions.length

  async function start(type: QuizType) {
    setQuizType(type)
    setIndex(0)
    setScore(0)
    setIsNewBest(false)
    setBest(getBestScore(language, type))
    setDailyMCQ(null)
    setDailyMatching(null)
    setDailyFill(null)
    setQuizSource("local")
    setStartingType(type)

    // Prefer today's AI-generated quiz (or a past saved day); fall back offline
    try {
      const { source, content } = await fetchDailyQuiz(language, type)
      if (content) {
        if (type === "multiple-choice") {
          const mapped = mapDailyMCQ(content)
          if (mapped) {
            setDailyMCQ(mapped)
            setQuizSource(source)
          }
        } else if (type === "matching") {
          const mapped = mapDailyMatching(content)
          if (mapped) {
            setDailyMatching(mapped)
            setQuizSource(source)
          }
        } else {
          const mapped = mapDailyFillBlank(content)
          if (mapped) {
            setDailyFill(mapped)
            setQuizSource(source)
          }
        }
      }
    } finally {
      setRunId((r) => r + 1)
      setStartingType(null)
      setView("playing")
    }
  }

  function finish(finalScore: number, finalTotal: number) {
    const prevBest = getBestScore(language, quizType) ?? 0
    const pct = Math.round((finalScore / Math.max(finalTotal, 1)) * 100)
    const newBest = saveBestScore(language, quizType, finalScore, finalTotal)
    setBest(newBest)
    setIsNewBest(pct > prevBest)
    setScore(finalScore)
    setView("results")
  }

  function handleMCQNext(correct: boolean) {
    const nextScore = score + (correct ? 1 : 0)
    setScore(nextScore)
    if (index + 1 >= mcqQuestions.length) finish(nextScore, mcqQuestions.length)
    else setIndex((i) => i + 1)
  }

  function handleFillNext(correct: boolean) {
    const nextScore = score + (correct ? 1 : 0)
    setScore(nextScore)
    if (index + 1 >= fillQuestions.length) finish(nextScore, fillQuestions.length)
    else setIndex((i) => i + 1)
  }

  function handleMatchingComplete(correctFirstTry: number) {
    finish(correctFirstTry, matchingPairs.length)
  }

  return (
    <div className="flex flex-col flex-1 px-5 pt-4 pb-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        {view !== "overview" && (
          <motion.button
            onClick={() => setView("overview")}
            className="w-9 h-9 rounded-full bg-white border border-[#F0EDE8] shadow-sm flex items-center justify-center text-[#78716C]"
            whileTap={{ scale: 0.93 }}
            aria-label="Back to quizzes"
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </motion.button>
        )}
        <div>
          <h1
            className="text-2xl font-bold text-[#1C1917] leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Quizzes
          </h1>
          <p className="text-sm text-[#A8A29E] mt-0.5">
            {view === "overview"
              ? `Practice ${language === "zh" ? "Chinese" : "German"} — speak every day.`
              : `${QUIZ_META.find((q) => q.id === quizType)?.title} · ${language === "zh" ? "Chinese" : "German"}`}
          </p>
          {view === "playing" && quizSource !== "local" && (
            <p className="text-[11px] font-semibold text-[#F97316] mt-1">
              {quizSource === "daily" ? "✨ Today's AI quiz" : "📚 Quiz from a previous day"}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "overview" && (
          <motion.div
            key="overview"
            className="flex flex-col gap-3 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {QUIZ_META.map((q) => {
              const bestScore = getBestScore(language, q.id)
              const isStarting = startingType === q.id
              return (
                <motion.button
                  key={q.id}
                  onClick={() => start(q.id)}
                  disabled={startingType !== null}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-left disabled:opacity-70"
                  style={{ border: "1px solid #F0EDE8", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-[#F97316]"
                    style={{ background: "#FFF4ED" }}
                  >
                    {isStarting ? <Loader2 size={22} className="animate-spin" /> : q.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-[#1C1917] text-sm"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {q.title}
                    </p>
                    <p className="text-[12px] text-[#A8A29E] mt-0.5">{q.description}</p>
                    {bestScore !== null && (
                      <p className="text-[11px] font-bold text-[#B45309] mt-1">Best: {bestScore}%</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-[#D6D3D1] flex-shrink-0" strokeWidth={2} />
                </motion.button>
              )
            })}
            <p className="text-[11px] text-[#C7BDB8] text-center mt-2">
              Fresh daily quiz from Sirra when online — your word list as backup.
            </p>
          </motion.div>
        )}

        {view === "playing" && quizType === "multiple-choice" && mcqQuestions[index] && (
          <motion.div
            key={`mcq-${runId}-${index}`}
            className="flex flex-col flex-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            <QuizProgress index={index} total={mcqQuestions.length} />
            <MultipleChoice question={mcqQuestions[index]} language={language} onNext={handleMCQNext} />
          </motion.div>
        )}

        {view === "playing" && quizType === "matching" && (
          <motion.div
            key={`match-${runId}`}
            className="flex flex-col flex-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            <WordMatching pairs={matchingPairs} onComplete={handleMatchingComplete} />
          </motion.div>
        )}

        {view === "playing" && quizType === "fill-blank" && fillQuestions[index] && (
          <motion.div
            key={`fib-${runId}-${index}`}
            className="flex flex-col flex-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            <QuizProgress index={index} total={fillQuestions.length} />
            <FillBlank question={fillQuestions[index]} language={language} onNext={handleFillNext} />
          </motion.div>
        )}

        {view === "results" && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
            <QuizResults
              score={score}
              total={total}
              best={best}
              isNewBest={isNewBest}
              onRetry={() => start(quizType)}
              onOther={() => setView("overview")}
              onWords={() => setActiveTab("words")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuizProgress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #F97316, #C026D3)" }}
          animate={{ width: `${((index + 1) / Math.max(total, 1)) * 100}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold text-[#A8A29E] tabular-nums">
        {index + 1}/{total}
      </span>
    </div>
  )
}
