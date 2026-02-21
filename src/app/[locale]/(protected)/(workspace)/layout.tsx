import type { ReactNode } from "react";

import { WorkspaceShell } from "@/app/[locale]/(protected)/(workspace)/components/workspace-shell";
import { RequireOnboardingComplete } from "@/app/[locale]/(auth)/components/require-onboarding-complete";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <RequireOnboardingComplete>
      <WorkspaceShell>{children}</WorkspaceShell>
    </RequireOnboardingComplete>
  );
}


