import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";

export default async function UploadPage() {
  // 1. Create the server-side Supabase client
  const supabase = await createClient();

  // 2. Fetch the current user
  const { data: { user } } = await supabase.auth.getUser();

  // 3. If no user session is found, redirect to login immediately
  if (!user) {
    redirect("/auth/login?error=not-logged-in");
  }

  return (
    <div className="flex flex-col pb-16">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-bold text-foreground">
          Upload
        </h1>
      </header>
      <div className="mx-auto w-full max-w-lg p-4">
        {/* Pass the user ID or email to the form so the client knows it is authenticated */}
        <UploadForm userId={user.id} />
      </div>
    </div>
  );
}