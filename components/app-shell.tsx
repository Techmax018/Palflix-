"use client";

import React from "react"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusSquare,
  Radio,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/discover", icon: Search, label: "Discover" },
  { href: "/upload", icon: PlusSquare, label: "Create" },
  { href: "/live", icon: Radio, label: "Live" },
  { href: "/account", icon: User, label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = pathname === "/feed";

  return (
    <div className="relative flex h-dvh flex-col bg-background">
      <main className={cn("flex-1 overflow-hidden", !isFullscreen && "pb-16")}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/90 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isCreate = item.href === "/upload";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                isCreate && "relative"
              )}
            >
              {isCreate ? (
                <div className="flex h-8 w-10 items-center justify-center rounded-lg bg-primary">
                  <PlusSquare className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
