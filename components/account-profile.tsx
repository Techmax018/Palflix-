"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, BarChart3, Grid3X3, Heart, Bookmark, LogOut, Play, Eye, Camera, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logout } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function AccountProfile({ profile: initialProfile, videos, email }: {
  profile: ProfileData | null;
  videos: VideoItem[];
  email: string;
}) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `palflix/avatars/${profile.id}`);
      formData.append("resource_type", "image");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();

      // Save to DB
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.id, avatar_url: url }),
      });

      setProfile((p) => p ? { ...p, avatar_url: url } : p);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">
          @{profile.username || email.split("@")[0]}
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/dashboard"><BarChart3 className="h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/settings"><Settings className="h-5 w-5" /></Link>
          </Button>
        </div>
      </header>

      {/* Profile section */}
      <div className="flex flex-col items-center gap-4 px-4 py-6">

        {/* Avatar with upload button */}
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary/30">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl">
              {(profile.display_name || profile.username || email || "?")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            {uploadingAvatar
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Camera className="h-4 w-4" />
            }
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name + bio */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">
              {profile.display_name || profile.username || email.split("@")[0]}
            </h2>
            {profile.is_verified && (
              <Badge className="h-5 bg-primary/20 text-primary border-0 text-[10px]">Verified</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username || email.split("@")[0]}</p>
          {profile.bio && (
            <p className="max-w-xs text-center text-sm text-muted-foreground mt-1">{profile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {[
            { label: "Following", value: profile.following_count },
            { label: "Followers", value: profile.follower_count },
            { label: "Likes", value: profile.total_likes },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-lg font-bold text-foreground">{formatCount(s.value || 0)}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">Edit Profile</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="videos" className="px-4">
        <TabsList className="w-full bg-secondary">
          <TabsTrigger value="videos" className="flex-1">
            <Grid3X3 className="mr-1.5 h-4 w-4" />Videos
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex-1">
            <Heart className="mr-1.5 h-4 w-4" />Liked
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1">
            <Bookmark className="mr-1.5 h-4 w-4" />Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <VideoGrid videos={videos} />
        </TabsContent>
        <TabsContent value="liked" className="mt-4">
          <EmptyTab icon={<Heart className="mb-3 h-10 w-10 text-muted-foreground" />} text="Liked videos will appear here" />
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <EmptyTab icon={<Bookmark className="mb-3 h-10 w-10 text-muted-foreground" />} text="Saved videos will appear here" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyTab({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <p className="text-sm text-muted-foreground">{text}</p>
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
    <div className="grid grid-cols-4 gap-0.5 sm:grid-cols-5">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/feed?v=${video.id}`}
          className="group relative aspect-[9/16] overflow-hidden bg-secondary"
        >
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title || ""}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <Play className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Views on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex items-center gap-1 text-white text-xs font-semibold">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(video.view_count)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
