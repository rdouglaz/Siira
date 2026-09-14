export type Language = "zh" | "de";

export type LLMProvider =
  | "mistral-14b"
  | "mistral-8b"
  | "mistral-medium"
  | "mistral-3b"
  | "gemini-flash"
  | "nvidia-nim";

export interface LLMModelConfig {
  id: LLMProvider;
  name: string;
  apiUrl: string;
  apiKeyEnv: string;
  priority: "high" | "normal" | "fallback";
  bestFor: ("explanations" | "conversation" | "speed")[];
  maxTokens: number;
  temperature: number;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  language: Language;
  context?: {
    themeId?: string;
    userLevel?: string;
    recentExchanges?: Array<{ user: string; ai: string }>;
  };
  forceQuality?: boolean;
}

export interface LLMResponse {
  content: string;
  modelUsed: LLMProvider;
  tokensUsed?: number;
  latencyMs: number;
}

export interface LLMError {
  code: string;
  message: string;
  provider: LLMProvider;
  retryable: boolean;
}

export interface TutorContext {
  language: Language;
  themeId?: string;
  userLevel?: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  isExplanationRequest: boolean;
}