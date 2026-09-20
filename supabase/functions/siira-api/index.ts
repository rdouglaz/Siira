import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const validLanguage = (value: unknown): value is "zh" | "de" => value === "zh" || value === "de";
const providerOrder = ["mistral", "gemini", "nvidia"] as const;
type Provider = (typeof providerOrder)[number];

function tutorPrompt(language: "zh" | "de", context: Record<string, unknown> = {}) {
  const languageName = language === "zh" ? "Mandarin Chinese" : "German";
  const theme = typeof context.themeId === "string" ? ` Current theme: ${context.themeId}.` : "";
  const level = typeof context.userLevel === "string" ? ` Learner level: ${context.userLevel}.` : "";
  return `You are Sirra, a warm, slightly playful ${languageName} speaking tutor. Stay in character as Sirra. Reply in 1–3 short sentences, primarily in ${languageName}, then include a concise English translation in parentheses. Gently model corrections instead of judging. For Chinese include pinyin for new or difficult words; for German mention gender or case only when useful.${theme}${level}`;
}

async function callProvider(provider: Provider, messages: Array<{ role: string; content: string }>, quality: boolean) {
  const start = Date.now();
  if (provider === "mistral") {
    const key = Deno.env.get("MISTRAL_API_KEY");
    if (!key) throw new Error("MISTRAL_API_KEY is not configured");
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: quality ? "mistral-medium-latest" : "ministral-8b-2512", messages, max_tokens: quality ? 800 : 600, temperature: 0.7 }),
    });
    const data = await response.json();
    if (!response.ok || !data.choices?.[0]?.message?.content) throw new Error(data.error?.message || `Mistral returned ${response.status}`);
    return { content: data.choices[0].message.content.trim(), model: quality ? "mistral-medium" : "mistral-8b", tokens: data.usage?.total_tokens, latency: Date.now() - start };
  }
  if (provider === "gemini") {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new Error("GEMINI_API_KEY is not configured");
    const contents = messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
    const systemInstruction = messages.find((message) => message.role === "system")?.content;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}), generationConfig: { maxOutputTokens: 600, temperature: 0.7 } }),
    });
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim();
    if (!response.ok || !content) throw new Error(data.error?.message || `Gemini returned ${response.status}`);
    return { content, model: "gemini-flash", tokens: data.usageMetadata?.totalTokenCount, latency: Date.now() - start };
  }
  const key = Deno.env.get("NVIDIA_NIM_API_KEY");
  if (!key) throw new Error("NVIDIA_NIM_API_KEY is not configured");
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nvidia/nemotron-3-ultra", messages, max_tokens: 600, temperature: 0.7 }),
  });
  const data = await response.json();
  if (!response.ok || !data.choices?.[0]?.message?.content) throw new Error(data.error?.message || `NVIDIA returned ${response.status}`);
  return { content: data.choices[0].message.content.trim(), model: "nvidia-nim", tokens: data.usage?.total_tokens, latency: Date.now() - start };
}

async function generateLLM(language: "zh" | "de", userMessage: string, context: Record<string, unknown>, explanation = false) {
  const history = Array.isArray(context.recentExchanges) ? context.recentExchanges.slice(-4).flatMap((item: { user?: string; ai?: string }) => [{ role: "user", content: String(item.user ?? "") }, { role: "assistant", content: String(item.ai ?? "") }]) : [];
  const system = explanation ? "You are Sirra, a clear and encouraging language tutor. Give a short answer followed by a useful explanation and examples when needed." : tutorPrompt(language, context);
  const messages = [{ role: "system", content: system }, ...history, { role: "user", content: userMessage }];
  let lastError: unknown;
  for (const provider of providerOrder) {
    try { return await callProvider(provider, messages, explanation); } catch (error) { lastError = error; console.warn(`[${provider}] failed`, error); }
  }
  throw lastError instanceof Error ? lastError : new Error("No AI provider is configured");
}

function parseModelJson(content: string): unknown {
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

async function generateDailyThemes(supabase: ReturnType<typeof createClient>) {
  const date = new Date().toISOString().slice(0, 10);
  const results: Array<{ language: string; type: string; ok: boolean; error?: string }> = [];
  for (const language of ["zh", "de"] as const) {
    try {
      const theme = await generateLLM(language, `Return only valid JSON for a beginner ${language === "zh" ? "Mandarin" : "German"} daily conversation theme: {"title":"...","description":"...","difficulty":"Beginner","phrases":[{"target":"...","translation":"..."}]}. Include 5 useful phrases.`, {}, true);
      const content = parseModelJson(theme.content);
      const themeData = content as { title?: string; description?: string; difficulty?: string };
      if (!themeData.title || !themeData.description) throw new Error("Theme response was not valid JSON");
      await supabase.from("themes").update({ is_daily: false }).eq("language", language).eq("is_daily", true);
      await supabase.from("themes").insert({ title: themeData.title, description: themeData.description, language, difficulty: themeData.difficulty ?? "Beginner", content, is_daily: true, generated_at: new Date().toISOString() }).throwOnError();
      results.push({ language, type: "theme", ok: true });
    } catch (error) { results.push({ language, type: "theme", ok: false, error: error instanceof Error ? error.message : "Unknown error" }); }

  }
  return results;
}

async function generateDailyQuizzes(supabase: ReturnType<typeof createClient>) {
  const date = new Date().toISOString().slice(0, 10);
  const results: Array<{ language: string; type: string; ok: boolean; error?: string }> = [];
  for (const language of ["zh", "de"] as const) {
    for (const type of ["multiple-choice", "matching", "fill-blank"] as const) {
      try {
        const shape = type === "multiple-choice" ? '{"questions":[{"prompt":"...","promptSub":"...","direction":"target-to-meaning","options":["...","...","...","..."],"answerIndex":0}]}' : type === "matching" ? '{"pairs":[{"left":"...","right":"..."}]}' : '{"questions":[{"before":"...","after":"...","answer":"...","options":["...","...","...","..."]}]}';
        const response = await generateLLM(language, `Return only valid JSON for a beginner ${language === "zh" ? "Mandarin" : "German"} ${type} quiz. Include 10 items. Schema: ${shape}`, {}, true);
        const content = parseModelJson(response.content);
        await supabase.from("daily_quizzes").upsert({ language, quiz_date: date, quiz_type: type, content, generated_at: new Date().toISOString() }, { onConflict: "language,quiz_date,quiz_type" }).throwOnError();
        results.push({ language, type, ok: true });
      } catch (error) { results.push({ language, type, ok: false, error: error instanceof Error ? error.message : "Unknown error" }); }
    }
  }
  return results;
}

async function requireUser(request: Request, supabase: ReturnType<typeof createClient>) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(request.url);
  const action = url.pathname.replace(/^.*\/siira-api\/?/, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  if (["jobs/themes", "jobs/quizzes"].includes(action) && request.method === "POST") {
    const secret = Deno.env.get("CRON_SECRET");
    if (!secret || request.headers.get("x-cron-secret") !== secret) return json({ error: "Unauthorized" }, 401);
    const results = action === "jobs/themes" ? await generateDailyThemes(supabase) : await generateDailyQuizzes(supabase);
    const ok = results.every((result) => result.ok);
    return json({ ok, results }, ok ? 200 : 500);
  }
  const user = await requireUser(request, supabase);
  if (!user) return json({ error: "Unauthorized" }, 401);

  try {
    if (action === "deepgram/token" && request.method === "GET") {
      const key = Deno.env.get("DEEPGRAM_API_KEY");
      if (!key) return json({ error: "DEEPGRAM_API_KEY is not configured" }, 503);
      const response = await fetch("https://api.deepgram.com/v1/auth/grant", { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ ttl_seconds: 600 }) });
      const data = await response.json();
      if (!response.ok || !data.access_token) return json({ error: "Deepgram token issuance failed" }, 502);
      return json({ token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 600) * 1000 });
    }

    if (action === "deepgram/tts" && request.method === "POST") {
      const { text, language = "en", voice, preferFemale = true } = await request.json();
      if (typeof text !== "string" || !text.trim() || text.length > 5000) return json({ error: "text must be 1–5000 characters" }, 400);
      const key = Deno.env.get("DEEPGRAM_API_KEY");
      if (!key) return json({ error: "DEEPGRAM_API_KEY is not configured" }, 503);
      const voices: Record<string, { female: string; male: string }> = { zh: { female: "aura-2-asteria-zh", male: "aura-2-orion-zh" }, de: { female: "aura-2-asteria-de", male: "aura-2-orion-de" }, en: { female: "aura-2-asteria-en", male: "aura-2-orion-en" } };
      const selectedVoice = typeof voice === "string" ? voice : (voices[language] ?? voices.en)[preferFemale ? "female" : "male"];
      const response = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(selectedVoice)}`, { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "application/json", Accept: "audio/mpeg" }, body: JSON.stringify({ text: text.trim() }) });
      if (!response.ok) return json({ error: "Deepgram TTS failed" }, 502);
      return new Response(await response.arrayBuffer(), { headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" } });
    }

    if (action === "llm/chat" && request.method === "POST") {
      const body = await request.json();
      if (!validLanguage(body.language) || !Array.isArray(body.messages) || typeof body.messages.at(-1)?.content !== "string") return json({ error: "A zh/de language and message are required" }, 400);
      const result = await generateLLM(body.language, body.messages.at(-1).content, body.context ?? {}, Boolean(body.forceQuality));
      await supabase.from("llm_usage").insert({ user_id: user.id, provider: result.model.split("-")[0], model: result.model, tokens: result.tokens ?? 0, language: body.language, kind: "chat", latency_ms: result.latency }).throwOnError();
      return json({ content: result.content, modelUsed: result.model, tokensUsed: result.tokens, latencyMs: result.latency });
    }

    if (action === "llm/explain" && request.method === "POST") {
      const body = await request.json();
      if (!validLanguage(body.language) || typeof body.userMessage !== "string" || typeof body.aiReply !== "string") return json({ error: "language, userMessage, and aiReply are required" }, 400);
      const prompt = `Learner question: ${body.userMessage}\nPrevious reply: ${body.aiReply}${body.context ? `\nContext: ${body.context}` : ""}`;
      const result = await generateLLM(body.language, prompt, {}, true);
      await supabase.from("llm_usage").insert({ user_id: user.id, provider: result.model.split("-")[0], model: result.model, tokens: result.tokens ?? 0, language: body.language, kind: "explanation", latency_ms: result.latency }).throwOnError();
      return json({ content: result.content, modelUsed: result.model, tokensUsed: result.tokens, latencyMs: result.latency });
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("siira-api error", error);
    return json({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
