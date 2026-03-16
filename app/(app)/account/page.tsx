"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { AccountProfile } from "@/components/account-profile";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setFetching(true);
      try {
        // Ensure profile exists in DB first
        await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.uid,
            display_name: user.displayName,
            avatar_url: user.photoURL,
          }),
        });

        const [profileRes, videosRes] = await Promise.all([
          fetch(`/api/profiles?uid=${user.uid}`),
          fetch(`/api/videos/user?uid=${user.uid}`),
        ]);

        const profileData = await profileRes.json();
        const videosData = await videosRes.json();

        setProfile(profileData);
        setVideos(Array.isArray(videosData) ? videosData : []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AccountProfile
      profile={profile}
      videos={videos}
      email={user?.email || ""}
    />
  );
}
