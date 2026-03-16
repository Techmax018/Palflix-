export const dynamic = "force-dynamic";

import { DiscoverGrid } from "@/components/discover-grid";
import { query } from "@/lib/db";

export default async function DiscoverPage() {
  const videos = await query(
    `SELECT v.id, v.title, v.thumbnail_url, v.video_url, v.view_count, v.like_count, v.duration, v.user_id,
            p.username, p.display_name, p.avatar_url
     FROM videos v
     JOIN profiles p ON p.id = v.user_id
     WHERE v.status = 'active' AND v.is_private = false
     ORDER BY v.view_count DESC
     LIMIT 30`
  ).catch(() => []);

  return (
    <div className="flex flex-col pb-16">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">Discover</h1>
      </header>
      <DiscoverGrid videos={videos} />
    </div>
  );
}
