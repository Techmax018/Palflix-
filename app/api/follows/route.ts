import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/follows?follower_id=&following_id=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const follower_id = searchParams.get("follower_id");
  const following_id = searchParams.get("following_id");
  if (!follower_id || !following_id) return NextResponse.json({ following: false });
  if (follower_id === following_id) return NextResponse.json({ following: false });
  const rows = await query(
    "SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2",
    [follower_id, following_id]
  );
  return NextResponse.json({ following: rows.length > 0 });
}

// POST /api/follows  { follower_id, following_id, follow: bool }
export async function POST(req: NextRequest) {
  const { follower_id, following_id, follow } = await req.json();
  if (!follower_id || !following_id) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  if (follower_id === following_id) return NextResponse.json({ error: "cannot follow yourself" }, { status: 400 });

  if (follow) {
    await query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [follower_id, following_id]
    );
    await query("UPDATE profiles SET follower_count = follower_count + 1 WHERE id = $1", [following_id]);
    await query("UPDATE profiles SET following_count = following_count + 1 WHERE id = $1", [follower_id]);
  } else {
    await query("DELETE FROM follows WHERE follower_id = $1 AND following_id = $2", [follower_id, following_id]);
    await query("UPDATE profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = $1", [following_id]);
    await query("UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1", [follower_id]);
  }

  return NextResponse.json({ success: true });
}
