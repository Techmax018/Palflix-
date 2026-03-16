"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";

interface VideoOverlayProps {
  video: {
    id: string;
    title: string | null;
    description: string | null;
    tags: string[];
    user_id: string;
    profiles: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
      is_verified: boolean;
    };
  };
  isFollowing: boolean;
}

export function VideoOverlay({ video }: VideoOverlayProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loadedFollow, setLoadedFollow] = useState(false);
  const profile = video.profiles;

  // Fetch real follow state from DB on mount
  useEffect(() => {
    if (!user || user.uid === video.user_id) {
      setLoadedFollow(true);
      return;
    }
    fetch(`/api/follows?follower_id=${user.uid}&following_id=${video.user_id}`)
      .then((r) => r.json())
      .then((data) => {
        setFollowing(data.following ?? false);
        setLoadedFollow(true);
      })
      .catch(() => setLoadedFollow(true));
  }, [user, video.user_id]);

  const handleFollow = async () => {
    if (!user) return;
    const newFollow = !following;
    setFollowing(newFollow);
    await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ follower_id: user.uid, following_id: video.user_id, follow: newFollow }),
    });
  };

  // Don't show follow button for own videos or while loading
  const isOwnVideo = user?.uid === video.user_id;
  const showFollowBtn = loadedFollow && !isOwnVideo && !following;

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-20">
      {/* Creator info */}
      <div className="flex items-center gap-3">
        <Link href={`/profile/${video.user_id}`}>
          <Avatar className="h-10 w-10 border-2 border-foreground/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
              {(profile.display_name || profile.username || "?")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${video.user_id}`} className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              @{profile.username || "user"}
            </span>
            {profile.is_verified && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-primary/20 text-primary border-0">
                V
              </Badge>
            )}
          </Link>
        </div>
        {showFollowBtn && (
          <Button
            size="sm"
            onClick={handleFollow}
            className="h-7 gap-1 rounded-full px-3 text-xs font-semibold"
          >
            <Plus className="h-3 w-3" />
            Follow
          </Button>
        )}
      </div>

      {/* Title & description */}
      {video.title && (
        <p className="text-sm font-medium text-foreground leading-snug">{video.title}</p>
      )}
      {video.description && (
        <p className="line-clamp-2 text-xs text-foreground/80">{video.description}</p>
      )}

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {video.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs font-medium text-primary">#{tag}</span>
          ))}
        </div>
      )}

      {/* Sound indicator */}
      <div className="flex items-center gap-2">
        <Music className="h-3 w-3 text-foreground/70" />
        <span className="text-xs text-foreground/70">Original Sound</span>
      </div>
    </div>
  );
}
