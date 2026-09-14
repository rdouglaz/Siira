"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Surface auth-callback failures (?error=...) without useSearchParams
  // so this page stays statically prerenderable.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const flag = params.get("error");
      if (flag) {
        setError(errorMessageForFlag(flag));
      }
    } catch {}
  }, []);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  function errorMessageForFlag(flag: string): string {
    switch (flag) {
      case "missing":
        return "This sign-in link is incomplete. Please request a new one below.";
      case "expired":
        return "This link already expired or was already used. Request a new one below.";
      case "verifier":
        return "This link was opened in a different browser than the one that requested it. Please open it in the same browser, or request a new link below.";
      case "config":
        return "Sign-in is temporarily misconfigured. Please try again later.";
      case "exchange":
      case "callback":
      case "unexpected":
      default:
        return "Sign-in link failed. Please request a new one below.";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/talk`,
        },
      });

      if (error) throw error;

      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  function FormContent() {
    return (
      <motion.form
        onSubmit={(e) => handleSubmit(e)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-[#1C1917] mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]"
              strokeWidth={2}
            />
<input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F0EDE8] bg-white text-[#1C1917] placeholder-[#C7BDB8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 disabled:opacity-50"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || !email.includes("@")}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-opacity"
          style={{
            background: loading || !email.includes("@")
              ? "#D6D3D1"
              : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
            opacity: loading || !email.includes("@") ? 0.7 : 1,
          }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mx-auto"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={4}
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Sending...
            </>
          ) : (
            "Send magic link"
          )}
        </motion.button>

        <p className="text-[12px] text-[#C7BDB8] text-center mt-4">
          No password needed. We&rsquo;ll email you a secure link.
        </p>
      </motion.form>
    )
  }

  function SentView() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
          }}
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
          We&rsquo;ve sent a magic link to{" "}
          <span className="font-semibold text-[#1C1917]">{email}</span>.
        </p>
        <motion.button
          onClick={() => window.location.href = "/"}
          className="w-full py-3 rounded-xl font-bold text-white text-sm"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          Open Siira
        </motion.button>
      </motion.div>
    )
  }

  function ErrorView() {
    if (!error) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA]"
      >
        <div className="flex items-center gap-2 text-[#B91C1C]">
          <AlertCircle size={16} strokeWidth={2} />
          <span className="text-sm">{error}</span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#FDFBF7] flex flex-col">
      {/* Header with back navigation */}
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

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
              }}
            >
              <span
                className="text-white font-bold text-2xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                s
              </span>
            </div>
            <h1
              className="text-2xl font-bold text-[#1C1917] mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Sign in to Siira
            </h1>
            <p className="text-[#78716C]">Enter your email to receive a magic link.</p>
          </div>

          {!sent ? (
            <motion.form
              onSubmit={(e) => handleSubmit(e)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#1C1917] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F0EDE8] bg-white text-[#1C1917] placeholder-[#C7BDB8] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 disabled:opacity-50"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]"
                    strokeWidth={2}
                  />
                </div>
                {error && (
                  <p className="text-[12px] text-[#DC2626] mt-1">
                    {error}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || !email.includes("@")}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-opacity"
                style={{
                  background: loading || !email.includes("@")
                    ? "#D6D3D1"
                    : "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
                  opacity: loading || !email.includes("@") ? 0.7 : 1,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 size={20} className="mx-auto animate-spin" />
                ) : (
                  "Send magic link"
                )}
              </motion.button>

              <p className="text-[12px] text-[#C7BDB8] text-center mt-4">
                No password needed. We&rsquo;ll email you a secure link.
              </p>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
                }}
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
                We&rsquo;ve sent a magic link to{" "}
                <span className="font-semibold text-[#1C1917]">{email}</span>.
              </p>
              <motion.button
                onClick={() => router.push("/talk")}
                className="w-full py-3 rounded-xl font-bold text-white text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #F97316 0%, #C026D3 100%)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Open Siira
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA]"
          >
            <div className="flex items-center gap-2 text-[#B91C1C]">
              <AlertCircle size={16} strokeWidth={2} />
              <span className="text-sm">{error}</span>
            </div>
          </motion.div>
        )}

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
      </main>
    </div>
  );
}