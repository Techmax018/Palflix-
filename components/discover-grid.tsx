"use client";

import Link from "next/link";
import { Play, Eye, Search, X } from "lucide-react";
import { useState } from "react";

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
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? videos.filter((v) => {
        const q = query.toLowerCase();
        const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles;
        return (
          v.title?.toLowerCase().includes(q) ||
          profile?.username?.toLowerCase().includes(q) ||
          profile?.display_name?.toLowerCase().includes(q)
        );
      })
    : videos;

  return (
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-xl px-4 py-2 border-b border-border">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos or creators..."
            className="w-full rounded-full bg-secondary py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium text-foreground">
            {query ? `No results for "${query}"` : "Nothing to discover yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Try a different search term." : "Videos will appear here as creators upload content."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0.5 p-0.5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((video) => {
            const profile = Array.isArray(video.profiles) ? video.profiles[0] : video.profiles;

            return (
              <Link
                key={video.id}
                href={`/feed?v=${video.id}`}
                className="group relative aspect-[9/16] overflow-hidden bg-card"
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title || "Video thumbnail"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs font-medium text-foreground">
                    @{profile?.username || "user"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-foreground/70">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {formatViews(video.view_count)}
                    </span>
                    {video.duration > 0 && <span>{formatDuration(video.duration)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
