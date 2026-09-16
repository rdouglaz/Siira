"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/supabase/types";

export type SpeakingSpeed = "slow" | "normal" | "fast";
export type DailyGoalMinutes = 10 | 15 | 20;

export interface UserPrefs {
  speakingSpeed: SpeakingSpeed;
  dailyGoalMinutes: DailyGoalMinutes;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  streak: number;
  prefs: UserPrefs;
  updatePrefs: (p: Partial<UserPrefs>) => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const defaultPrefs: UserPrefs = {
  speakingSpeed: "normal",
  dailyGoalMinutes: 15,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<UserPrefs>(defaultPrefs);

  // Lazy init: createBrowserClient throws when env vars are absent (e.g. during
  // SSR prerendering at build time). useState initializer runs once, client-side.
  const [supabase] = useState(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return null;
    }
    return createClient();
  });

  const fetchProfile = useCallback(async () => {
    if (!user || !supabase) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data);
        setPrefs({
          speakingSpeed: "normal", // Could be stored in profile later
          dailyGoalMinutes: data.daily_goal_minutes as DailyGoalMinutes,
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  }, [user, supabase]);

  // Always-current ref so the subscription closure never captures a stale fetchProfile.
  const fetchProfileRef = useRef(fetchProfile);
  fetchProfileRef.current = fetchProfile;

  // Initial session check — deps are [supabase] ONLY.
  // Using fetchProfileRef.current() inside the subscription breaks the dep cycle:
  // fetchProfile depends on [user], user changes on auth event → fetchProfile gets a
  // new reference → without the ref pattern, this effect would re-run on every login,
  // calling initAuth() again → setUser(newObj) → new fetchProfile → infinite loop.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await fetchProfileRef.current();
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updatePrefs = useCallback(async (p: Partial<UserPrefs>) => {
    const newPrefs = { ...prefs, ...p };
    setPrefs(newPrefs);

    if (user && supabase && p.dailyGoalMinutes !== undefined) {
      try {
        await supabase
          .from("profiles")
          .update({ daily_goal_minutes: p.dailyGoalMinutes, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch (err) {
        console.error("Error updating prefs:", err);
      }
    }
  }, [prefs, user, supabase]);

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: new Error("Auth not configured") };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    return { error };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setPrefs(defaultPrefs);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const streak = profile?.current_streak ?? 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        streak,
        prefs,
        updatePrefs,
        signInWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a default context for pages that don't have AuthProvider (e.g., _not-found)
    return {
      user: null,
      session: null,
      profile: null,
      loading: false,
      streak: 0,
      prefs: { speakingSpeed: "normal" as const, dailyGoalMinutes: 15 as const },
      updatePrefs: async () => {},
      signInWithEmail: async () => ({ error: new Error("Auth not available") }),
      signOut: async () => {},
      refreshProfile: async () => {},
    };
  }
  return ctx;
}

// ─── Level utility ────────────────────────────────────────────────────────────

export interface LevelInfo {
  label: string;
  color: string;
  nextAt: number;
}

export function getLevel(mastered: number): LevelInfo {
  if (mastered >= 200) return { label: "Advanced", color: "#8B5CF6", nextAt: 500 };
  if (mastered >= 50) return { label: "Intermediate", color: "#3B82F6", nextAt: 200 };
  if (mastered >= 15) return { label: "Elementary", color: "#22C55E", nextAt: 50 };
  if (mastered >= 5) return { label: "Beginner", color: "#F97316", nextAt: 15 };
  return { label: "Newbie", color: "#A8A29E", nextAt: 5 };
}