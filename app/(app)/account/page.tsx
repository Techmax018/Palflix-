import { createClient } from "@/lib/supabase/server";
import { AccountProfile } from "@/components/account-profile";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, thumbnail_url, video_url, view_count, like_count, duration, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <AccountProfile
      profile={profile}
      videos={videos || []}
      email={user.email || ""}
    />
  );
}
