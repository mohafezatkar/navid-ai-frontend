"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";


import { cn } from "@/lib/utils";

export function PulseLoader({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };
  const t = useTranslations();

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* <p className="">{t("pages.chat.thinking")}</p> */}
      <motion.div
        className="border-primary absolute inset-0 rounded-full border-2"
        animate={{
          scale: [0.92, 1.08, 0.92],
          opacity: [0.45, 1, 0.45],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
