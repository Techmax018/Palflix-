import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch gifts received
  const { data: gifts } = await supabase
    .from("gifts")
    .select("amount, created_at")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Calculate stats
  const totalViews =
    videos?.reduce((sum, v) => sum + (v.view_count || 0), 0) || 0;
  const totalLikes =
    videos?.reduce((sum, v) => sum + (v.like_count || 0), 0) || 0;
  const totalComments =
    videos?.reduce((sum, v) => sum + (v.comment_count || 0), 0) || 0;
  const totalEarnings =
    gifts?.reduce((sum, g) => sum + Number(g.amount || 0), 0) || 0;

  return (
    <DashboardContent
      profile={profile}
      videos={videos || []}
      stats={{
        totalViews,
        totalLikes,
        totalComments,
        totalEarnings,
        followerCount: profile?.follower_count || 0,
        videoCount: videos?.length || 0,
      }}
    />
  );
}
