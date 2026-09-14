"use client";

import { useState, useCallback } from "react";
import { Language } from "@/lib/llm/types";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  modelUsed?: string;
  latencyMs?: number;
}

export interface UseTutorOptions {
  language: Language;
  themeId?: string;
  userLevel?: string;
  onResponse?: (message: TutorMessage) => void;
  onError?: (error: Error) => void;
}

export function useTutor(options: UseTutorOptions) {
  const { language, themeId, userLevel, onResponse, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string, conversationHistory: TutorMessage[] = [], forceQuality = false) => {
      setIsLoading(true);
      setLastError(null);

      try {
        const recentExchanges = conversationHistory.slice(-6).reduce<Array<{ user: string; ai: string }>>(
          (acc, msg, idx, arr) => {
            if (msg.role === "user" && idx + 1 < arr.length && arr[idx + 1].role === "assistant") {
              acc.push({ user: msg.content, ai: arr[idx + 1].content });
            }
            return acc;
          },
          []
        );

        const response = await fetch("/api/llm/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage }],
            language,
            context: {
              themeId,
              userLevel,
              recentExchanges,
            },
            forceQuality,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const message: TutorMessage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
          modelUsed: data.modelUsed,
          latencyMs: data.latencyMs,
        };

        onResponse?.(message);
        return message;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setLastError(err);
        onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [language, themeId, userLevel, onResponse, onError]
  );

  const requestExplanation = useCallback(
    async (userMessage: string, aiReply: string, context?: string) => {
      setIsLoading(true);
      setLastError(null);

      try {
        const response = await fetch("/api/llm/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            userMessage,
            aiReply,
            context,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        return data.content;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setLastError(err);
        onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [language, onError]
  );

  return {
    sendMessage,
    requestExplanation,
    isLoading,
    lastError,
    clearError: () => setLastError(null),
  };
}