import { getWordsByLanguage, type WordEntry } from "@/data/word-inventory"

export type QuizType = "multiple-choice" | "matching" | "fill-blank"
export type Language = "zh" | "de"

export interface MCQOption {
  id: string
  text: string
  correct: boolean
}

export interface MCQQuestion {
  id: string
  prompt: string
  promptSub?: string
  direction: "target-to-meaning" | "meaning-to-target"
  options: MCQOption[]
  answerId: string
  explanation: string
}

export interface MatchingPair {
  id: string
  left: string
  leftSub?: string
  right: string
}

export interface FillBlankQuestion {
  id: string
  before: string
  after: string
  answer: string
  answerSub?: string
  hint: string
  options: MCQOption[]
  answerId: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickPool(language: Language): WordEntry[] {
  const words = getWordsByLanguage(language)
  // Prefer beginner/intermediate items for quizzes
  const preferred = words.filter((w) => w.difficulty !== "advanced")
  return preferred.length >= 8 ? preferred : words
}

export function generateMultipleChoice(
  language: Language,
  count = 10,
): MCQQuestion[] {
  const pool = shuffle(pickPool(language))
  const questions: MCQQuestion[] = []

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const word = pool[i]
    // Alternate direction so both recognition directions are practiced
    const direction: MCQQuestion["direction"] =
      i % 2 === 0 ? "target-to-meaning" : "meaning-to-target"

    const distractors = shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3)
    const answerText = direction === "target-to-meaning" ? word.meaning : word.target

    const options: MCQOption[] = shuffle([
      { id: word.id, text: answerText, correct: true },
      ...distractors.map((d) => ({
        id: d.id,
        text: direction === "target-to-meaning" ? d.meaning : d.target,
        correct: false,
      })),
    ])

    const explanation =
      word.example && word.exampleMeaning
        ? `${word.example}${word.exampleRomanization ? ` (${word.exampleRomanization})` : ""} — ${word.exampleMeaning}`
        : word.example
          ? `${word.example}${word.exampleRomanization ? ` (${word.exampleRomanization})` : ""}`
          : direction === "target-to-meaning"
            ? `"${word.target}" means "${word.meaning}"`
            : `"${word.meaning}" is "${word.target}" in ${language === "zh" ? "Chinese" : "German"}`

    questions.push({
      id: `mcq-${word.id}-${i}`,
      prompt: direction === "target-to-meaning" ? word.target : word.meaning,
      promptSub: direction === "target-to-meaning" ? word.romanization : word.romanization,
      direction,
      options,
      answerId: word.id,
      explanation,
    })
  }

  return questions
}

export function generateMatchingSet(language: Language, size = 6): MatchingPair[] {
  const pool = shuffle(pickPool(language)).slice(0, size)
  return pool.map((w) => ({
    id: w.id,
    left: w.target,
    leftSub: w.romanization,
    right: w.meaning,
  }))
}

export function generateFillBlank(language: Language, count = 10): FillBlankQuestion[] {
  const pool = shuffle(pickPool(language))
  const questions: FillBlankQuestion[] = []

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const word = pool[i]
    const distractors = shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3)

    let before = ""
    let after = ""
    const example = word.example ?? ""

    if (example && example.includes(word.target)) {
      const idx = example.indexOf(word.target)
      before = example.slice(0, idx)
      after = example.slice(idx + word.target.length)
    } else if (example) {
      // Example doesn't contain the word — use it as context, blank the word itself
      before = `${example} → `
      after = ""
    } else {
      before = language === "zh" ? "“" + word.meaning + "”用中文怎么说？ " : `How do you say "${word.meaning}" in German? `
      after = ""
    }

    const options: MCQOption[] = shuffle([
      { id: word.id, text: word.target, correct: true },
      ...distractors.map((d) => ({ id: d.id, text: d.target, correct: false })),
    ])

    questions.push({
      id: `fib-${word.id}-${i}`,
      before,
      after,
      answer: word.target,
      answerSub: word.romanization,
      hint: `Meaning: ${word.meaning}${word.romanization ? ` · ${word.romanization}` : ""}`,
      options,
      answerId: word.id,
    })
  }

  return questions
}

// ─── Light local progress (best scores) ───────────────────────────────────────

const BEST_KEY = (lang: Language, type: QuizType) => `siira-quiz-best:${lang}:${type}`

export function getBestScore(lang: Language, type: QuizType): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY(lang, type))
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function saveBestScore(lang: Language, type: QuizType, score: number, total: number) {
  try {
    const pct = Math.round((score / Math.max(total, 1)) * 100)
    const prev = getBestScore(lang, type) ?? 0
    if (pct > prev) localStorage.setItem(BEST_KEY(lang, type), String(pct))
    return Math.max(pct, prev)
  } catch {
    return Math.round((score / Math.max(total, 1)) * 100)
  }
}
