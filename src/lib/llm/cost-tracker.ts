// Cost tracking for LLM usage
export interface CostEntry {
  timestamp: number;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  language: string;
  requestType: "chat" | "explanation";
}

const costLog: CostEntry[] = [];

// Estimated costs per 1K tokens (approximate, update as needed)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "ministral-14b-2512": { input: 0.0002, output: 0.0006 },
  "ministral-8b-2512": { input: 0.0001, output: 0.0003 },
  "mistral-medium-latest": { input: 0.0004, output: 0.0008 },
  "ministral-3b-2512": { input: 0.00005, output: 0.00015 },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
  "nvidia/nemotron-3-ultra": { input: 0.0001, output: 0.0002 },
};

export function logLLMCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  language: string,
  requestType: "chat" | "explanation"
): number {
  const costs = MODEL_COSTS[model] || { input: 0, output: 0 };
  const inputCost = (promptTokens / 1000) * costs.input;
  const outputCost = (completionTokens / 1000) * costs.output;
  const totalCost = inputCost + outputCost;
  const totalTokens = promptTokens + completionTokens;

  const entry: CostEntry = {
    timestamp: Date.now(),
    provider,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost: totalCost,
    language,
    requestType,
  };

  costLog.push(entry);

  // Keep only last 10000 entries
  if (costLog.length > 10000) {
    costLog.shift();
  }

  console.log(
    `[COST] ${provider}/${model} | ${promptTokens}→${completionTokens} tokens | $${totalCost.toFixed(6)} | ${language} | ${requestType}`
  );

  return totalCost;
}

export function getCostSummary(hours = 24): {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byProvider: Record<string, { cost: number; tokens: number; requests: number }>;
  byModel: Record<string, { cost: number; tokens: number; requests: number }>;
  byLanguage: Record<string, { cost: number; tokens: number; requests: number }>;
} {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const recentEntries = costLog.filter((e) => e.timestamp >= cutoff);

  const summary = {
    totalCost: 0,
    totalTokens: 0,
    totalRequests: recentEntries.length,
    byProvider: {} as Record<string, { cost: number; tokens: number; requests: number }>,
    byModel: {} as Record<string, { cost: number; tokens: number; requests: number }>,
    byLanguage: {} as Record<string, { cost: number; tokens: number; requests: number }>,
  };

  for (const entry of recentEntries) {
    summary.totalCost += entry.estimatedCost;
    summary.totalTokens += entry.totalTokens;

    // By provider
    if (!summary.byProvider[entry.provider]) {
      summary.byProvider[entry.provider] = { cost: 0, tokens: 0, requests: 0 };
    }
    summary.byProvider[entry.provider].cost += entry.estimatedCost;
    summary.byProvider[entry.provider].tokens += entry.totalTokens;
    summary.byProvider[entry.provider].requests += 1;

    // By model
    if (!summary.byModel[entry.model]) {
      summary.byModel[entry.model] = { cost: 0, tokens: 0, requests: 0 };
    }
    summary.byModel[entry.model].cost += entry.estimatedCost;
    summary.byModel[entry.model].tokens += entry.totalTokens;
    summary.byModel[entry.model].requests += 1;

    // By language
    if (!summary.byLanguage[entry.language]) {
      summary.byLanguage[entry.language] = { cost: 0, tokens: 0, requests: 0 };
    }
    summary.byLanguage[entry.language].cost += entry.estimatedCost;
    summary.byLanguage[entry.language].tokens += entry.totalTokens;
    summary.byLanguage[entry.language].requests += 1;
  }

  return summary;
}

export function getRecentCosts(limit = 100): CostEntry[] {
  return costLog.slice(-limit).reverse();
}

export function clearCostLog() {
  costLog.length = 0;
}