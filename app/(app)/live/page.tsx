import { createClient } from "@/lib/supabase/server";
import { LiveHub } from "@/components/live-hub";

export default async function LivePage() {
  const supabase = await createClient();

  const { data: streams } = await supabase
    .from("live_streams")
    .select(
      `
      id, title, description, thumbnail_url, status, viewer_count, started_at, user_id,
      profiles!live_streams_user_id_fkey (
        username, display_name, avatar_url, is_verified
      )
    `
    )
    .in("status", ["live", "scheduled"])
    .order("status", { ascending: true })
    .order("viewer_count", { ascending: false })
    .limit(20);

  return <LiveHub streams={streams || []} />;
}
