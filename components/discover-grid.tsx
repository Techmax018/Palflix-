"use client";

import Link from "next/link";
import { Play, Eye } from "lucide-react";

interface DiscoverVideo {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  video_url: string;
  view_count: number;
  like_count: number;
  duration: number;
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function DiscoverGrid({ videos }: { videos: DiscoverVideo[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-foreground">
          Nothing to discover yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Videos will appear here as creators upload content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5 p-0.5 sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => {
        const profile = Array.isArray(video.profiles)
          ? video.profiles[0]
          : video.profiles;

        return (
          <Link
            key={video.id}
            href={`/feed?v=${video.id}`}
            className="group relative aspect-[9/16] overflow-hidden bg-card"
          >
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url || "/placeholder.svg"}
                alt={video.title || "Video thumbnail"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs font-medium text-foreground">
                @{profile?.username || "user"}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-foreground/70">
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {formatViews(video.view_count)}
                </span>
                {video.duration > 0 && (
                  <span>{formatDuration(video.duration)}</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
