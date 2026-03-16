import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/reposts  { user_id, video_id }
export async function POST(req: NextRequest) {
  const { user_id, video_id } = await req.json();
  if (!user_id || !video_id) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  // Check if already reposted
  const existing = await query(
    "SELECT id FROM reposts WHERE user_id = $1 AND video_id = $2",
    [user_id, video_id]
  );

  if (existing.length > 0) {
    // Undo repost
    await query("DELETE FROM reposts WHERE user_id = $1 AND video_id = $2", [user_id, video_id]);
    return NextResponse.json({ reposted: false });
  }

  // Repost — appears in followers' feeds
  await query(
    "INSERT INTO reposts (user_id, video_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [user_id, video_id]
  );
  return NextResponse.json({ reposted: true });
}
