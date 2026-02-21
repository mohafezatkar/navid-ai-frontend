"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { AppSidebar } from "@/app/[locale]/(protected)/(workspace)/components/app-sidebar";
import { MobileNavSheet } from "@/app/[locale]/(protected)/(workspace)/components/mobile-nav-sheet";

type WorkspaceShellProps = {
  children: ReactNode;
};

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <MobileNavSheet />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="min-h-[calc(100vh-57px)] p-4 md:min-h-screen md:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}


