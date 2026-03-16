"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">Upload</h1>
      </header>
      <div className="mx-auto w-full max-w-lg p-4 pb-8">
        <UploadForm userId={user?.uid || ""} />
      </div>
    </div>
  );
}
