"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OAuthButtonsProps = {
  onGoogleClick: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-4", className)}>
      <path
        fill="#FFC107"
        d="M43.61 20.08H42V20H24v8h11.3C33.65 32.66 29.19 36 24 36c-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.95 3.05l5.66-5.66C34.17 6.05 29.37 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
      />
      <path
        fill="#FF3D00"
        d="M6.31 14.69l6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.95 3.05l5.66-5.66C34.17 6.05 29.37 4 24 4c-7.68 0-14.41 4.34-17.69 10.69Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.24 0 9.97-2.01 13.54-5.27l-6.25-5.29C29.23 35.06 26.74 36 24 36c-5.17 0-9.62-3.31-11.28-7.92l-6.52 5.02C9.43 39.58 16.12 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.61 20.08H42V20H24v8h11.3c-.79 2.27-2.25 4.2-4.01 5.44h.01l6.25 5.29C37.11 39.1 44 34 44 24c0-1.34-.14-2.65-.39-3.92Z"
      />
    </svg>
  );
}

export function OAuthButtons({
  onGoogleClick,
  disabled,
  className,
  label = "Continue with Google",
}: OAuthButtonsProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full justify-center gap-2", className)}
      disabled={disabled}
      onClick={onGoogleClick}
    >
      <GoogleIcon />
      {label}
    </Button>
  );
}
