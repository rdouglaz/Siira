import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);

    let query = supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(Number.isFinite(limit) ? limit : 100);

    if (language === "zh" || language === "de") {
      query = query.eq("language", language);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ conversations: (data ?? []).reverse() });
  } catch (error) {
    console.error("[Conversations] GET error:", error);
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { language, themeId, role, content, romanization, translation, breakdown } = body ?? {};

    if (!["zh", "de"].includes(language)) {
      return NextResponse.json({ error: "language must be zh or de" }, { status: 400 });
    }
    if (!["user", "assistant"].includes(role)) {
      return NextResponse.json({ error: "role must be user or assistant" }, { status: 400 });
    }
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        language,
        theme_id: themeId ?? null,
        role,
        content,
        romanization: romanization ?? null,
        translation: translation ?? null,
        breakdown: breakdown ?? [],
      })
      .select("id, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("[Conversations] POST error:", error);
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}
