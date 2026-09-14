"use client";

import { motion } from "framer-motion";
import type { PronunciationResult } from "@/lib/pronunciation/scoring";

export function PronunciationFeedback({ result }: { result: PronunciationResult | null }) {
  if (!result) return null;

  const color = result.score >= 85 ? "#16A34A" : result.score >= 65 ? "#F97316" : "#DC2626";

  return (
    <motion.div
      className="w-full rounded-2xl bg-white p-4"
      style={{ border: "1.5px solid #F0EDE8" }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[#1C1917]">Pronunciation</span>
        <span className="text-sm font-bold" style={{ color }}>
          {result.score}/100
        </span>
      </div>

      <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${result.score}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {result.words.map((w, i) => (
          <span
            key={`${w.expected}-${i}`}
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: w.matched ? "#DCFCE7" : "#FEE2E2",
              color: w.matched ? "#15803D" : "#B91C1C",
            }}
            title={w.heard ? `Heard: ${w.heard}` : "Not heard"}
          >
            {w.expected}
          </span>
        ))}
      </div>

      <p className="text-[13px] text-[#78716C]">{result.feedback}</p>
      {result.toneFeedback && (
        <p className="text-[12px] text-[#A8A29E] mt-1">声调提示：{result.toneFeedback}</p>
      )}
    </motion.div>
  );
}
