"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Radio,
  Users,
  Heart,
  Gift,
  Send,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StreamData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  viewer_count: number;
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    follower_count: number;
  };
}

const giftOptions = [
  { name: "Rose", amount: 1, emoji: "R" },
  { name: "Star", amount: 5, emoji: "S" },
  { name: "Crown", amount: 25, emoji: "C" },
  { name: "Diamond", amount: 100, emoji: "D" },
  { name: "Rocket", amount: 500, emoji: "K" },
];

export function LiveStreamView({
  stream,
  currentUserId,
}: {
  stream: StreamData;
  currentUserId: string;
}) {
  const [showGifts, setShowGifts] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; user: string; text: string; isGift?: boolean }[]
  >([
    { id: "1", user: "system", text: `Welcome to ${stream.title}!` },
  ]);

  const profile = Array.isArray(stream.profiles)
    ? stream.profiles[0]
    : stream.profiles;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), user: "You", text: chatMessage },
    ]);
    setChatMessage("");
  };

  const handleSendGift = (gift: (typeof giftOptions)[number]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "You",
        text: `sent a ${gift.name} ($${gift.amount})`,
        isGift: true,
      },
    ]);
    setShowGifts(false);
  };

  return (
    <div className="flex h-dvh flex-col bg-black">
      {/* Stream video area */}
      <div className="relative flex-1 bg-secondary">
        <div className="flex h-full items-center justify-center">
          <Radio className="h-16 w-16 text-muted-foreground/30" />
        </div>

        {/* Top bar overlay */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-primary">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {(profile?.display_name || "?")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">
                  @{profile?.username || "user"}
                </span>
                {profile?.is_verified && (
                  <Badge className="h-4 bg-primary/20 text-primary border-0 text-[8px] px-1">
                    V
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-foreground/60">
                {profile?.follower_count?.toLocaleString()} followers
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-2 h-7 rounded-full border-primary/30 bg-primary/10 px-3 text-xs text-primary hover:bg-primary/20"
            >
              Follow
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs text-foreground backdrop-blur-sm">
              <Users className="h-3.5 w-3.5" />
              {stream.viewer_count.toLocaleString()}
            </div>
            {stream.status === "live" && (
              <Badge className="bg-primary border-0 text-primary-foreground text-[10px] gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
                LIVE
              </Badge>
            )}
            <Link
              href="/live"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
            >
              <X className="h-4 w-4 text-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Chat section */}
      <div className="flex h-72 flex-col bg-background">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-1.5">
              {msg.isGift ? (
                <p className="text-xs">
                  <span className="font-semibold text-chart-4">{msg.user}</span>{" "}
                  <span className="text-primary">{msg.text}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {msg.user}
                  </span>{" "}
                  {msg.text}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Gift panel */}
        {showGifts && (
          <div className="border-t border-border bg-card px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Send a Gift</p>
              <button onClick={() => setShowGifts(false)}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              {giftOptions.map((gift) => (
                <button
                  key={gift.name}
                  onClick={() => handleSendGift(gift)}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-secondary p-2 transition-colors hover:bg-accent"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {gift.emoji}
                  </span>
                  <span className="text-[10px] text-foreground">
                    {gift.name}
                  </span>
                  <span className="text-[10px] text-primary">
                    ${gift.amount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input */}
        <div className="flex items-center gap-2 border-t border-border bg-background px-4 py-3">
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Say something..."
            className="flex-1 bg-card text-sm"
          />
          <button
            onClick={() => setShowGifts(!showGifts)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          >
            <Gift className="h-4 w-4" />
          </button>
          <button
            onClick={handleSendMessage}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
