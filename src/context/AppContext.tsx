"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { WordBreakdown } from "@/data/conversations";
import { useAuth } from "./AuthContext";

export type Language = "zh" | "de";
export type Tab = "talk" | "themes" | "words" | "quiz";

export interface ConversationMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  romanization?: string;
  translation?: string;
  breakdown?: WordBreakdown[];
  timestamp: number;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  selectedThemeId: string | null;
  setSelectedThemeId: (id: string | null) => void;
  conversationHistory: ConversationMessage[];
  addMessage: (msg: Omit<ConversationMessage, "id" | "timestamp">) => void;
  clearConversation: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, user, refreshProfile } = useAuth();
  const [language, setLanguage] = useState<Language>("zh");
  const [activeTab, setActiveTab] = useState<Tab>("talk");
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Sync language from profile on mount and when profile changes
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language);
    }
  }, [profile]);

  const setLanguageWithSync = useCallback((lang: Language) => {
    setLanguage(lang);
    if (user) {
      // Persist to Supabase
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        supabase
          .from("profiles")
          .update({ preferred_language: lang, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      });
    }
  }, [user]);

  const addMessage = useCallback((msg: Omit<ConversationMessage, "id" | "timestamp">) => {
    setConversationHistory((prev) => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random()}`, timestamp: Date.now() },
    ]);
  }, []);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: setLanguageWithSync,
        activeTab,
        setActiveTab,
        selectedThemeId,
        setSelectedThemeId,
        conversationHistory,
        addMessage,
        clearConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    return {
      language: "zh" as const,
      setLanguage: () => {},
      activeTab: "talk" as const,
      setActiveTab: () => {},
      selectedThemeId: null,
      setSelectedThemeId: () => {},
      conversationHistory: [],
      addMessage: () => {},
      clearConversation: () => {},
    };
  }
  return ctx;
}