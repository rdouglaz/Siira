export interface PronunciationWordScore {
  expected: string;
  heard: string | null;
  matched: boolean;
  confidence: number | null;
}

export interface PronunciationResult {
  score: number; // 0-100
  expectedText: string;
  transcript: string;
  words: PronunciationWordScore[];
  feedback: string;
  toneFeedback?: string | null;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？！。，、；：“”‘’（）《》〈〉「」『』〔〕…—·,.!?;:"'()\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function scorePronunciation(
  expectedText: string,
  transcript: string,
  wordConfidences: { word: string; confidence: number }[] = [],
  language: "zh" | "de" = "zh"
): PronunciationResult {
  const expectedNorm = normalize(expectedText);
  const heardNorm = normalize(transcript);

  const expectedWords = expectedNorm.split(" ").filter(Boolean);
  const heardWords = heardNorm.split(" ").filter(Boolean);

  // For Chinese without spaces, fall back to character-level comparison
  const isChineseNoSpaces = language === "zh" && expectedWords.length <= 1 && heardWords.length <= 1;
  let words: PronunciationWordScore[];

  if (isChineseNoSpaces) {
    const expChars = [...expectedText.replace(/\s+/g, "")];
    const heardChars = [...transcript.replace(/\s+/g, "")];
    const maxLen = Math.max(expChars.length, heardChars.length, 1);
    let matched = 0;
    words = expChars.map((ch, i) => {
      const h = heardChars[i] ?? null;
      const m = h === ch;
      if (m) matched++;
      return {
        expected: ch,
        heard: h,
        matched: m,
        confidence: wordConfidences[i]?.confidence ?? null,
      };
    });
    const score = Math.round((matched / maxLen) * 100);
    return {
      score,
      expectedText,
      transcript,
      words,
      feedback: feedbackForScore(score, language),
      toneFeedback: language === "zh" ? toneFeedbackForScore(score) : null,
    };
  }

  const maxLen = Math.max(expectedWords.length, heardWords.length, 1);
  let matched = 0;
  words = expectedWords.map((w, i) => {
    const h = heardWords[i] ?? null;
    const dist = h == null ? w.length : levenshtein(w, h);
    const threshold = Math.max(1, Math.floor(w.length / 3));
    const m = dist <= threshold;
    if (m) matched++;
    return {
      expected: w,
      heard: h,
      matched: m,
      confidence: wordConfidences[i]?.confidence ?? null,
    };
  });

  const score = Math.round((matched / maxLen) * 100);
  return {
    score,
    expectedText,
    transcript,
    words,
    feedback: feedbackForScore(score, language),
    toneFeedback: language === "zh" ? toneFeedbackForScore(score) : null,
  };
}

function feedbackForScore(score: number, language: "zh" | "de"): string {
  if (score >= 90) return language === "zh" ? "发音非常准确！太棒了！" : "Ausgezeichnete Aussprache!";
  if (score >= 75) return language === "zh" ? "很好！注意个别字的发音。" : "Sehr gut! Achte auf einzelne Laute.";
  if (score >= 55) return language === "zh" ? "不错，慢慢来，再试一次。" : "Nicht schlecht – versuch es noch einmal.";
  return language === "zh" ? "没关系，听一遍示范再跟读。" : "Kein Problem – hör zu und sprich nach.";
}

function toneFeedbackForScore(score: number): string {
  if (score >= 90) return "声调很稳，继续保持。";
  if (score >= 70) return "注意第二声上扬、第四声干脆下落。";
  return "先放慢速度，一个字一个声调跟读。";
}
