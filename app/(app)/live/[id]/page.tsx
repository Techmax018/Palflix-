import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LiveStreamView } from "@/components/live-stream-view";

export default async function LiveStreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stream } = await supabase
    .from("live_streams")
    .select(
      `
      *,
      profiles!live_streams_user_id_fkey (
        username, display_name, avatar_url, is_verified, follower_count
      )
    `
    )
    .eq("id", id)
    .single();

  if (!stream) notFound();

  return (
    <LiveStreamView
      stream={stream}
      currentUserId={user?.id || ""}
    />
  );
}
