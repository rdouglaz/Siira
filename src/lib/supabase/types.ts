export type Language = "zh" | "de";
export type SRSStatus = "new" | "learning" | "review" | "mastered";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_language: Language;
  daily_goal_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface SRSCard {
  id: string;
  user_id: string;
  language: Language;
  word_id: string; // e.g., "zh-你", "de-Hallo"
  interval: number;
  ease_factor: number;
  repetitions: number;
  next_review: string; // ISO timestamp
  status: SRSStatus;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;
  content: Record<string, unknown>; // vocabulary, cues, sentences
  is_daily: boolean;
  generated_at: string | null;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  total_words_learned: number;
  total_reviews: number;
  level: string;
  updated_at: string;
}

// For optimistic updates
export interface SRSCardInput {
  user_id: string;
  language: Language;
  word_id: string;
  interval?: number;
  ease_factor?: number;
  repetitions?: number;
  next_review?: string;
  status?: SRSStatus;
}

export interface ProfileInput {
  id: string;
  display_name?: string | null;
  preferred_language?: Language;
  daily_goal_minutes?: number;
}