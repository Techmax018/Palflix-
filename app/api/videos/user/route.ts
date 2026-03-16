import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/videos/user?uid=xxx
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const videos = await query(
    `SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC`,
    [uid]
  );

  return NextResponse.json(videos);
}
