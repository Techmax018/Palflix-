import { createClient } from "@/lib/supabase/server";
import { DiscoverGrid } from "@/components/discover-grid";

export default async function DiscoverPage() {
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from("videos")
    .select(
      `
      id, title, thumbnail_url, video_url, view_count, like_count, 
      duration, user_id,
      profiles!videos_user_id_fkey (username, display_name, avatar_url)
    `
    )
    .eq("status", "active")
    .eq("is_private", false)
    .order("view_count", { ascending: false })
    .limit(30);

  return (
    <div className="flex flex-col pb-16">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">
          Discover
        </h1>
      </header>
      <DiscoverGrid videos={videos || []} />
    </div>
  );
}
