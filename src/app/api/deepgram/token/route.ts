import { NextRequest, NextResponse } from "next/server";
import { deepgramRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await deepgramRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Verify the request comes from our app (optional: check referer or custom header)
  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    console.error("DEEPGRAM_API_KEY not configured");
    return NextResponse.json(
      { error: "Deepgram not configured" },
      { status: 503 }
    );
  }

  // Return a short-lived JWT for the client to use with Deepgram.
  // Deepgram permits up to one hour for grant tokens.
  const tokenExpiry = 600;

  try {
    const response = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ttl_seconds: tokenExpiry,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Deepgram token error:", response.status, error);
      return NextResponse.json(
        { error: "Failed to create Deepgram token" },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    // Return token without exposing the master API key
    return NextResponse.json({
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });
  } catch (error) {
    console.error("Token endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
