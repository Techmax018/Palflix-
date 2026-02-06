"use client";

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react";
import { VideoPlayer } from "@/components/video-player";
import { VideoActions } from "@/components/video-actions";
import { VideoOverlay } from "@/components/video-overlay";

interface VideoData {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  tags: string[];
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  user_has_liked: boolean;
  user_is_following: boolean;
}

interface VideoFeedProps {
  initialVideos: VideoData[];
}

export function VideoFeed({ initialVideos }: VideoFeedProps) {
  const [videos] = useState<VideoData[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= videos.length) return;
      setCurrentIndex(index);
    },
    [videos.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goTo(currentIndex + 1);
      if (e.key === "ArrowUp" || e.key === "k") goTo(currentIndex - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, goTo]);

  // Touch/swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
    },
    [currentIndex, goTo]
  );

  // Wheel navigation
  const wheelTimeout = useRef<ReturnType<typeof setTimeout>>();
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (wheelTimeout.current) return;
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = undefined;
      }, 600);
      if (e.deltaY > 0) goTo(currentIndex + 1);
      else if (e.deltaY < 0) goTo(currentIndex - 1);
    },
    [currentIndex, goTo]
  );

  if (videos.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background p-8 text-center">
        <p className="text-lg font-medium text-foreground">No videos yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to upload a video and start creating.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Video stack */}
      <div
        className="flex h-full flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}%)` }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative h-full w-full flex-shrink-0"
          >
            <VideoPlayer
              src={video.video_url}
              isActive={index === currentIndex}
              poster={video.thumbnail_url || undefined}
            />

            {/* Right action bar */}
            <div className="absolute bottom-32 right-3 z-20">
              <VideoActions
                videoId={video.id}
                initialLikeCount={video.like_count}
                initialCommentCount={video.comment_count}
                initialShareCount={video.share_count}
                initialLiked={video.user_has_liked}
                creatorId={video.user_id}
              />
            </div>

            {/* Bottom overlay */}
            <VideoOverlay
              video={video}
              isFollowing={video.user_is_following}
            />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {videos.length > 1 && (
        <div className="absolute right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "h-4 bg-primary"
                  : "bg-foreground/30"
              }`}
              aria-label={`Go to video ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
