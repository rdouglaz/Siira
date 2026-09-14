import type { WordBreakdown } from "@/data/conversations";

export interface ExtractedVocab {
  wordId: string | null;
  text: string;
  romanization?: string;
  translation: string;
}

/**
 * Phase 4: Extract vocabulary from LLM breakdown for SRS.
 * - Prefers matching existing inventory entries (by text)
 * - Falls back to breakdown text with generated id
 */
export function extractVocabFromBreakdown(
  breakdown: WordBreakdown[],
  language: "zh" | "de",
  inventoryLookup: (text: string) => string | null
): ExtractedVocab[] {
  const seen = new Set<string>();
  const out: ExtractedVocab[] = [];

  for (const b of breakdown) {
    const key = `${b.word}::${b.translation}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const matchedId = inventoryLookup(b.word);
    // Also try inventory by id convention? lookup handles it.
    void language;
    out.push({
      wordId: matchedId,
      text: b.word,
      romanization: b.romanization,
      translation: b.translation,
    });
  }

  return out;
}

export function findInventoryIdByText(
  words: { id: string; target: string }[],
  text: string
): string | null {
  const found = words.find((w) => w.target === text);
  return found ? found.id : null;
}
