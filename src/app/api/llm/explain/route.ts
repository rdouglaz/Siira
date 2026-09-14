import { NextRequest, NextResponse } from "next/server";
import { generateExplanation } from "@/lib/llm/service";
import { llmRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await llmRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    const { language, userMessage, aiReply, context } = body;

    if (!language || !["zh", "de"].includes(language)) {
      return NextResponse.json({ error: "Valid language (zh/de) is required" }, { status: 400 });
    }

    if (!userMessage || !aiReply) {
      return NextResponse.json({ error: "userMessage and aiReply are required" }, { status: 400 });
    }

    const response = await generateExplanation(language, userMessage, aiReply, context);

    return NextResponse.json({
      content: response.content,
      modelUsed: response.modelUsed,
      tokensUsed: response.tokensUsed,
      latencyMs: response.latencyMs,
    });
  } catch (error) {
    console.error("[LLM Explain API] Error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("API key") ? 503 : 500;

    return NextResponse.json(
      { error: message, fallback: true },
      { status }
    );
  }
}