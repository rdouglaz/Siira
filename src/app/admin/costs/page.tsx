"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byProvider: Record<string, { cost: number; tokens: number; requests: number }>;
  byModel: Record<string, { cost: number; tokens: number; requests: number }>;
  byLanguage: Record<string, { cost: number; tokens: number; requests: number }>;
}

export default function CostsPage() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const load = async () => {
      try {
        const { data, error } = await createClient().from("llm_usage").select("provider, model, tokens, language").gte("created_at", since).order("created_at", { ascending: false }).limit(50);
        if (error) throw error;
        const blank = () => ({ cost: 0, tokens: 0, requests: 0 });
        const summary: CostSummary = { totalCost: 0, totalTokens: 0, totalRequests: 0, byProvider: {}, byModel: {}, byLanguage: {} };
        for (const item of data ?? []) {
          const buckets = [[summary.byProvider, item.provider], [summary.byModel, item.model], [summary.byLanguage, item.language]] as const;
          summary.totalTokens += item.tokens; summary.totalRequests += 1;
          for (const [bucket, key] of buckets) { const value = bucket[key] ?? (bucket[key] = blank()); value.tokens += item.tokens; value.requests += 1; }
        }
        setSummary(summary);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    };
    void load();
  }, []);

  return (
    <div className="min-h-dvh bg-[#FDFBF7] flex flex-col">
      <div className="flex flex-col flex-1 max-w-md mx-auto w-full px-5 py-6">
        <h1 className="text-2xl font-bold text-[#1C1917]">LLM Costs (24h)</h1>
        <p className="text-sm text-[#78716C] mt-1">
          Persistent usage tracking from Supabase Edge Functions.
        </p>

        {error && <p className="text-sm text-[#DC2626] mt-4">{error}</p>}
        {!summary && !error && <p className="text-sm text-[#A8A29E] mt-4">Loading…</p>}

        {summary && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="rounded-2xl bg-white p-4" style={{ border: "1.5px solid #F0EDE8" }}>
              <p className="text-sm font-bold">Total: ${summary.totalCost.toFixed(4)}</p>
              <p className="text-xs text-[#78716C]">
                {summary.totalRequests} requests · {summary.totalTokens} tokens
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4" style={{ border: "1.5px solid #F0EDE8" }}>
              <p className="text-sm font-bold mb-2">By provider</p>
              {Object.entries(summary.byProvider).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1">
                  <span className="text-[#78716C]">{k}</span>
                  <span className="font-semibold">
                    ${v.cost.toFixed(4)} · {v.requests} req
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-4" style={{ border: "1.5px solid #F0EDE8" }}>
              <p className="text-sm font-bold mb-2">By language</p>
              {Object.entries(summary.byLanguage).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1">
                  <span className="text-[#78716C]">{k}</span>
                  <span className="font-semibold">
                    ${v.cost.toFixed(4)} · {v.requests} req
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
