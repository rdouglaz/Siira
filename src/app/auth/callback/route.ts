import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the Supabase magic-link redirect: exchanges the auth code for a
// session (setting cookies), then sends the user into the app.
// Every failure path redirects back to /auth with a machine-readable
// ?error= flag so the user always lands on a working page — never a dead end.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/talk";

  const fail = (flag: string) => NextResponse.redirect(`${origin}/auth?error=${flag}`, 303);
  const done = (to: string) => NextResponse.redirect(`${origin}${to}`, 303);

  if (!code) {
    return fail("missing");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[auth/callback] missing Supabase env vars");
    return fail("config");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] exchange failed:", error.message);
      const msg = error.message.toLowerCase();
      if (msg.includes("verifier") || msg.includes("pkce")) {
        // Link opened in a different browser/device than the one that
        // requested it — the PKCE verifier cookie isn't here.
        return fail("verifier");
      }
      if (msg.includes("expired") || msg.includes("invalid") || msg.includes("already")) {
        return fail("expired");
      }
      return fail("exchange");
    }

    return done(next.startsWith("/") ? next : "/talk");
  } catch (e) {
    console.error("[auth/callback] unexpected error:", e);
    return fail("unexpected");
  }
}
