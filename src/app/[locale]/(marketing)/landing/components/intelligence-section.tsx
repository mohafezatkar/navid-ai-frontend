"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Circle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routes } from "@/lib/routes"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/app/[locale]/(marketing)/landing/lib/motion"

export function IntelligenceSection() {
  const t = useTranslations()
  const prefersReducedMotion = useReducedMotion()
  const containerVariants = createRevealContainerVariants(prefersReducedMotion)
  const itemVariants = createRevealItemVariants(prefersReducedMotion)

  return (
    <motion.section
      className="relative isolate overflow-hidden bg-transparent"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <motion.div
        className="relative z-10 mx-auto grid min-h-[540px] max-w-7xl grid-cols-1 gap-14 px-8 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-10"
        variants={containerVariants}
      >
        <motion.div className="max-w-4xl" variants={containerVariants}>
          <motion.p className="flex items-center gap-2 text-sm text-accent" variants={itemVariants}>
            <Circle className="h-2.5 w-2.5 fill-current" />
            <span className="text-lg font-bold tracking-wide">{t("pages.landing.intelligence.eyebrow")}</span>
          </motion.p>
          <motion.h2
            className="mt-3 text-balance text-[clamp(1.8rem,3.6vw,4rem)] font-medium leading-[1.18] tracking-tight text-primary"
            variants={itemVariants}
          >
            {t("pages.landing.intelligence.title")}
          </motion.h2>
        </motion.div>

        <motion.div className="self-end pb-2" variants={containerVariants}>
          <motion.p className="mb-6 max-w-sm text-base leading-7 text-primary" variants={itemVariants}>
            {t("pages.landing.intelligence.description")}
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button asChild variant="default">
              <Link href={routes.auth.register}>{t("actions.tryNavid")}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

