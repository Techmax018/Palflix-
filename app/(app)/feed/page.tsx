import { createClient } from "@/lib/supabase/server";
import { VideoFeed } from "@/components/video-feed";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch active videos with creator profiles
  const { data: videos } = await supabase
    .from("videos")
    .select(
      `
      id, title, description, video_url, thumbnail_url, 
      view_count, like_count, comment_count, share_count, tags, user_id,
      profiles!videos_user_id_fkey (
        username, display_name, avatar_url, is_verified
      )
    `
    )
    .eq("status", "active")
    .eq("is_private", false)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get user's likes
  let likedVideoIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from("video_likes")
      .select("video_id")
      .eq("user_id", user.id);
    likedVideoIds = likes?.map((l) => l.video_id) || [];
  }

  // Get user's follows
  let followingIds: string[] = [];
  if (user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    followingIds = follows?.map((f) => f.following_id) || [];
  }

  const feedVideos = (videos || []).map((video) => ({
    ...video,
    profiles: Array.isArray(video.profiles) ? video.profiles[0] : video.profiles,
    user_has_liked: likedVideoIds.includes(video.id),
    user_is_following: followingIds.includes(video.user_id),
  }));

  return <VideoFeed initialVideos={feedVideos} />;
}
