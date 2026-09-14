import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMError,
  Language,
  TutorContext,
} from "./types";
import {
  LLM_MODELS,
  MODEL_PRIORITY,
  getAvailableModels,
  selectModel,
  isRetryableError,
  isRateLimitError,
} from "./models";
import { callMistral, callGemini, callNvidiaNim } from "./providers";
import { buildSystemPrompt, buildExplanationPrompt } from "./prompts";
import { logLLMCost } from "./cost-tracker";

const providerCallers: Record<LLMProvider, (config: any, messages: any[], maxTokens: number, temperature: number) => Promise<LLMResponse>> = {
  "mistral-14b": callMistral,
  "mistral-8b": callMistral,
  "mistral-medium": callMistral,
  "mistral-3b": callMistral,
  "gemini-flash": callGemini,
  "nvidia-nim": callNvidiaNim,
};

function detectExplanationRequest(message: string): boolean {
  const explanationKeywords = [
    "why",
    "explain",
    "correct",
    "correction",
    "grammar",
    "pronounce",
    "pronunciation",
    "tone",
    "meaning",
    "what does",
    "how do i say",
    "what is the difference",
    "when to use",
    "vs",
    "versus",
    "rule",
    "exception",
  ];
  const lower = message.toLowerCase();
  return explanationKeywords.some((kw) => lower.includes(kw));
}

function buildMessages(
  request: LLMRequest,
  systemPrompt: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (request.context?.recentExchanges) {
    for (const ex of request.context.recentExchanges.slice(-4)) {
      messages.push({ role: "user", content: ex.user });
      messages.push({ role: "assistant", content: ex.ai });
    }
  }

  messages.push({ role: "user", content: request.messages[request.messages.length - 1]?.content || "" });

  return messages;
}

async function callProvider(
  providerId: LLMProvider,
  messages: Array<{ role: string; content: string }>,
  config: any
): Promise<LLMResponse> {
  const caller = providerCallers[providerId];
  if (!caller) {
    throw new Error(`No caller for provider: ${providerId}`);
  }
  return caller(config, messages, config.maxTokens, config.temperature);
}

export async function generateTutorResponse(
  request: LLMRequest
): Promise<LLMResponse> {
  const availableModels = getAvailableModels();

  if (availableModels.length === 0) {
    throw new Error(
      "No LLM providers configured. Please add at least one API key to environment variables."
    );
  }

  const isExplanationRequest =
    request.forceQuality || detectExplanationRequest(request.messages[request.messages.length - 1]?.content || "");

  const tutorContext: TutorContext = {
    language: request.language,
    themeId: request.context?.themeId,
    userLevel: request.context?.userLevel,
    conversationHistory: request.context?.recentExchanges?.map((e) => ({
      role: "user" as const,
      content: e.user,
    })) || [],
    isExplanationRequest,
  };

  const systemPrompt = buildSystemPrompt(tutorContext);
  const messages = buildMessages(request, systemPrompt);

  let selectedModel = selectModel(request.language, isExplanationRequest, availableModels);
  let lastError: LLMError | Error | null = null;
  let attempt = 0;
  const maxAttempts = availableModels.length;

  while (selectedModel && attempt < maxAttempts) {
    attempt++;
    try {
      console.log(
        `[LLM] Attempt ${attempt}/${maxAttempts}: Using ${selectedModel.name} (${selectedModel.id}) for ${isExplanationRequest ? "explanation" : "conversation"}`
      );

      const response = await callProvider(selectedModel.id, messages, selectedModel);

      console.log(
        `[LLM] Success: ${selectedModel.name} responded in ${response.latencyMs}ms (${response.tokensUsed || "?"} tokens)`
      );

      // Log cost
      if (response.tokensUsed) {
        // Estimate prompt/completion split (roughly 1:2 for conversation)
        const promptTokens = Math.floor(response.tokensUsed / 3);
        const completionTokens = response.tokensUsed - promptTokens;
        logLLMCost(
          selectedModel.id,
          selectedModel.name,
          promptTokens,
          completionTokens,
          request.language,
          isExplanationRequest ? "explanation" : "chat"
        );
      }

      return response;
    } catch (error) {
      lastError = error as LLMError | Error;

      const isRateLimit = isRateLimitError(error);
      const isRetryable = isRetryableError(error);

      console.warn(
        `[LLM] ${selectedModel.name} failed: ${error instanceof Error ? error.message : String(error)} ${isRateLimit ? "(rate limited)" : ""}`
      );

      if (!isRetryable || attempt >= maxAttempts) {
        throw error;
      }

      const currentIndex = availableModels.findIndex((m) => m.id === selectedModel!.id);
      const remaining = availableModels.slice(currentIndex + 1);

      if (remaining.length === 0) {
        throw error;
      }

      selectedModel = selectModel(request.language, isExplanationRequest, remaining);
    }
  }

  throw lastError || new Error("All LLM providers failed");
}

export async function generateExplanation(
  language: Language,
  userMessage: string,
  aiReply: string,
  context?: string
): Promise<LLMResponse> {
  const availableModels = getAvailableModels();

  if (availableModels.length === 0) {
    throw new Error("No LLM providers configured");
  }

  const prompt = buildExplanationPrompt(language, userMessage, aiReply, context);
  const messages = [
    { role: "system" as const, content: "You are a helpful language tutor explaining concepts clearly." },
    { role: "user" as const, content: prompt },
  ];

  let selectedModel = selectModel(language, true, availableModels);
  let lastError: LLMError | Error | null = null;
  let attempt = 0;

  while (selectedModel && attempt < availableModels.length) {
    attempt++;
    try {
      console.log(
        `[LLM] Explanation: Using ${selectedModel.name} (${selectedModel.id})`
      );
      const response = await callProvider(selectedModel.id, messages, selectedModel);
      
      // Log cost for explanation
      if (response.tokensUsed) {
        const promptTokens = Math.floor(response.tokensUsed / 3);
        const completionTokens = response.tokensUsed - promptTokens;
        logLLMCost(
          selectedModel.id,
          selectedModel.name,
          promptTokens,
          completionTokens,
          language,
          "explanation"
        );
      }
      
      return response;
    } catch (error) {
      lastError = error as LLMError | Error;
      if (!isRetryableError(error) || attempt >= availableModels.length) {
        throw error;
      }
      const currentIndex = availableModels.findIndex((m) => m.id === selectedModel!.id);
      selectedModel = selectModel(language, true, availableModels.slice(currentIndex + 1));
    }
  }

  throw lastError || new Error("All LLM providers failed for explanation");
}

export async function getConfiguredProviders(): Promise<string[]> {
  return getAvailableModels().map((m) => `${m.name} (${m.id})`);
}