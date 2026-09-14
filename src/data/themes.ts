export interface Theme {
  id: string
  title: string
  description: string
  emoji: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  isToday?: boolean
  language?: "zh" | "de"
}

export const themes: Theme[] = [
  {
    id: "restaurant",
    title: "Ordering at a Restaurant",
    description: "Practice ordering food, asking for recommendations, and settling the bill.",
    emoji: "🍜",
    difficulty: "Beginner",
    isToday: true,
    language: "zh",
  },
  {
    id: "greetings",
    title: "Greetings & Introductions",
    description: "Say hello, introduce yourself, and exchange pleasantries naturally.",
    emoji: "👋",
    difficulty: "Beginner",
    language: "zh",
  },
  {
    id: "directions",
    title: "Asking for Directions",
    description: "Find your way around streets, landmarks, and public transit.",
    emoji: "🗺️",
    difficulty: "Beginner",
    language: "zh",
  },
  {
    id: "shopping",
    title: "Shopping & Markets",
    description: "Browse, compare prices, and buy the things you need.",
    emoji: "🛍️",
    difficulty: "Intermediate",
    language: "zh",
  },
  {
    id: "family",
    title: "Family & Relationships",
    description: "Talk about the people who matter most to you.",
    emoji: "👨‍👩‍👧",
    difficulty: "Beginner",
    language: "zh",
  },
  {
    id: "time",
    title: "Numbers & Time",
    description: "Tell time, count, and manage your schedule.",
    emoji: "🕐",
    difficulty: "Beginner",
    language: "zh",
  },
  {
    id: "emotions",
    title: "Emotions & Feelings",
    description: "Express how you feel and understand what others are going through.",
    emoji: "😊",
    difficulty: "Intermediate",
    language: "zh",
  },
  {
    id: "weather",
    title: "Weather & Seasons",
    description: "Make small talk about the weather and plan around the seasons.",
    emoji: "☁️",
    difficulty: "Beginner",
    language: "zh",
  },
  {
    id: "transport",
    title: "Getting Around",
    description: "Buses, taxis, trains — navigate any city with confidence.",
    emoji: "🚇",
    difficulty: "Intermediate",
    language: "zh",
  },
  {
    id: "home",
    title: "Home & Daily Life",
    description: "Describe your home, routine, and everyday habits.",
    emoji: "🏠",
    difficulty: "Beginner",
    language: "zh",
  },
]

export const difficultyColors: Record<Theme["difficulty"], { bg: string; text: string }> = {
  Beginner: { bg: "#DCFCE7", text: "#166534" },
  Intermediate: { bg: "#FEF3C7", text: "#92400E" },
  Advanced: { bg: "#FCE7F3", text: "#9D174D" },
}
