import type { Language } from "@/context/AppContext"
import { getWordsByLanguage, getCategories, getWordById as getWordByIdNew, getAllWordIds as getAllWordIdsNew, type WordEntry } from "@/data/word-inventory"

// Legacy types for backward compatibility
export type WordCategory = string

export interface Word {
  id: string
  text: string
  romanization?: string
  translation: string
}

export interface CategoryData {
  id: string
  label: string
  words: Word[]
}

// Convert new WordEntry to legacy Word format
function toLegacyWord(entry: WordEntry): Word {
  return {
    id: entry.id,
    text: entry.target,
    romanization: entry.romanization,
    translation: entry.meaning,
  }
}

// Convert new CategoryData to legacy CategoryData format
function toLegacyCategory(language: Language, category: string): CategoryData {
  const words = getWordsByLanguage(language)
    .filter(w => w.category === category)
    .map(toLegacyWord)
  return {
    id: category,
    label: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
    words,
  }
}

// Build legacy category data for Chinese
const zhCategoriesLegacy: CategoryData[] = getCategories("zh").map(cat => toLegacyCategory("zh", cat))

// Build legacy category data for German
const deCategoriesLegacy: CategoryData[] = getCategories("de").map(cat => toLegacyCategory("de", cat))

export const wordData: Record<Language, CategoryData[]> = {
  zh: zhCategoriesLegacy,
  de: deCategoriesLegacy,
}

export function findWordById(lang: Language, wordId: string): Word | undefined {
  const entry = getWordByIdNew(lang, wordId)
  return entry ? toLegacyWord(entry) : undefined
}

export function getAllWordIds(lang: Language): string[] {
  return getAllWordIdsNew(lang)
}