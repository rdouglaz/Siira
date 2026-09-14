"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getAllWordIds } from "@/data/word-inventory";
import type { Language } from "./AppContext";
import { createClient } from "@/lib/supabase/client";
import { SRSCard as SupabaseSRSCard } from "@/lib/supabase/types";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SRSRating = "again" | "hard" | "good" | "easy";
export type SRSStatus = "new" | "learning" | "review" | "mastered";

export interface SRSCard {
  wordId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: number; // ms timestamp
  status: SRSStatus;
}

type CardMap = Record<string, SRSCard>;

// ─── SM-2 Scheduling ─────────────────────────────────────────────────────────

const QUALITY: Record<SRSRating, number> = { again: 0, hard: 2, good: 4, easy: 5 };

function scheduleNext(card: SRSCard, rating: SRSRating): SRSCard {
  const q = QUALITY[rating];
  let { interval, easeFactor, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    if (rating === "easy") interval = Math.round(interval * 1.3);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const daysFromNow = q < 3 ? 1 : interval;
  const nextReviewDate = Date.now() + daysFromNow * 24 * 60 * 60 * 1000;

  const status: SRSStatus =
    q < 3 ? "learning"
    : interval >= 21 ? "mastered"
    : "review";

  return { ...card, interval, easeFactor, repetitions, nextReviewDate, status };
}

// ─── No seed data: progress starts empty and only reflects real user activity ───
// Cards are created when the user practices (conversation vocabulary, quiz
// results, review ratings) and persisted to Supabase. Nothing is fabricated.

// Convert Supabase card to local format
function fromSupabase(card: SupabaseSRSCard): SRSCard {
  return {
    wordId: card.word_id,
    interval: card.interval,
    easeFactor: card.ease_factor,
    repetitions: card.repetitions,
    nextReviewDate: new Date(card.next_review).getTime(),
    status: card.status,
  };
}

// Convert local card to Supabase format
function toSupabase(card: SRSCard, userId: string, language: Language): Omit<SupabaseSRSCard, "id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    language,
    word_id: card.wordId,
    interval: card.interval,
    ease_factor: card.easeFactor,
    repetitions: card.repetitions,
    next_review: new Date(card.nextReviewDate).toISOString(),
    status: card.status,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface WordsContextValue {
  cards: CardMap;
  rateCard: (wordId: string, rating: SRSRating) => void;
  ensureWords: (wordIds: string[]) => void;
  getDueCards: (language: Language) => SRSCard[];
  getCard: (wordId: string) => SRSCard | undefined;
  learnedSet: Set<string>;
  toggleLearned: (wordId: string) => void;
  resetAllProgress: () => void;
  isLoading: boolean;
  syncFromSupabase: () => Promise<void>;
}

const WordsContext = createContext<WordsContextValue | null>(null);

export function WordsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [supabase] = useState(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return null;
    }
    return createClient();
  });
  const [cards, setCards] = useState<CardMap>({});
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);

  // Load cards from Supabase when user logs in (real data only — never seeded)
  const syncFromSupabase = useCallback(async () => {
    if (!user || !supabase) {
      setCards({});
      setLearnedSet(new Set());
      setIsLoading(false);
      setHasSynced(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("srs_cards")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading SRS cards:", error);
        // Keep existing cards on error — never fabricate progress
      } else if (data && data.length > 0) {
        const cardMap: CardMap = {};
        data.forEach((card) => {
          const localCard = fromSupabase(card);
          cardMap[localCard.wordId] = localCard;
        });
        setCards(cardMap);
      } else {
        // New user — start empty. Cards are created through real practice.
        setCards({});
      }
      setHasSynced(true);
    } catch (err) {
      console.error("Error syncing from Supabase:", err);
      // Keep existing cards on error — never fabricate progress
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Initial sync when user changes
  useEffect(() => {
    if (!authLoading) {
      syncFromSupabase();
    }
  }, [authLoading, syncFromSupabase]);

  const rateCard = useCallback((wordId: string, rating: SRSRating) => {
    setCards((prev) => {
      const existing: SRSCard = prev[wordId] ?? {
        wordId,
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewDate: Date.now(),
        status: "new",
      };
      const updated = scheduleNext(existing, rating);

      // Persist to Supabase if authenticated
      if (user && supabase) {
        supabase
          .from("srs_cards")
          .upsert({
            ...toSupabase(updated, user.id, wordId.startsWith("zh") ? "zh" : "de"),
            user_id: user.id,
          }, { onConflict: "user_id,word_id" })
          .then(({ error }) => {
            if (error) console.error("Error saving SRS card:", error);
          });
      }

      return { ...prev, [wordId]: updated };
    });
  }, [user, supabase]);

  const ensureWords = useCallback(
    (wordIds: string[]) => {
      setCards((prev) => {
        let changed = false;
        const next = { ...prev };
        const additions: SRSCard[] = [];
        for (const wordId of wordIds) {
          if (!wordId || next[wordId]) continue;
          const card: SRSCard = {
            wordId,
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            nextReviewDate: Date.now(),
            status: "new",
          };
          next[wordId] = card;
          additions.push(card);
          changed = true;
        }
        if (changed && user && supabase) {
          const records = additions.map((card) => ({
            ...toSupabase(card, user.id, card.wordId.startsWith("zh") ? "zh" : "de"),
          }));
          supabase
            .from("srs_cards")
            .upsert(records, { onConflict: "user_id,word_id" })
            .then(({ error }) => {
              if (error) console.error("Error ensuring SRS cards:", error);
            });
        }
        return changed ? next : prev;
      });
    },
    [user, supabase]
  );

  const getDueCards = useCallback(
    (language: Language): SRSCard[] => {
      const now = Date.now();
      const ids = new Set(getAllWordIds(language));
      return Object.values(cards).filter((c) => ids.has(c.wordId) && c.nextReviewDate <= now);
    },
    [cards],
  );

  const getCard = useCallback((wordId: string) => cards[wordId], [cards]);

  const toggleLearned = useCallback((wordId: string) => {
    setLearnedSet((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    setCards({});
    setLearnedSet(new Set());

    if (user && supabase) {
      supabase
        .from("srs_cards")
        .delete()
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error("Error resetting SRS cards:", error);
        });
    }
  }, [user, supabase]);

  return (
    <WordsContext.Provider
      value={{
        cards,
        rateCard,
        ensureWords,
        getDueCards,
        getCard,
        learnedSet,
        toggleLearned,
        resetAllProgress,
        isLoading,
        syncFromSupabase,
      }}
    >
      {children}
    </WordsContext.Provider>
  );
}

export function useWords() {
  const ctx = useContext(WordsContext);
  if (!ctx) {
    return {
      cards: {} as Record<string, import("./WordsContext").SRSCard>,
      rateCard: () => {},
      ensureWords: () => {},
      getDueCards: () => [],
      getCard: () => undefined,
      learnedSet: new Set<string>(),
      toggleLearned: () => {},
      resetAllProgress: () => {},
      isLoading: false,
      syncFromSupabase: async () => {},
    };
  }
  return ctx;
}

// Helper functions (re-exported for convenience)
export { scheduleNext, fromSupabase, toSupabase };