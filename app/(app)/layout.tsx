import React from "react";
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
export const metadata = {
  title: 'Palflix | Premium Mature Kenyan Content',
  description: 'The #1 platform for mature Kenyan creators.',
  verification: {
    google: 'IHbVhX64nBvwzqzZD-E05PyM7y4cwMooFtV75S6rLts',
  },
}
