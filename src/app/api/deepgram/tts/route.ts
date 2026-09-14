import { NextRequest, NextResponse } from "next/server";
import { deepgramRateLimit } from "@/lib/rate-limit";

const DEEPGRAM_TTS_URL = "https://api.deepgram.com/v1/speak";

const VOICE_MAP: Record<"zh" | "de" | "en", { female: string; male: string }> = {
  zh: { female: "aura-asteria-zh", male: "aura-orpheus-zh" },
  de: { female: "aura-asteria-de", male: "aura-orpheus-de" },
  en: { female: "aura-asteria-en", male: "aura-orpheus-en" },
};

function getVoiceForLanguage(language: "zh" | "de" | "en", preferFemale = true): string {
  const voices = VOICE_MAP[language] || VOICE_MAP.en;
  return preferFemale ? voices.female : voices.male;
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await deepgramRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    console.error("DEEPGRAM_API_KEY not configured");
    return NextResponse.json(
      { error: "TTS service not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { text, language = "en", voice, preferFemale = true } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const selectedVoice = voice || getVoiceForLanguage(language, preferFemale);

    const response = await fetch(`${DEEPGRAM_TTS_URL}?model=${selectedVoice}`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Deepgram TTS error:", response.status, error);
      return NextResponse.json(
        { error: "TTS generation failed" },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("TTS proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}