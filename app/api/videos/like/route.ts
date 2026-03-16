import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/videos/like  { user_id, video_id, liked: bool }
export async function POST(req: NextRequest) {
  const { user_id, video_id, liked } = await req.json();
  if (!user_id || !video_id) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  if (liked) {
    await query(
      "INSERT INTO video_likes (user_id, video_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [user_id, video_id]
    );
    await query("UPDATE videos SET like_count = like_count + 1 WHERE id = $1", [video_id]);
  } else {
    await query("DELETE FROM video_likes WHERE user_id = $1 AND video_id = $2", [user_id, video_id]);
    await query("UPDATE videos SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1", [video_id]);
  }

  return NextResponse.json({ success: true });
}
