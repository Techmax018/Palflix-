import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/profiles?uid=xxx
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const rows = await query("SELECT * FROM profiles WHERE id = $1", [uid]);
  return NextResponse.json(rows[0] ?? null);
}

// POST /api/profiles — create or update profile
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, username, display_name, avatar_url, bio, profile_visible, two_factor_enabled } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await query(
    `INSERT INTO profiles (id, username, display_name, avatar_url, bio, profile_visible, two_factor_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       username = COALESCE(EXCLUDED.username, profiles.username),
       display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
       avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
       bio = COALESCE(EXCLUDED.bio, profiles.bio),
       profile_visible = EXCLUDED.profile_visible,
       two_factor_enabled = EXCLUDED.two_factor_enabled,
       updated_at = NOW()`,
    [id, username, display_name, avatar_url, bio, profile_visible ?? true, two_factor_enabled ?? false]
  );

  return NextResponse.json({ success: true });
}
