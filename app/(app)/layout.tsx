import React from "react";
import { AppShell } from "@/components/app-shell";
import Head from 'next/head'; // Import this if using Next.js Pages router

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        <meta name="google-site-verification" content="IHbVhX64nBvwzqzZD-E05PyM7y4cwMooFtV75S6rLts" />
      </head>
      <AppShell>{children}</AppShell>
    </>
  );
}
