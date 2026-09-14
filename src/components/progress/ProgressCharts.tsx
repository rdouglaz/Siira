"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useWords } from "@/context/WordsContext";
import { useAuth } from "@/context/AuthContext";
import { getWordsByLanguage } from "@/data/word-inventory";

export function ProgressCharts({ language }: { language: "zh" | "de" }) {
  const { cards, getCard } = useWords();
  const { profile } = useAuth();

  const stats = useMemo(() => {
    const words = getWordsByLanguage(language);
    let mastered = 0;
    let learning = 0;
    let review = 0;
    let newCount = 0;
    for (const w of words) {
      const s = getCard(w.id)?.status ?? "new";
      if (s === "mastered") mastered++;
      else if (s === "learning") learning++;
      else if (s === "review") review++;
      else newCount++;
    }
    const total = Math.max(words.length, 1);
    return { mastered, learning, review, newCount, total };
  }, [cards, getCard, language]);

  const streak = profile?.current_streak ?? 0;
  const longest = profile?.longest_streak ?? 0;

  const segments = [
    { label: "Mastered", value: stats.mastered, color: "#22C55E" },
    { label: "Review", value: stats.review, color: "#F97316" },
    { label: "Learning", value: stats.learning, color: "#F59E0B" },
    { label: "New", value: stats.newCount, color: "#E7E5E4" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Mastery distribution */}
      <div className="rounded-2xl bg-white p-4" style={{ border: "1.5px solid #F0EDE8" }}>
        <p className="text-sm font-bold text-[#1C1917] mb-2">Vocabulary mastery</p>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-[#F5F5F4]">
          {segments.map((s) => (
            <motion.div
              key={s.label}
              style={{ background: s.color, width: `${(s.value / stats.total) * 100}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="h-full origin-left"
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[11px] text-[#78716C]">
                {s.label} {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div className="rounded-2xl bg-white p-4" style={{ border: "1.5px solid #F0EDE8" }}>
        <p className="text-sm font-bold text-[#1C1917] mb-1">Streak</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-[#F97316]">{streak}</span>
          <span className="text-sm text-[#78716C] mb-1">days · best {longest}</span>
        </div>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 14 }).map((_, i) => {
            const active = i >= 14 - Math.min(streak, 14);
            return (
              <div
                key={i}
                className="flex-1 h-6 rounded-md"
                style={{ background: active ? "linear-gradient(180deg,#F97316,#C026D3)" : "#F5F5F4" }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
