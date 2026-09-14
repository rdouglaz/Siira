import { NextRequest, NextResponse } from "next/server";
import { themeRateLimit } from "@/lib/rate-limit";

// Daily cron: generate fresh AI quizzes for both languages × all quiz types.
// Content is saved to `daily_quizzes`; the app falls back to past days when
// generation fails.
export async function GET(request: NextRequest) {
  const rateLimitResponse = await themeRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8443";

    const jobs: Array<{ language: string; quizType: string }> = [];
    for (const language of ["zh", "de"]) {
      for (const quizType of ["multiple-choice", "matching", "fill-blank"]) {
        jobs.push({ language, quizType });
      }
    }

    const results = [];
    for (const job of jobs) {
      try {
        const response = await fetch(`${baseUrl}/api/quiz/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cronSecret}`,
          },
          body: JSON.stringify(job),
        });

        const result = await response.json();

        if (response.ok) {
          results.push({ ...job, success: true, quiz: result.quiz });
        } else {
          results.push({ ...job, success: false, error: result.error });
        }
      } catch (error) {
        results.push({
          ...job,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const allSuccess = results.every((r) => r.success);

    return NextResponse.json(
      {
        success: allSuccess,
        generatedAt: new Date().toISOString(),
        results,
      },
      { status: allSuccess ? 200 : 500 }
    );
  } catch (error) {
    console.error("Quiz cron job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron job failed" },
      { status: 500 }
    );
  }
}
