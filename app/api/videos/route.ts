import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/videos?limit=20&uid=xxx
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

  const videos = await query(
    `SELECT v.*, p.username, p.display_name, p.avatar_url, p.is_verified
     FROM videos v
     JOIN profiles p ON p.id = v.user_id
     WHERE v.status = 'active' AND v.is_private = false
     ORDER BY v.created_at DESC
     LIMIT $1`,
    [limit]
  );

  let likedIds: string[] = [];
  let followingIds: string[] = [];

  if (uid) {
    const likes = await query("SELECT video_id FROM video_likes WHERE user_id = $1", [uid]);
    likedIds = likes.map((l) => l.video_id);

    const follows = await query("SELECT following_id FROM follows WHERE follower_id = $1", [uid]);
    followingIds = follows.map((f) => f.following_id);
  }

  const result = videos.map((v) => ({
    ...v,
    user_has_liked: likedIds.includes(v.id),
    user_is_following: followingIds.includes(v.user_id),
  }));

  return NextResponse.json(result);
}

// POST /api/videos — create video record after Cloudinary upload
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, title, description, video_url, thumbnail_url, tags, is_private, is_subscribers_only } = body;

  if (!user_id || !video_url) {
    return NextResponse.json({ error: "user_id and video_url required" }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, tags, is_private, is_subscribers_only, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
     RETURNING *`,
    [user_id, title || "Untitled", description, video_url, thumbnail_url, tags ?? [], is_private ?? false, is_subscribers_only ?? false]
  );

  return NextResponse.json(rows[0]);
}
