import { LLMModelConfig, LLMProvider, Language } from "./types";

export const LLM_MODELS: Record<LLMProvider, LLMModelConfig> = {
  "mistral-14b": {
    id: "mistral-14b",
    name: "Ministral 14B (2512)",
    apiUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKeyEnv: "MISTRAL_API_KEY",
    priority: "high",
    bestFor: ["explanations", "conversation"],
    maxTokens: 800,
    temperature: 0.7,
  },
  "mistral-8b": {
    id: "mistral-8b",
    name: "Ministral 8B (2512)",
    apiUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKeyEnv: "MISTRAL_API_KEY",
    priority: "normal",
    bestFor: ["conversation"],
    maxTokens: 600,
    temperature: 0.75,
  },
  "mistral-medium": {
    id: "mistral-medium",
    name: "Mistral Medium Latest",
    apiUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKeyEnv: "MISTRAL_API_KEY",
    priority: "high",
    bestFor: ["explanations", "conversation"],
    maxTokens: 800,
    temperature: 0.7,
  },
  "mistral-3b": {
    id: "mistral-3b",
    name: "Ministral 3B (2512)",
    apiUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKeyEnv: "MISTRAL_API_KEY",
    priority: "normal",
    bestFor: ["speed", "conversation"],
    maxTokens: 500,
    temperature: 0.8,
  },
  "gemini-flash": {
    id: "gemini-flash",
    name: "Google Gemini 1.5 Flash",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    apiKeyEnv: "GEMINI_API_KEY",
    priority: "fallback",
    bestFor: ["conversation", "speed"],
    maxTokens: 600,
    temperature: 0.75,
  },
  "nvidia-nim": {
    id: "nvidia-nim",
    name: "NVIDIA NIM (Nemotron 3 Ultra)",
    apiUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKeyEnv: "NVIDIA_NIM_API_KEY",
    priority: "fallback",
    bestFor: ["conversation", "speed"],
    maxTokens: 600,
    temperature: 0.7,
  },
};

export const MODEL_PRIORITY: LLMProvider[] = [
  "mistral-14b",
  "mistral-8b",
  "mistral-medium",
  "mistral-3b",
  "gemini-flash",
  "nvidia-nim",
];

export function getAvailableModels(): LLMModelConfig[] {
  return MODEL_PRIORITY.map((id) => LLM_MODELS[id]).filter((m) => {
    const key = process.env[m.apiKeyEnv];
    return key && key.length > 0;
  });
}

export function selectModel(
  language: Language,
  isExplanationRequest: boolean,
  availableModels: LLMModelConfig[]
): LLMModelConfig | null {
  if (availableModels.length === 0) return null;

  if (isExplanationRequest) {
    const strongModels = availableModels.filter((m) =>
      m.bestFor.includes("explanations")
    );
    if (strongModels.length > 0) return strongModels[0];
  }

  const fastModels = availableModels.filter((m) =>
    m.bestFor.includes("speed")
  );
  if (fastModels.length > 0) return fastModels[0];

  const conversationModels = availableModels.filter((m) =>
    m.bestFor.includes("conversation")
  );
  if (conversationModels.length > 0) return conversationModels[0];

  return availableModels[0];
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 429;
  }
  if (error && typeof error === "object" && "status" in error) {
    return (error as { status: number }).status === 429;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /rate.?limit|429|quota|exceeded/i.test(message);
}

export function isRetryableError(error: unknown): boolean {
  if (isRateLimitError(error)) return true;
  if (error instanceof TypeError && error.message.includes("fetch")) return true;
  if (error instanceof Response && error.status >= 500) return true;
  return false;
}