export type Language = "zh" | "de";
export type Difficulty = "Beginner" | "Intermediate";

export interface ThemeGenerationRequest {
  language: Language;
  difficulty?: Difficulty;
  category?: string;
}

export interface ThemeContent {
  // Core theme info
  title: string;
  description: string;
  difficulty: Difficulty;
  
  // Learning objectives
  learningObjectives: string[];
  
  // Key vocabulary (8-12 words)
  keyVocabulary: VocabularyItem[];
  
  // Progressive cues/scenarios (4-6)
  cues: Cue[];
  
  // Practice sentences (4-6)
  practiceSentences: PracticeSentence[];
  
  // Common mistakes (3-4)
  commonMistakes: CommonMistake[];
  
  // Cultural/context notes
  culturalNotes?: string;
}

export interface VocabularyItem {
  word: string;
  romanization?: string; // Pinyin for Chinese
  translation: string;
  partOfSpeech: string; // noun, verb, adjective, etc.
  tone?: number; // 1-4 for Chinese
  audioHint?: string; // e.g., "rhymes with..."
}

export interface Cue {
  id: string;
  order: number;
  title: string;
  description: string;
  scenario: string; // Role-play setup
  targetLanguage: string; // The phrase to practice
  romanization?: string;
  translation: string;
  keyVocabulary: string[]; // Word IDs from keyVocabulary
  difficulty: "easy" | "medium" | "hard";
  tips?: string[];
}

export interface PracticeSentence {
  text: string;
  romanization?: string;
  translation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface CommonMistake {
  incorrect: string;
  correct: string;
  romanization?: string;
  explanation: string;
  tip: string;
}

export interface GeneratedTheme {
  id: string;
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;
  content: ThemeContent;
  is_daily: boolean;
  generated_at: string;
}