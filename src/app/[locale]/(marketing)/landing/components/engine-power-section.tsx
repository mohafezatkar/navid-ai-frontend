"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Gauge, Sparkles } from "lucide-react"

import { MeshShaderBackground } from "@/components/shared/mesh-shader-background"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { routes } from "@/lib/routes"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/app/[locale]/(marketing)/landing/lib/motion"

const ENGINE_ITEMS = [
  {
    titleKey: "pages.landing.engine.card1Title",
    descriptionKey: "pages.landing.engine.card1Description",
  },
  {
    titleKey: "pages.landing.engine.card2Title",
    descriptionKey: "pages.landing.engine.card2Description",
  },
  {
    titleKey: "pages.landing.engine.card3Title",
    descriptionKey: "pages.landing.engine.card3Description",
  },
]

export function EnginePowerSection() {
  const t = useTranslations()
  const prefersReducedMotion = useReducedMotion()
  const containerVariants = createRevealContainerVariants(prefersReducedMotion)
  const itemVariants = createRevealItemVariants(prefersReducedMotion)
  const visualPanelVariants = createRevealItemVariants(prefersReducedMotion, { y: 30, duration: 0.9 })
  const contentPanelVariants = createRevealItemVariants(prefersReducedMotion, { y: 24, duration: 0.85, delay: 0.06 })

  return (
    <motion.section
      className="relative overflow-hidden px-6 py-14 md:px-10 md:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute end-0 top-1/3 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div className="relative z-10 mx-auto max-w-4xl text-center" variants={containerVariants}>
        <motion.p className="inline-flex items-center gap-2 text-sm font-medium text-accent" variants={itemVariants}>
          <span className="size-1.5 rounded-full bg-primary/80" />
          {t("pages.landing.engine.eyebrow")}
        </motion.p>
        <motion.h2
          className="mt-4 text-balance text-[clamp(2rem,4.6vw,4.1rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
          variants={itemVariants}
        >
          {t("pages.landing.engine.title")}
        </motion.h2>
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto mt-14 grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        variants={containerVariants}
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-border/60 p-5 shadow-sm md:p-8"
          variants={visualPanelVariants}
        >
          <MeshShaderBackground animate={true} className="opacity-95" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16" />

          <motion.div className="relative z-10" variants={containerVariants}>
            <motion.p
              className="text-6xl font-semibold leading-none tracking-tight text-accent md:text-7xl"
              variants={itemVariants}
            >
              89%
            </motion.p>
            <motion.p className="mt-5 max-w-md text-2xl leading-tight text-primary md:text-[2rem]" variants={itemVariants}>
              {t("pages.landing.engine.metricTitle")}
            </motion.p>

            <motion.div className="mt-7 space-y-3" variants={containerVariants}>
              {ENGINE_ITEMS.map((item, index) => (
                <motion.article
                  key={item.titleKey}
                  className="rounded-xl border border-border/60 bg-card/35 px-4 py-4 md:px-5"
                  variants={createRevealItemVariants(prefersReducedMotion, { y: 18, delay: index * 0.06, duration: 0.72 })}
                >
                  <h3 className="text-lg font-semibold leading-tight text-primary">{t(item.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-primary/80">{t(item.descriptionKey)}</p>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="space-y-6 lg:ps-2" variants={contentPanelVariants}>
          <motion.span
            className="inline-flex rounded-xl border border-border/60 bg-card/40 p-3 text-accent"
            variants={itemVariants}
          >
            <Gauge className="size-5" />
          </motion.span>
          <motion.h3
            className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground"
            variants={itemVariants}
          >
            {t("pages.landing.engine.rightTitle")}
          </motion.h3>
          <motion.p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg" variants={itemVariants}>
            {t("pages.landing.engine.rightDescription")}
          </motion.p>
          <motion.div className="flex items-center gap-3 pt-2" variants={itemVariants}>
            <Button asChild variant="secondary" size="lg">
              <Link href={routes.auth.login}>{t("actions.tryNavid")}</Link>
            </Button>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              {t("pages.landing.engine.workflows")}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

