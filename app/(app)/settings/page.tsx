import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col pb-16">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">
          Settings
        </h1>
      </header>
      <div className="mx-auto w-full max-w-lg p-4">
        <SettingsForm profile={profile} email={user.email || ""} />
      </div>
    </div>
  );
}
