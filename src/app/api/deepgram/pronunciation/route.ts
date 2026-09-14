import { NextRequest, NextResponse } from "next/server";
import { scorePronunciation } from "@/lib/pronunciation/scoring";
import { deepgramRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await deepgramRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { expectedText, transcript, language = "zh", wordConfidences = [] } = body ?? {};

    if (!expectedText || typeof expectedText !== "string") {
      return NextResponse.json({ error: "expectedText is required" }, { status: 400 });
    }
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }
    if (!["zh", "de"].includes(language)) {
      return NextResponse.json({ error: "language must be zh or de" }, { status: 400 });
    }

    const result = scorePronunciation(expectedText, transcript, wordConfidences, language);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[Pronunciation] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
