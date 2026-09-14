export interface StuckSignals {
  consecutiveErrors: number;
  emptyTranscripts: number;
  helpRequests: number;
  againCount: number;
  silenceCount: number;
}

export type ScaffoldingLevel = 0 | 1 | 2 | 3;

export function getScaffoldingLevel(signals: StuckSignals): ScaffoldingLevel {
  const score =
    signals.consecutiveErrors * 2 +
    signals.emptyTranscripts +
    signals.helpRequests * 2 +
    Math.min(signals.againCount, 4) +
    signals.silenceCount;

  if (score >= 8) return 3;
  if (score >= 5) return 2;
  if (score >= 2) return 1;
  return 0;
}

export function scaffoldingHint(level: ScaffoldingLevel, language: "zh" | "de"): string | null {
  if (level === 0) return null;
  if (level === 1) {
    return language === "zh"
      ? "提示：注意关键词，先跟读一遍。"
      : "Tipp: Achte auf Schlüsselwörter und sprich nach.";
  }
  if (level === 2) {
    return language === "zh"
      ? "别担心，我放慢一点，你可以只说关键词。"
      : "Keine Sorge – sprich langsamer, Schlüsselwörter genügen.";
  }
  return language === "zh"
    ? "我来示范，你跟读即可，不用整句。"
    : "Ich spreche vor, du sprichst einfach nach.";
}

export function shouldForceQuality(level: ScaffoldingLevel): boolean {
  return level >= 2;
}
