import type { QuizType, Language } from "./generator";

// ─── AI quiz generation prompts (daily fresh content, saved to Supabase) ───────

export function getQuizGenerationPrompt(language: Language, quizType: QuizType): string {
  const langName = language === "zh" ? "Mandarin Chinese" : "German";
  const beginNote =
    language === "zh"
      ? "For Chinese include pinyin with tone marks for every Chinese string (field promptSub/answerSub/leftSub)."
      : "For German include a short pronunciation hint where helpful (field promptSub/answerSub/leftSub).";

  if (quizType === "multiple-choice") {
    return `You are Sirra's curriculum designer. Create a fresh ${langName} multiple-choice vocabulary quiz for beginners (everyday words, greetings, food, family, numbers).
${beginNote}
Return ONLY valid JSON, no markdown, no extra text, with this exact shape:
{
  "questions": [
    {
      "prompt": "word or meaning being tested",
      "promptSub": "pinyin/pronunciation hint (empty string if not needed)",
      "direction": "target-to-meaning",
      "options": ["correct answer", "distractor 1", "distractor 2", "distractor 3"],
      "answerIndex": 0,
      "explanation": "one short sentence explaining the answer with an example"
    }
  ]
}
REQUIREMENTS:
- Exactly 10 questions, varied everyday vocabulary, no duplicates.
- Mix directions: half "target-to-meaning" (prompt in ${langName}, options in English), half "meaning-to-target".
- Distractors must be plausible (same category: all foods, all verbs, etc.).
- answerIndex must be the position of the correct option (vary it: 0-3 across questions).
- Keep prompts short (1-4 words).`;
  }

  if (quizType === "matching") {
    return `You are Sirra's curriculum designer. Create a fresh ${langName} word-matching set for beginners (everyday words: greetings, food, family, numbers, common verbs).
${beginNote}
Return ONLY valid JSON, no markdown, no extra text, with this exact shape:
{
  "pairs": [
    { "left": "word in ${langName}", "leftSub": "pinyin/pronunciation hint", "right": "English meaning" }
  ]
}
REQUIREMENTS:
- Exactly 6 pairs, varied everyday vocabulary, no duplicates.
- Keep words short (1-3 words). Avoid pairs with identical English meanings.`;
  }

  return `You are Sirra's curriculum designer. Create a fresh ${langName} fill-in-the-blank quiz for beginners (simple everyday sentences).
${beginNote}
Return ONLY valid JSON, no markdown, no extra text, with this exact shape:
{
  "questions": [
    {
      "before": "sentence part before the blank (in ${langName})",
      "after": "sentence part after the blank (empty string if blank is at the end)",
      "answer": "the missing word (in ${langName})",
      "answerSub": "pinyin/pronunciation of the answer",
      "hint": "English meaning of the missing word + tiny grammar nudge",
      "options": ["correct word", "distractor 1", "distractor 2", "distractor 3"],
      "answerIndex": 0
    }
  ]
}
REQUIREMENTS:
- Exactly 10 questions, simple sentences (4-10 words), everyday situations.
- before + answer + after must form a complete correct sentence.
- Distractors must fit the same slot plausibly (same part of speech).
- Vary answerIndex across 0-3.`;
}

function cleanJson(raw: string): string {
  return raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export interface DailyMCQContent {
  questions: Array<{
    prompt: string;
    promptSub?: string;
    direction: "target-to-meaning" | "meaning-to-target";
    options: string[];
    answerIndex: number;
    explanation: string;
  }>;
}

export interface DailyMatchingContent {
  pairs: Array<{ left: string; leftSub?: string; right: string }>;
}

export interface DailyFillBlankContent {
  questions: Array<{
    before: string;
    after: string;
    answer: string;
    answerSub?: string;
    hint: string;
    options: string[];
    answerIndex: number;
  }>;
}

export function parseQuizResponse(
  raw: string,
  quizType: QuizType
): DailyMCQContent | DailyMatchingContent | DailyFillBlankContent | null {
  try {
    const parsed = JSON.parse(cleanJson(raw));
    if (quizType === "matching") {
      if (!Array.isArray(parsed.pairs)) return null;
      return parsed as DailyMatchingContent;
    }
    if (!Array.isArray(parsed.questions)) return null;
    return parsed as DailyMCQContent | DailyFillBlankContent;
  } catch (error) {
    console.error("Failed to parse quiz response:", error);
    return null;
  }
}

export function validateQuizContent(
  content: DailyMCQContent | DailyMatchingContent | DailyFillBlankContent,
  quizType: QuizType
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (quizType === "matching") {
    const c = content as DailyMatchingContent;
    if (c.pairs.length < 6) errors.push("Need at least 6 pairs");
    c.pairs.forEach((p, i) => {
      if (!p.left || !p.right) errors.push(`Pair ${i} missing left/right`);
    });
    const rights = c.pairs.map((p) => p.right);
    if (new Set(rights).size !== rights.length) errors.push("Pair meanings must be unique");
    return { valid: errors.length === 0, errors };
  }

  const qs = (content as DailyMCQContent).questions;
  if (!qs || qs.length < 10) {
    errors.push("Need at least 10 questions");
    return { valid: false, errors };
  }
  qs.forEach((q: { options?: string[]; answerIndex?: number; prompt?: string }, i: number) => {
    if (!q.prompt) errors.push(`Question ${i} missing prompt`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Question ${i} needs exactly 4 options`);
    if (
      typeof q.answerIndex !== "number" ||
      q.answerIndex < 0 ||
      q.answerIndex > 3 ||
      !q.options?.[q.answerIndex]
    ) {
      errors.push(`Question ${i} has invalid answerIndex`);
    }
  });

  return { valid: errors.length === 0, errors };
}
