import type { ReactNode } from "react";

import { RequireSession } from "@/app/[locale]/(protected)/components/require-session";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <RequireSession>{children}</RequireSession>;
}

