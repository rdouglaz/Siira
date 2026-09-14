import { NextRequest, NextResponse } from "next/server";
import { themeRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await themeRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8443";
    
    // Generate themes for both languages
    const languages = ["zh", "de"];
    const results = [];

    for (const lang of languages) {
      try {
        const response = await fetch(`${baseUrl}/api/themes/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cronSecret}`,
          },
          body: JSON.stringify({
            language: lang,
            difficulty: "Beginner", // Could vary by day or user level
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          results.push({ language: lang, success: true, theme: result.theme });
        } else {
          results.push({ language: lang, success: false, error: result.error });
        }
      } catch (error) {
        results.push({ 
          language: lang, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    
    return NextResponse.json({
      success: allSuccess,
      generatedAt: new Date().toISOString(),
      results,
    }, { status: allSuccess ? 200 : 500 });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron job failed" },
      { status: 500 }
    );
  }
}