"use client";

import { Radio, Users, Clock, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface StreamData {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  viewer_count: number;
  started_at: string | null;
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

function formatViewers(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function LiveHub({ streams }: { streams: StreamData[] }) {
  const liveStreams = streams.filter((s) => s.status === "live");
  const scheduledStreams = streams.filter((s) => s.status === "scheduled");

  return (
    <div className="flex flex-col gap-6 pb-16">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <h1 className="font-display text-lg font-bold text-foreground">
            Live
          </h1>
        </div>
        <Button size="sm" className="gap-1.5 rounded-full font-semibold">
          <Zap className="h-4 w-4" />
          Go Live
        </Button>
      </header>

      <div className="px-4">
        {/* Live Now */}
        {liveStreams.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {liveStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Scheduled */}
        {scheduledStreams.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Scheduled
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {scheduledStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {streams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Radio className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              No live streams right now
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to go live and connect with your audience.
            </p>
            <Button className="mt-6 gap-1.5 rounded-full font-semibold">
              <Zap className="h-4 w-4" />
              Start Streaming
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StreamCard({ stream }: { stream: StreamData }) {
  const profile = Array.isArray(stream.profiles)
    ? stream.profiles[0]
    : stream.profiles;
  const isLive = stream.status === "live";

  return (
    <Link href={`/live/${stream.id}`}>
      <Card className="group overflow-hidden border-border bg-card transition-colors hover:border-primary/30">
        {/* Thumbnail area */}
        <div className="relative aspect-video bg-secondary">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url || "/placeholder.svg"}
              alt={stream.title}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Radio className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Live badge */}
          {isLive && (
            <Badge className="absolute left-2 top-2 bg-primary border-0 text-primary-foreground text-[10px] gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
              LIVE
            </Badge>
          )}

          {/* Viewer count */}
          {isLive && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-foreground backdrop-blur-sm">
              <Users className="h-3 w-3" />
              {formatViewers(stream.viewer_count)}
            </div>
          )}
        </div>

        <CardContent className="flex items-center gap-3 p-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {(profile?.display_name || profile?.username || "?")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {stream.title}
            </p>
            <p className="text-xs text-muted-foreground">
              @{profile?.username || "user"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
