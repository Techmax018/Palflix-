"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface VideoActionsProps {
  videoId: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialShareCount: number;
  initialLiked: boolean;
  creatorId: string;
}

export function VideoActions({
  videoId,
  initialLikeCount,
  initialCommentCount,
  initialShareCount,
  initialLiked,
  creatorId,
}: VideoActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase
        .from("video_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", videoId);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase
        .from("video_likes")
        .insert({ user_id: user.id, video_id: videoId });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/video/${videoId}`
      );
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Like */}
      <button onClick={handleLike} className="flex flex-col items-center gap-1">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors",
            liked && "bg-primary/20"
          )}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-colors",
              liked ? "fill-primary text-primary" : "text-foreground"
            )}
          />
        </div>
        <span className="text-xs font-medium text-foreground">
          {formatCount(likeCount)}
        </span>
      </button>

      {/* Comment */}
      <button className="flex flex-col items-center gap-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <MessageCircle className="h-6 w-6 text-foreground" />
        </div>
        <span className="text-xs font-medium text-foreground">
          {formatCount(initialCommentCount)}
        </span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <Share2 className="h-6 w-6 text-foreground" />
        </div>
        <span className="text-xs font-medium text-foreground">
          {formatCount(initialShareCount)}
        </span>
      </button>

      {/* Bookmark */}
      <button
        onClick={() => setSaved((s) => !s)}
        className="flex flex-col items-center gap-1"
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm",
            saved && "bg-primary/20"
          )}
        >
          <Bookmark
            className={cn(
              "h-6 w-6 transition-colors",
              saved ? "fill-primary text-primary" : "text-foreground"
            )}
          />
        </div>
        <span className="text-xs font-medium text-foreground">Save</span>
      </button>

      {/* Gift */}
      <button className="flex flex-col items-center gap-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <Gift className="h-6 w-6 text-foreground" />
        </div>
        <span className="text-xs font-medium text-foreground">Gift</span>
      </button>
    </div>
  );
}
