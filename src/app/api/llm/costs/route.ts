import { NextRequest, NextResponse } from "next/server";
import { getCostSummary, getRecentCosts } from "@/lib/llm/cost-tracker";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hours = Number(searchParams.get("hours") ?? "24");
  const limit = Number(searchParams.get("limit") ?? "50");

  const safeHours = Number.isFinite(hours) && hours > 0 && hours <= 720 ? hours : 24;
  const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 200 ? limit : 50;

  return NextResponse.json({
    summary: getCostSummary(safeHours),
    recent: getRecentCosts(safeLimit),
  });
}
