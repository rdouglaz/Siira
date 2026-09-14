import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { QuizType } from "@/lib/quiz/generator";

const QUIZ_TYPES: QuizType[] = ["multiple-choice", "matching", "fill-blank"];

// GET /api/quiz/daily?language=zh&type=multiple-choice
// Returns today's AI-generated quiz. If none exists (AI down / not yet
// generated), falls back to a random previously saved quiz.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "zh";
    const type = (searchParams.get("type") || "multiple-choice") as QuizType;

    if (!["zh", "de"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    if (!QUIZ_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const today = new Date().toISOString().slice(0, 10);

    // 1) Today's quiz
    const { data: todays } = await supabase
      .from("daily_quizzes")
      .select("id, language, quiz_date, quiz_type, content")
      .eq("language", language)
      .eq("quiz_type", type)
      .eq("quiz_date", today)
      .maybeSingle();

    if (todays?.content) {
      return NextResponse.json({
        source: "daily",
        quizDate: todays.quiz_date,
        quizType: todays.quiz_type,
        language: todays.language,
        content: todays.content,
      });
    }

    // 2) Fallback: random previously saved quiz (real inventory builds over time)
    const { data: past } = await supabase
      .from("daily_quizzes")
      .select("quiz_date, quiz_type, language, content")
      .eq("language", language)
      .eq("quiz_type", type)
      .order("quiz_date", { ascending: false })
      .limit(20);

    if (past && past.length > 0) {
      const pick = past[Math.floor(Math.random() * past.length)];
      return NextResponse.json({
        source: "fallback",
        quizDate: pick.quiz_date,
        quizType: pick.quiz_type,
        language: pick.language,
        content: pick.content,
      });
    }

    // 3) Nothing saved yet — client uses the offline word-list generator
    return NextResponse.json({ source: "none" }, { status: 404 });
  } catch (error) {
    console.error("Daily quiz fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
