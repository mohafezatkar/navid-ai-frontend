"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";

import { AppSidebar } from "@/app/[locale]/(protected)/(workspace)/components/app-sidebar";
import { MobileNavSheet } from "@/app/[locale]/(protected)/(workspace)/components/mobile-nav-sheet";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
  children: ReactNode;
};

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const isConversationRoute = pathname.startsWith(`${routes.workspace.chat}/`);

  return (
    <div className={cn("flex min-h-screen bg-background", isConversationRoute && "h-screen overflow-hidden")}>
      <AppSidebar />
      <main
        className={cn(
          "flex min-h-screen min-w-0 flex-1 flex-col",
          isConversationRoute && "h-screen overflow-hidden",
        )}
      >
        <div className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <MobileNavSheet />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className={cn(
            "min-h-[calc(100vh-57px)] p-4 md:min-h-screen md:p-8",
            isConversationRoute && "min-h-0 flex-1 overflow-hidden p-0 md:p-0",
          )}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}


