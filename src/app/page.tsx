"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Shield, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const languages = [
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const { setLanguage } = useApp();
  const [selectedLang, setSelectedLang] = useState<"zh" | "de">("zh");
  const [loading, setLoading] = useState(false);

  async function handleStart(lang: "zh" | "de") {
    setLoading(true);
    try {
      setLanguage(lang);
      router.push("/auth");
    } catch (e) {
      console.error("Auth error:", e);
      alert("Failed to start. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh bg-[#FDFBF7] flex flex-col overflow-hidden">
      {/* Hero — m-auto centers when short, top-aligns + scrolls when tall */}
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="m-auto w-full max-w-md sm:max-w-lg text-center px-5 py-4 sm:py-6"
        >
          {/* Logo */}
          <div className="mb-4 sm:mb-5 flex justify-center">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
                boxShadow: "0 8px 32px rgba(249,115,22,0.25)",
              }}
            >
              <span className="text-white font-bold text-2xl sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                s
              </span>
            </div>
          </div>

          <h1 className="text-[26px] sm:text-3xl font-bold text-[#1C1917] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Speak every day.
          </h1>
          <p className="text-[#78716C] text-[15px] sm:text-base mb-5 sm:mb-6 max-w-sm mx-auto leading-snug">
            A calm, speech-first language companion. Real conversation, real pronunciation feedback, real progress.
          </p>

          {/* Language selector */}
          <div className="mb-5 sm:mb-6">
            <p className="text-[13px] sm:text-sm font-semibold text-[#78716C] mb-2">Choose your language</p>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className="flex flex-col items-center gap-1 sm:gap-1.5 p-3 sm:p-4 rounded-2xl border-2 transition-all min-h-[44px]"
                  style={{
                    borderColor: selectedLang === lang.code ? "#F97316" : "#F0EDE8",
                    background: selectedLang === lang.code ? "#FFF4ED" : "white",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl sm:text-4xl leading-none">{lang.flag}</span>
                  <div className="text-center">
                    <p className="font-semibold text-[#1C1917] text-base sm:text-lg leading-tight">{lang.name}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#A8A29E]">{lang.native}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            onClick={() => handleStart(selectedLang)}
            disabled={loading}
            className="w-full py-3.5 sm:py-4 min-h-[52px] rounded-xl font-bold text-white text-base sm:text-lg flex items-center justify-center gap-2"
            style={{
              background: loading
                ? "#D6D3D1"
                : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <span>Start Speaking</span>
                <ArrowRight size={20} strokeWidth={2} />
              </>
            )}
          </motion.button>

          {/* Features */}
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="px-2 py-2.5 rounded-xl bg-white border border-[#F0EDE8]">
              <Sparkles size={20} className="mx-auto text-[#F97316]" strokeWidth={2} />
              <p className="text-[10px] sm:text-[11px] text-[#78716C] mt-1 font-medium leading-tight">Pronunciation Feedback</p>
            </div>
            <div className="px-2 py-2.5 rounded-xl bg-white border border-[#F0EDE8]">
              <Shield size={20} className="mx-auto text-[#F97316]" strokeWidth={2} />
              <p className="text-[10px] sm:text-[11px] text-[#78716C] mt-1 font-medium leading-tight">Private & Secure</p>
            </div>
            <div className="px-2 py-2.5 rounded-xl bg-white border border-[#F0EDE8]">
              <Globe size={20} className="mx-auto text-[#F97316]" strokeWidth={2} />
              <p className="text-[10px] sm:text-[11px] text-[#78716C] mt-1 font-medium leading-tight">Chinese & German</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="px-5 pt-2 text-center shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <p className="text-[11px] text-[#C7BDB8]">
          By continuing, you agree to our{" "}
          <a href="/privacy" className="underline text-[#F97316]">Privacy Policy</a>
          {" "}and{" "}
          <a href="/terms" className="underline text-[#F97316]">Terms</a>
        </p>
      </footer>
    </div>
  );
}