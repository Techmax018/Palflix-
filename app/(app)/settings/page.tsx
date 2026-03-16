"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/profiles?uid=${user.uid}`).then((r) => r.json()).then(setProfile);
  }, [user]);

  if (loading) return null;

  return (
    <div className="flex flex-col pb-16">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">Settings</h1>
      </header>
      <div className="mx-auto w-full max-w-lg p-4">
        <SettingsForm profile={profile} email={user?.email || ""} />
      </div>
    </div>
  );
}
