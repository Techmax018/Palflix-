"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, Download, Repeat2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-context";
import { toast } from "sonner";
import { CommentsDrawer } from "@/components/comments-drawer";

interface VideoActionsProps {
  videoId: string;
  videoUrl: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialShareCount: number;
  initialLiked: boolean;
  creatorId: string;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function ActionBtn({ onClick, active, icon, label }: {
  onClick?: () => void;
  active?: boolean;
  icon: React.ReactNode;
  label: string | number;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors",
        active && "bg-primary/20"
      )}>
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

export function VideoActions({
  videoId, videoUrl, initialLikeCount, initialCommentCount, initialShareCount, initialLiked,
}: VideoActionsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reposted, setReposted] = useState(false);

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like videos"); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => newLiked ? c + 1 : c - 1);
    await fetch("/api/videos/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.uid, video_id: videoId, liked: newLiked }),
    });
  };

  // Repost = share to your followers' feed
  const handleRepost = async () => {
    if (!user) { toast.error("Sign in to repost"); return; }
    const res = await fetch("/api/reposts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.uid, video_id: videoId }),
    });
    const { reposted: didRepost } = await res.json();
    setReposted(didRepost);
    toast.success(didRepost ? "Reposted to your followers" : "Repost removed");
  };

  // Share = external share (native sheet or copy link)
  const handleShare = async () => {
    const url = `${window.location.origin}/feed?v=${videoId}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Check this out on Palflix", url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownload = async () => {
    try {
      toast.info("Starting download...");
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `palflix-${videoId}.mp4`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-5">
        <ActionBtn
          onClick={handleLike}
          active={liked}
          label={formatCount(likeCount)}
          icon={<Heart className={cn("h-6 w-6 transition-colors", liked ? "fill-primary text-primary" : "text-foreground")} />}
        />

        <ActionBtn
          onClick={() => setCommentsOpen(true)}
          label={formatCount(commentCount)}
          icon={<MessageCircle className="h-6 w-6 text-foreground" />}
        />

        <ActionBtn
          onClick={handleRepost}
          active={reposted}
          label="Repost"
          icon={<Repeat2 className={cn("h-6 w-6 transition-colors", reposted ? "text-green-400" : "text-foreground")} />}
        />

        <ActionBtn
          onClick={handleDownload}
          label="Save"
          icon={<Download className="h-6 w-6 text-foreground" />}
        />

        <ActionBtn
          onClick={handleShare}
          label="Share"
          icon={<Share2 className="h-6 w-6 text-foreground" />}
        />

        <ActionBtn
          label="Gift"
          icon={<Gift className="h-6 w-6 text-foreground" />}
        />
      </div>

      <CommentsDrawer
        videoId={videoId}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
}
