"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { DashboardContent } from "@/components/dashboard-content";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/profiles?uid=${user.uid}`).then((r) => r.json()).then(setProfile);
    fetch(`/api/videos/user?uid=${user.uid}`).then((r) => r.json()).then(setVideos);
  }, [user]);

  if (loading) return null;

  const stats = {
    totalViews: videos.reduce((s, v) => s + (v.view_count || 0), 0),
    totalLikes: videos.reduce((s, v) => s + (v.like_count || 0), 0),
    totalComments: videos.reduce((s, v) => s + (v.comment_count || 0), 0),
    totalEarnings: 0,
    followerCount: (profile as any)?.follower_count || 0,
    videoCount: videos.length,
  };

  return <DashboardContent profile={profile} videos={videos} stats={stats} />;
}
