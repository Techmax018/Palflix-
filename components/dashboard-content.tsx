"use client";

import { Eye, Heart, MessageCircle, DollarSign, Users, Film, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalEarnings: number;
  followerCount: number;
  videoCount: number;
}

interface VideoItem {
  id: string;
  title: string | null;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  status: string;
  created_at: string;
}

interface DashboardContentProps {
  profile: {
    display_name: string | null;
    username: string | null;
    is_creator: boolean;
    wallet_balance: number;
  } | null;
  videos: VideoItem[];
  stats: DashboardStats;
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

const statCards = [
  { key: "totalViews", label: "Total Views", icon: Eye, color: "text-chart-3" },
  { key: "totalLikes", label: "Total Likes", icon: Heart, color: "text-primary" },
  { key: "totalComments", label: "Comments", icon: MessageCircle, color: "text-chart-2" },
  { key: "followerCount", label: "Followers", icon: Users, color: "text-chart-4" },
  { key: "videoCount", label: "Videos", icon: Film, color: "text-chart-5" },
  { key: "totalEarnings", label: "Earnings", icon: DollarSign, color: "text-green-500" },
] as const;

export function DashboardContent({ profile, videos, stats }: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="font-display text-lg font-bold text-foreground">
            Creator Dashboard
          </h1>
        </div>
        {profile?.wallet_balance !== undefined && (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-0">
            <DollarSign className="mr-0.5 h-3 w-3" />
            {Number(profile.wallet_balance).toFixed(2)}
          </Badge>
        )}
      </header>

      <div className="px-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.key} className="bg-card border-border">
              <CardContent className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {stat.key === "totalEarnings"
                    ? `$${stats[stat.key].toFixed(2)}`
                    : formatNumber(stats[stat.key])}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Videos Tab */}
        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Videos</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <VideoList videos={videos} />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <VideoList
              videos={videos.filter((v) => v.status === "active")}
            />
          </TabsContent>
          <TabsContent value="processing" className="mt-4">
            <VideoList
              videos={videos.filter((v) => v.status === "processing")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function VideoList({ videos }: { videos: VideoItem[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Film className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No videos here yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        <Card key={video.id} className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-3">
            <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url || "/placeholder.svg"}
                  alt=""
                  className="h-full w-full rounded-lg object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <Film className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {video.title || "Untitled"}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(video.view_count)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(video.like_count)}
                </span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={
                video.status === "active"
                  ? "bg-green-500/10 text-green-500 border-0"
                  : "bg-chart-4/10 text-chart-4 border-0"
              }
            >
              {video.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
