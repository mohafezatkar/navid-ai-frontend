import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { RequireOnboardingComplete } from "@/features/auth/components/require-onboarding-complete";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <RequireOnboardingComplete>
      <WorkspaceShell>{children}</WorkspaceShell>
    </RequireOnboardingComplete>
  );
}
