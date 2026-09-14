import { NextRequest, NextResponse } from "next/server";
import { generateTutorResponse } from "@/lib/llm/service";
import { LLMRequest } from "@/lib/llm/types";
import { llmRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await llmRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: LLMRequest = await request.json();

    if (!body.messages || !body.messages.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    if (!body.language || !["zh", "de"].includes(body.language)) {
      return NextResponse.json({ error: "Valid language (zh/de) is required" }, { status: 400 });
    }

    const response = await generateTutorResponse(body);

    return NextResponse.json({
      content: response.content,
      modelUsed: response.modelUsed,
      tokensUsed: response.tokensUsed,
      latencyMs: response.latencyMs,
    });
  } catch (error) {
    console.error("[LLM API] Error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("API key") ? 503 : 500;

    return NextResponse.json(
      { error: message, fallback: true },
      { status }
    );
  }
}