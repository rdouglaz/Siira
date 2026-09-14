import { LLMModelConfig, LLMMessage, LLMResponse, LLMError } from "../types";

export async function callGemini(
  config: LLMModelConfig,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number
): Promise<LLMResponse> {
  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`Missing API key: ${config.apiKeyEnv}`);
  }

  const startTime = Date.now();

  const geminiMessages = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : m.role,
    parts: [{ text: m.content }],
  }));

  const response = await fetch(`${config.apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: LLMError = {
      code: `GEMINI_${response.status}`,
      message: errorData.error?.message || `HTTP ${response.status}`,
      provider: config.id as any,
      retryable: response.status >= 500 || response.status === 429,
    };
    throw error;
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!content) {
    throw new Error("Empty response from Gemini");
  }

  return {
    content,
    modelUsed: config.id as any,
    tokensUsed: data.usageMetadata?.totalTokenCount,
    latencyMs,
  };
}