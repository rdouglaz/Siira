"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = email.includes("@") && password.length >= 6;

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/talk");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=/talk`
                : undefined,
          },
        });
        if (error) throw error;
        setDone(true);
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : "Something went wrong";
      const msg = raw.toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        setError("Incorrect email or password.");
      } else if (msg.includes("already registered") || msg.includes("user already exists")) {
        setError("An account with this email already exists. Try signing in.");
      } else if (msg.includes("weak password") || msg.includes("password should be")) {
        setError("Password must be at least 6 characters.");
      } else if (msg.includes("not configured") || msg.includes("supabase")) {
        setError("Auth is not configured yet. Check environment variables.");
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="h-dvh bg-[#FDFBF7] flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <a href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#F97316]" />
            <span
              className="text-[#1C1917] font-bold text-lg tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              siira
            </span>
          </a>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-5 pb-8">
          <motion.div
            className="w-full max-w-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)" }}
            >
              <CheckCircle2 size={32} className="text-[#16A34A]" strokeWidth={1.5} />
            </div>
            <h2
              className="text-xl font-bold text-[#1C1917] mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Check your inbox
            </h2>
            <p className="text-[#78716C] mb-6">
              We sent a confirmation link to{" "}
              <span className="font-semibold text-[#1C1917]">{email}</span>. Click it to activate
              your account.
            </p>
            <motion.button
              onClick={() => {
                setDone(false);
                setMode("signin");
              }}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
              whileTap={{ scale: 0.95 }}
            >
              Back to sign in
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[#FDFBF7] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
        <motion.button
          onClick={handleBack}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#F0EDE8] shadow-sm flex items-center justify-center text-[#78716C] hover:bg-[#F5F1EC] transition-colors"
          whileTap={{ scale: 0.93 }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </motion.button>
        <a href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#F97316]" />
          <span
            className="text-[#1C1917] font-bold text-lg tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            siira
          </span>
        </a>
      </header>

      {/* Scrollable body — overflow-y-auto here, not on the outer container */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center px-5 py-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Logo + title */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)" }}
              >
                <span
                  className="text-white font-bold text-2xl"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  s
                </span>
              </div>
              <h1
                className="text-2xl font-bold text-[#1C1917] mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {mode === "signin" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-[#78716C] text-sm">
                {mode === "signin"
                  ? "Sign in to continue learning."
                  : "Start your language journey."}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex rounded-xl bg-[#F5F1EC] p-1 mb-5">
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: mode === m ? "white" : "transparent",
                    color: mode === m ? "#1C1917" : "#A8A29E",
                    boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#1C1917] mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#F0EDE8] bg-white text-[#1C1917] placeholder-[#C7BDB8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 disabled:opacity-50"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#1C1917] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-[#F0EDE8] bg-white text-[#1C1917] placeholder-[#C7BDB8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 disabled:opacity-50"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C] p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={2} />
                    ) : (
                      <Eye size={18} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA]"
                  >
                    <div className="flex items-center gap-2 text-[#B91C1C]">
                      <AlertCircle size={15} strokeWidth={2} />
                      <span className="text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || !valid}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base mt-1"
                style={{
                  background:
                    loading || !valid
                      ? "#D6D3D1"
                      : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
                  opacity: loading || !valid ? 0.7 : 1,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 size={20} className="mx-auto animate-spin" />
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-[12px] text-[#C7BDB8]">
              By continuing, you agree to our{" "}
              <a href="/privacy" className="underline text-[#F97316]">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" className="underline text-[#F97316]">
                Terms
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
