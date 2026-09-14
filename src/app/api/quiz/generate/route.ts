import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateTutorResponse } from "@/lib/llm/service";
import {
  getQuizGenerationPrompt,
  parseQuizResponse,
  validateQuizContent,
} from "@/lib/quiz/prompts";
import type { QuizType, Language } from "@/lib/quiz/generator";
import { themeRateLimit } from "@/lib/rate-limit";

const QUIZ_TYPES: QuizType[] = ["multiple-choice", "matching", "fill-blank"];

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await themeRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const language: Language = body.language || "zh";
    const quizType: QuizType = body.quizType || body.type || "multiple-choice";
    const quizDate: string =
      typeof body.quizDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.quizDate)
        ? body.quizDate
        : todayISODate();

    if (!["zh", "de"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    if (!QUIZ_TYPES.includes(quizType)) {
      return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
    }

    const prompt = getQuizGenerationPrompt(language, quizType);

    const llmResponse = await generateTutorResponse({
      messages: [{ role: "user", content: prompt }],
      language,
      context: {},
      forceQuality: true,
    });

    const content = parseQuizResponse(llmResponse.content, quizType);
    if (!content) {
      console.error("Failed to parse quiz:", llmResponse.content);
      return NextResponse.json(
        { error: "Failed to parse generated quiz", modelUsed: llmResponse.modelUsed },
        { status: 500 }
      );
    }

    const validation = validateQuizContent(content, quizType);
    if (!validation.valid) {
      console.error("Quiz validation failed:", validation.errors);
      return NextResponse.json(
        { error: "Generated quiz failed validation", errors: validation.errors },
        { status: 500 }
      );
    }

    const supabase = await createServiceClient();
    const { data: row, error: upsertError } = await supabase
      .from("daily_quizzes")
      .upsert(
        {
          language,
          quiz_date: quizDate,
          quiz_type: quizType,
          content,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "language,quiz_date,quiz_type" }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Supabase quiz upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save quiz", details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: {
        id: row.id,
        language: row.language,
        quizDate: row.quiz_date,
        quizType: row.quiz_type,
      },
      modelUsed: llmResponse.modelUsed,
      latencyMs: llmResponse.latencyMs,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
