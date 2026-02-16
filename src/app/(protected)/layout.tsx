import type { ReactNode } from "react";

import { RequireSession } from "@/features/auth/components/require-session";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <RequireSession>{children}</RequireSession>;
}
