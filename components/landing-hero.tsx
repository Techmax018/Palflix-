"use client";

import Link from "next/link";
import { Play, Flame, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(0_85%_55%_/_0.08)_0%,_transparent_70%)]" />

      <main className="relative z-10 flex max-w-2xl flex-col items-center px-6 text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Flame className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Palflix
          </h1>
        </div>

        <p className="mb-4 text-balance text-lg text-muted-foreground">
          Premium short-form video for mature audiences. Create, discover, and
          connect with an exclusive community of creators.
        </p>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            Vertical video feed
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Creator tools
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Live streaming
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="px-8 text-base font-semibold">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 text-base bg-transparent"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          You must be 18+ to create an account.
        </p>
      </main>
    </div>
  );
}
const SEOFooter = () => {
  return (
    <footer style={{ opacity: 0.2, fontSize: '10px', padding: '40px', color: '#d4af37' }}>
      <h2>Palflix: The Home of Mature Kenyan Entertainment</h2>
      <p>
        Searching for the best **mature Kenyan content**? Palflix offers a premium 
        short-form video experience for a **mature audience**. From **Nairobi's top creators** to exclusive **18+ entertainment**, we are the leading platform for **Kenyan viral videos**. 
        Discover why everyone is switching to Palflix for their daily dose of **local mature talent**.
      </p>
    </footer>
  );
};
export const metadata = {
  openGraph: {
    title: 'Palflix | Premium Mature Kenyan Content',
    description: 'The #1 platform for exclusive Kenyan entertainment.',
    images: ['/og-preview.jpg'], // Make sure this image is in your /public folder
  },
}
