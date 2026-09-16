"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Sparkles, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { difficultyColors, type Theme as StaticTheme } from "@/data/themes"
import { useApp } from "@/context/AppContext"
import { createClient } from "@/lib/supabase/client"

interface SupabaseTheme {
  id: string;
  title: string;
  description: string;
  language: "zh" | "de";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  content: Record<string, unknown>;
  is_daily: boolean;
  generated_at: string | null;
  created_at: string;
}

// Convert Supabase theme to UI format
function toUITheme(theme: SupabaseTheme): StaticTheme {
  return {
    id: theme.id,
    title: theme.title,
    description: theme.description,
    emoji: theme.language === "zh" ? "🀄" : "🇩🇪",
    difficulty: theme.difficulty,
    isToday: theme.is_daily,
  };
}

function DifficultyBadge({ level }: { level: StaticTheme["difficulty"] }) {
  const { bg, text } = difficultyColors[level];
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: bg, color: text }}
    >
      {level}
    </span>
  );
}

function TodayCard({ theme, onStart }: { theme: StaticTheme; onStart: () => void }) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.div
      className="w-full rounded-3xl p-4 sm:p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFF4ED 0%, #FDE8FF 55%, #EDE9FF 100%)",
        border: "1px solid rgba(249,115,22,0.18)",
        boxShadow: "0 4px 24px rgba(249,115,22,0.10), 0 1px 4px rgba(0,0,0,0.04)",
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Today label */}
      <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
        <Sparkles size={13} className="text-[#F97316]" strokeWidth={2} />
        <span className="text-[11px] font-bold tracking-widest text-[#F97316] uppercase">
          Today&rsquo;s Theme
        </span>
      </div>

      {/* Emoji */}
      <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 leading-none">{theme.emoji}</div>

      {/* Title */}
      <h2
        className="text-lg sm:text-xl font-bold text-[#1C1917] mb-1 sm:mb-1.5 leading-tight"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {theme.title}
      </h2>

      {/* Description */}
      <p className="text-[13px] sm:text-sm text-[#78716C] mb-3 sm:mb-4 leading-relaxed">{theme.description}</p>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <DifficultyBadge level={theme.difficulty} />

        <motion.button
          onClick={onStart}
          onTapStart={() => setPressed(true)}
          onTap={() => setPressed(false)}
          onTapCancel={() => setPressed(false)}
          className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full text-white text-sm font-semibold shrink-0"
          style={{
            background: pressed
              ? "linear-gradient(135deg, #EA580C 0%, #9333EA 100%)"
              : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
            boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          Start talking
          <ChevronRight size={14} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Decorative blobs */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: "radial-gradient(circle, #F97316, #C084FC)" }}
      />
    </motion.div>
  );
}

function ThemeCard({ theme, onStart }: { theme: StaticTheme; onStart: () => void }) {
  const [selected, setSelected] = useState(false);

  function handleTap() {
    setSelected(true);
    setTimeout(() => {
      setSelected(false);
      onStart();
    }, 280);
  }

  return (
    <motion.button
      onClick={handleTap}
      className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white text-left min-h-[64px]"
      style={{
        border: selected ? "1px solid rgba(249,115,22,0.35)" : "1px solid #F0EDE8",
        boxShadow: selected
          ? "0 4px 20px rgba(249,115,22,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        background: selected ? "#FFF9F5" : "white",
      }}
      whileTap={{ scale: 0.978 }}
      transition={{ duration: 0.15 }}
    >
      {/* Emoji container */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: "#FFF4ED" }}
      >
        {theme.emoji}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-[#1C1917] text-sm leading-snug truncate"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {theme.title}
        </p>
        <p className="text-[12px] text-[#A8A29E] mt-0.5 leading-snug line-clamp-1">
          {theme.description}
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <DifficultyBadge level={theme.difficulty} />
        <ChevronRight size={14} className="text-[#D6D3D1]" strokeWidth={2} />
      </div>
    </motion.button>
  );
}

function LoadingSkeleton() {
  return (
    <motion.div
      className="w-full rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #F5F5F4 25%, #E7E5E4 50%, #F5F5F4 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    >
      <div className="h-4 w-3/4 bg-white/50 rounded mb-4" />
      <div className="h-12 w-1/2 bg-white/50 rounded mb-3" />
      <div className="h-3 w-full bg-white/30 rounded mb-2" />
      <div className="h-3 w-2/3 bg-white/30 rounded mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 bg-white/50 rounded-full" />
        <div className="h-10 w-32 bg-white/50 rounded-full" />
      </div>
    </motion.div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 py-8 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AlertCircle size={48} className="text-[#F97316]" strokeWidth={1.5} />
      <p className="text-center text-[#78716C]">Couldn&rsquo;t load themes</p>
      <motion.button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
        whileTap={{ scale: 0.95 }}
      >
        Try again
      </motion.button>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function ThemesScreen() {
  const { language, setSelectedThemeId, setActiveTab } = useApp();
  const [themes, setThemes] = useState<StaticTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create once — createBrowserClient throws when env vars are absent (e.g. SSR).
  const [supabase] = useState(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) return null;
    return createClient();
  });

  const fetchThemes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("language", language)
        .order("is_daily", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const converted = (data || []).map(toUITheme);
      setThemes(converted);
    } catch (err) {
      console.error("Failed to fetch themes:", err);
      setError(err instanceof Error ? err.message : "Failed to load themes");
      // Fallback to static themes for current language
      const { themes: staticThemes } = await import("@/data/themes");
      setThemes(staticThemes.filter(t => t.language === language).map(t => ({
        ...t,
        id: t.id,
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [language]);

  const todayTheme = themes.find(t => t.isToday);
  const otherThemes = themes.filter(t => !t.isToday);

  const handleStartTheme = (theme: StaticTheme) => {
    setSelectedThemeId(theme.id);
    setActiveTab("talk");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-6 pt-3 sm:pt-4 pb-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-5 flex items-center justify-between shrink-0">
        <div>
          <h1
            className="text-[22px] sm:text-2xl font-bold text-[#1C1917] leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Themes
          </h1>
          <p className="text-[13px] sm:text-sm text-[#A8A29E] mt-0.5">Everyday conversations</p>
        </div>
        <motion.button
          onClick={fetchThemes}
          disabled={isLoading}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white border border-[#F0EDE8] text-[#A8A29E] hover:bg-[#F5F1EC] hover:text-[#78716C] transition-colors"
          whileTap={{ scale: 0.95 }}
          aria-label="Refresh themes"
        >
          <RefreshCw size={18} strokeWidth={2} className={isLoading ? "animate-spin" : ""} />
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LoadingSkeleton />
            <p className="text-[11px] font-bold tracking-widest text-[#C7BDB8] uppercase mb-3">
              More themes
            </p>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ErrorState onRetry={fetchThemes} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* Today's theme */}
            {todayTheme ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-6"
              >
                <TodayCard theme={todayTheme} onStart={() => handleStartTheme(todayTheme)} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center py-4"
              >
                <p className="text-[#A8A29E]">No daily theme generated yet.</p>
                <p className="text-[12px] text-[#C7BDB8] mt-1">Check back tomorrow or refresh to generate.</p>
              </motion.div>
            )}

            {/* Other themes */}
            {otherThemes.length > 0 && (
              <>
                <p className="text-[11px] font-bold tracking-widest text-[#C7BDB8] uppercase mb-3">
                  More themes
                </p>
                <motion.div
                  className="flex flex-col gap-3 pb-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {otherThemes.map((theme) => (
                    <motion.div key={theme.id} variants={itemVariants}>
                      <ThemeCard
                        theme={theme}
                        onStart={() => handleStartTheme(theme)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}