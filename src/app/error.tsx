"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Something failed unexpectedly</h1>
        <p className="text-sm text-muted-foreground">
          Try reloading this view. If the issue persists, check logs and API health.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
