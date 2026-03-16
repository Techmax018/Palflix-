export const dynamic = "force-dynamic";

import { VideoFeed } from "@/components/video-feed";
import { query } from "@/lib/db";

export default async function FeedPage() {
  const videos = await query(
    `SELECT v.*, p.username, p.display_name, p.avatar_url, p.is_verified
     FROM videos v
     JOIN profiles p ON p.id = v.user_id
     WHERE v.status = 'active' AND v.is_private = false
     ORDER BY v.created_at DESC
     LIMIT 20`
  ).catch(() => []);

  const feedVideos = videos.map((v) => ({
    ...v,
    profiles: {
      username: v.username,
      display_name: v.display_name,
      avatar_url: v.avatar_url,
      is_verified: v.is_verified,
    },
    user_has_liked: false,
    user_is_following: false,
  }));

  return <VideoFeed initialVideos={feedVideos} />;
}
