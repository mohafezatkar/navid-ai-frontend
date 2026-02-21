import type { ReactNode } from "react";

import { MeshShaderBackground } from "@/components/shared/mesh-shader-background";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { AuthAsidePanel } from "@/app/[locale]/(auth)/components/auth-aside-panel";
import { PublicOnlyGuard } from "@/app/[locale]/(auth)/components/public-only-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PublicOnlyGuard>
      <main className="min-h-screen bg-background">
        <div className="mx-auto grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
          <AuthAsidePanel background={<MeshShaderBackground animate={true} className="opacity-55" />} />
          <section className="relative flex items-center justify-center px-6 py-10 sm:px-10">
            <LanguageSwitcher className="absolute right-6 top-6 sm:right-10" />
            <div className="w-full max-w-md">{children}</div>
          </section>
        </div>
      </main>
    </PublicOnlyGuard>
  );
}


