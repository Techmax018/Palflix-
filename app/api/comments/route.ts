import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/comments?video_id=xxx
export async function GET(req: NextRequest) {
  const video_id = req.nextUrl.searchParams.get("video_id");
  if (!video_id) return NextResponse.json({ error: "video_id required" }, { status: 400 });

  const rows = await query(
    `SELECT c.*, p.username, p.display_name, p.avatar_url
     FROM comments c
     JOIN profiles p ON p.id = c.user_id
     WHERE c.video_id = $1 AND c.parent_id IS NULL
     ORDER BY c.created_at DESC
     LIMIT 50`,
    [video_id]
  );
  return NextResponse.json(rows);
}

// POST /api/comments
export async function POST(req: NextRequest) {
  const { user_id, video_id, content } = await req.json();
  if (!user_id || !video_id || !content) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO comments (user_id, video_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [user_id, video_id, content]
  );
  await query("UPDATE videos SET comment_count = comment_count + 1 WHERE id = $1", [video_id]);

  return NextResponse.json(rows[0]);
}
