import type { ReactNode } from "react";

import { AuthAsidePanel } from "@/components/auth/auth-aside-panel";
import { PublicOnlyGuard } from "@/features/auth/components/public-only-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PublicOnlyGuard>
      <main className="min-h-screen bg-background">
        <div className="mx-auto grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
          <AuthAsidePanel />
          <section className="flex items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-md">{children}</div>
          </section>
        </div>
      </main>
    </PublicOnlyGuard>
  );
}
