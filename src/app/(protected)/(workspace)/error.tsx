"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type WorkspaceErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function WorkspaceError({ error, reset }: WorkspaceErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">Workspace error</h2>
      <p className="max-w-lg text-sm text-muted-foreground">
        We could not complete this action in the chat workspace. Retry to recover.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
