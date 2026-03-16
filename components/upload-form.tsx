"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Film, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/firebase/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Receive userId as a prop from the Server Component
export function UploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubscribersOnly, setIsSubscribersOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      toast.error("File size must be under 500MB");
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const uid = user?.uid || userId;
    if (!file) { toast.error("Please select a video file"); return; }
    if (!uid) { toast.error("Authentication error. Please refresh and try again."); return; }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `palflix/videos/${uid}`);
      formData.append("resource_type", "video");

      setProgress(30);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();

      setProgress(70);

      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

      await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          title: title || "Untitled Video",
          description: description || null,
          video_url: url,
          tags: tagArray,
          is_private: isPrivate,
          is_subscribers_only: isSubscribersOnly,
        }),
      });

      setProgress(100);
      toast.success("Video uploaded successfully!");
      router.push("/feed");
      router.refresh();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-primary/50",
          file && "border-primary/30",
          uploading && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="relative w-full">
            <video
              src={preview}
              className="mx-auto max-h-64 rounded-lg"
              muted
              playsInline
            />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-foreground hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {file?.name} ({(file!.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Tap to select a video</p>
            <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, or WebM. Max 500MB.</p>
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your video a title"
            className="bg-card"
            disabled={uploading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers about your video..."
            rows={3}
            className="bg-card resize-none"
            disabled={uploading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comedy, vlog, music (comma separated)"
            className="bg-card"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Privacy toggles */}
      <div className="flex flex-col gap-4 rounded-xl bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Private</p>
            <p className="text-xs text-muted-foreground">Only you can see this video</p>
          </div>
          <Switch 
            checked={isPrivate} 
            onCheckedChange={setIsPrivate} 
            disabled={uploading} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Subscribers Only</p>
            <p className="text-xs text-muted-foreground">Only your subscribers can view</p>
          </div>
          <Switch
            checked={isSubscribersOnly}
            onCheckedChange={setIsSubscribersOnly}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Uploading... {progress}%
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!file || uploading}
        className="w-full font-semibold"
        size="lg"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Film className="mr-2 h-4 w-4" />
            Publish Video
          </>
        )}
      </Button>
    </form>
  );
}