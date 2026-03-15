"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routes } from "@/lib/routes"
import { SectionGlowBlob } from "@/app/[locale]/(marketing)/landing/components/section-glow-blob"
import { VoiceOrb } from "@/app/[locale]/(marketing)/landing/components/voice-orb"
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
      className="relative isolate min-h-svh overflow-hidden bg-transparent"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <SectionGlowBlob side="end" />
      </div>

      <motion.div
        className="relative z-10 mx-auto grid min-h-svh max-w-7xl grid-cols-1 gap-14 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-end"
        variants={containerVariants}
      >
        <motion.div className="max-w-4xl" variants={containerVariants}>
          <motion.p className="flex items-center gap-2 text-sm text-accent" variants={itemVariants}>
          <span className="size-3 rounded-full bg-primary/80" />
          <span className="text-lg font-medium tracking-wide">{t("pages.landing.intelligence.eyebrow")}</span>
          </motion.p>
          <motion.h2
            className="mt-3 text-balance text-[clamp(1.8rem,3.6vw,4rem)] font-medium leading-[1.18] tracking-tight text-foreground"
            variants={itemVariants}
          >
            {t("pages.landing.intelligence.title")}
          </motion.h2>
        </motion.div>

        <motion.div className="self-end pb-2" variants={containerVariants}>
          <motion.div className="mb-6 h-40 w-40 md:h-96 md:w-96" variants={itemVariants}>
            <VoiceOrb
              className="h-full w-full"
              enableVoiceControl={false}
            />
          </motion.div>
          <motion.p className="mb-6 max-w-sm text-lg font-medium leading-7 text-muted-foreground" variants={itemVariants}>
            {t("pages.landing.intelligence.description")}
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button asChild variant="default">
              <Link href={routes.auth.login}>{t("actions.tryNeura")}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
