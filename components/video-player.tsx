"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  poster?: string;
}

export function VideoPlayer({ src, isActive, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center bg-black"
      onClick={togglePlay}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        className="h-full w-full object-contain"
        crossOrigin="anonymous"
      />

      {/* Play/Pause overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          {isPlaying ? (
            <Pause className="h-8 w-8 text-foreground" />
          ) : (
            <Play className="ml-1 h-8 w-8 text-foreground" />
          )}
        </div>
      </div>

      {/* Mute button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className={cn(
          "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-opacity",
          showControls || !isMuted ? "opacity-100" : "opacity-60"
        )}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-foreground" />
        ) : (
          <Volume2 className="h-4 w-4 text-foreground" />
        )}
      </button>

      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-muted/30">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
