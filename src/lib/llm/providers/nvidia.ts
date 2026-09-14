import { LLMModelConfig, LLMMessage, LLMResponse, LLMError } from "../types";

export async function callNvidiaNim(
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

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-ultra",
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: LLMError = {
      code: `NVIDIA_${response.status}`,
      message: errorData.error?.message || `HTTP ${response.status}`,
      provider: config.id as any,
      retryable: response.status >= 500 || response.status === 429,
    };
    throw error;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response from NVIDIA NIM");
  }

  return {
    content,
    modelUsed: config.id as any,
    tokensUsed: data.usage?.total_tokens,
    latencyMs,
  };
}