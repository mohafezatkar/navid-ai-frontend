import type { ReactNode } from "react";

import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";
import { RequireOnboardingComplete } from "@/features/auth/components/require-onboarding-complete";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <RequireOnboardingComplete>
      <WorkspaceShell>{children}</WorkspaceShell>
    </RequireOnboardingComplete>
  );
}

