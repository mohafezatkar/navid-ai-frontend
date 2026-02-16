import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/settings/profile">Profile</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/settings/preferences">Preferences</Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
