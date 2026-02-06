"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  BarChart3,
  Grid3X3,
  Heart,
  Bookmark,
  LogOut,
  Play,
  Eye,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logout } from "@/app/auth/actions";

interface ProfileData {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_creator: boolean;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  total_likes: number;
}

interface VideoItem {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  video_url: string;
  view_count: number;
  like_count: number;
  duration: number;
  status: string;
}

function formatCount(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function AccountProfile({
  profile,
  videos,
  email,
}: {
  profile: ProfileData | null;
  videos: VideoItem[];
  email: string;
}) {
  if (!profile) return null;

  return (
    <div className="flex flex-col pb-16">
      {/* Header bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">
          @{profile.username || "user"}
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/dashboard">
              <BarChart3 className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Profile section */}
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        <Avatar className="h-20 w-20 border-2 border-primary/30">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
            {(profile.display_name || profile.username || "?")[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">
              {profile.display_name || profile.username}
            </h2>
            {profile.is_verified && (
              <Badge className="h-5 bg-primary/20 text-primary border-0 text-[10px]">
                Verified
              </Badge>
            )}
          </div>
          {profile.bio && (
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">
              {formatCount(profile.following_count)}
            </span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">
              {formatCount(profile.follower_count)}
            </span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">
              {formatCount(profile.total_likes)}
            </span>
            <span className="text-xs text-muted-foreground">Likes</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">Edit Profile</Link>
          </Button>
          <form action={logout}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Video tabs */}
      <Tabs defaultValue="videos" className="px-4">
        <TabsList className="w-full bg-secondary">
          <TabsTrigger value="videos" className="flex-1">
            <Grid3X3 className="mr-1.5 h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex-1">
            <Heart className="mr-1.5 h-4 w-4" />
            Liked
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1">
            <Bookmark className="mr-1.5 h-4 w-4" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <VideoGrid videos={videos} />
        </TabsContent>
        <TabsContent value="liked" className="mt-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Liked videos will appear here</p>
          </div>
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bookmark className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Saved videos will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Grid3X3 className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No videos uploaded yet</p>
        <Button asChild variant="outline" size="sm" className="mt-3 bg-transparent">
          <Link href="/upload">Upload your first video</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/feed?v=${video.id}`}
          className="group relative aspect-[9/16] overflow-hidden bg-card"
        >
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title || ""}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/60 p-1 text-[10px] text-foreground">
            <Eye className="h-3 w-3" />
            {formatCount(video.view_count)}
          </div>
        </Link>
      ))}
    </div>
  );
}
