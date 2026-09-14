import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateTutorResponse } from "@/lib/llm/service";
import { getThemeGenerationPrompt, parseThemeResponse, validateThemeContent } from "@/lib/themes/prompts";
import { ThemeContent, Language, Difficulty } from "@/lib/themes/types";
import { themeRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await themeRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const language: Language = body.language || "zh";
    const difficulty: Difficulty = body.difficulty || "Beginner";

    // Validate language
    if (!["zh", "de"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    // Generate theme using LLM
    const prompt = getThemeGenerationPrompt(language, difficulty);
    
    const llmResponse = await generateTutorResponse({
      messages: [{ role: "user", content: prompt }],
      language,
      context: {},
      forceQuality: true, // Use stronger model for generation
    });

    // Parse and validate response
    const themeContent = parseThemeResponse(llmResponse.content);
    
    if (!themeContent) {
      console.error("Failed to parse theme:", llmResponse.content);
      return NextResponse.json(
        { error: "Failed to parse generated theme", modelUsed: llmResponse.modelUsed },
        { status: 500 }
      );
    }

    const validation = validateThemeContent(themeContent);
    if (!validation.valid) {
      console.error("Theme validation failed:", validation.errors);
      return NextResponse.json(
        { error: "Generated theme failed validation", errors: validation.errors },
        { status: 500 }
      );
    }

    // Insert into Supabase
    const supabase = await createServerClient();
    
    // First, mark any existing daily themes as non-daily
    await supabase
      .from("themes")
      .update({ is_daily: false, updated_at: new Date().toISOString() })
      .eq("language", language)
      .eq("is_daily", true);

    // Insert new daily theme
    const { data: theme, error: insertError } = await supabase
      .from("themes")
      .insert({
        title: themeContent.title,
        description: themeContent.description,
        language,
        difficulty: themeContent.difficulty,
        content: themeContent,
        is_daily: true,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save theme", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      theme: {
        id: theme.id,
        title: theme.title,
        description: theme.description,
        language: theme.language,
        difficulty: theme.difficulty,
        is_daily: theme.is_daily,
        generated_at: theme.generated_at,
      },
      modelUsed: llmResponse.modelUsed,
      latencyMs: llmResponse.latencyMs,
    });

  } catch (error) {
    console.error("Theme generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}