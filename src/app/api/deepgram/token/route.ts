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

  // Return a short-lived token for the client to use with Deepgram
  // This token expires in ~10 minutes (600 seconds)
  const tokenExpiry = 600;

  try {
    // Deepgram token endpoint
    const response = await fetch("https://api.deepgram.com/v1/projects/default/keys", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "siira-temp-token",
        scopes: ["listen", "speak"],
        ttl: tokenExpiry,
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
      token: data.token,
      expiresAt: Date.now() + tokenExpiry * 1000,
    });
  } catch (error) {
    console.error("Token endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}