import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST /api/comments/like  { comment_id, liked: bool }
export async function POST(req: NextRequest) {
  const { comment_id, liked } = await req.json();
  if (!comment_id) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  if (liked) {
    await query("UPDATE comments SET like_count = like_count + 1 WHERE id = $1", [comment_id]);
  } else {
    await query("UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1", [comment_id]);
  }

  return NextResponse.json({ success: true });
}
