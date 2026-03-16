"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/firebase/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  like_count: number;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  liked?: boolean;
}

interface CommentsDrawerProps {
  videoId: string;
  open: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export function CommentsDrawer({ videoId, open, onClose, onCommentAdded }: CommentsDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/comments?video_id=${videoId}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
    setTimeout(() => textareaRef.current?.focus(), 300);
  }, [open, videoId]);

  // Hide bottom nav when drawer is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("comments-drawer", { detail: { open } }));
  }, [open]);

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSend = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid, video_id: videoId, content: text.trim() }),
      });
      const newComment = await res.json();
      setComments((c) => [{
        ...newComment,
        like_count: 0,
        liked: false,
        username: user.displayName,
        display_name: user.displayName,
        avatar_url: user.photoURL,
      }, ...c]);
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onCommentAdded();
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  const handleLikeComment = async (comment: Comment) => {
    const newLiked = !comment.liked;
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, liked: newLiked, like_count: newLiked ? c.like_count + 1 : Math.max(c.like_count - 1, 0) }
          : c
      )
    );
    await fetch("/api/comments/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_id: comment.id, liked: newLiked }),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn("fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background transition-transform duration-300 ease-out",
        open ? "translate-y-0" : "translate-y-full"
      )} style={{ maxHeight: "75vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <h3 className="font-semibold text-foreground">
            Comments {comments.length > 0 && <span className="text-muted-foreground font-normal text-sm">({comments.length})</span>}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={c.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-secondary">
                    {(c.display_name || c.username || "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    @{c.username || "user"}
                  </span>
                  <p className="text-sm text-foreground/90 leading-snug">{c.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Like comment */}
                <button
                  onClick={() => handleLikeComment(c)}
                  className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-1"
                >
                  <Heart className={cn("h-4 w-4 transition-colors",
                    c.liked ? "fill-primary text-primary" : "text-muted-foreground"
                  )} />
                  {c.like_count > 0 && (
                    <span className="text-[10px] text-muted-foreground">{c.like_count}</span>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Textarea input */}
        <div className="flex items-end gap-3 border-t border-border px-4 py-3 flex-shrink-0">
          <Avatar className="h-8 w-8 flex-shrink-0 mb-0.5">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="text-xs bg-secondary">
              {(user?.displayName || user?.email || "?")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full bg-secondary rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-snug"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 flex-shrink-0 mb-0.5 transition-opacity"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
