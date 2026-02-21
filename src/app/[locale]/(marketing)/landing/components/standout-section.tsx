"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Brain, Circle, ImageIcon, UserRound } from "lucide-react"

import { StandoutCard } from "@/app/[locale]/(marketing)/landing/components/standout-card"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/app/[locale]/(marketing)/landing/lib/motion"

const STANDOUT_CARDS = [
  {
    titleKey: "pages.landing.standout.cards.complexityTitle",
    descriptionKey: "pages.landing.standout.cards.complexityDescription",
    icon: Brain,
  },
  {
    titleKey: "pages.landing.standout.cards.visualsTitle",
    descriptionKey: "pages.landing.standout.cards.visualsDescription",
    icon: ImageIcon,
  },
  {
    titleKey: "pages.landing.standout.cards.personalizedTitle",
    descriptionKey: "pages.landing.standout.cards.personalizedDescription",
    icon: UserRound,
  },
]

export function StandoutSection() {
  const t = useTranslations()
  const prefersReducedMotion = useReducedMotion()
  const containerVariants = createRevealContainerVariants(prefersReducedMotion)
  const itemVariants = createRevealItemVariants(prefersReducedMotion)

  return (
    <motion.section
      className="relative isolate overflow-hidden bg-transparent px-6 py-14 md:px-10 md:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <motion.div className="mx-auto max-w-5xl text-center" variants={containerVariants}>
        <motion.p className="inline-flex items-center justify-center gap-2 text-sm font-medium text-accent" variants={itemVariants}>
          <Circle className="size-2 fill-current" />
          {t("pages.landing.standout.eyebrow")}
        </motion.p>
        <motion.h2
          className="mt-4 text-balance text-[clamp(2rem,4.8vw,4.5rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
          variants={itemVariants}
        >
          {t("pages.landing.standout.title")}
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg"
          variants={itemVariants}
        >
          {t("pages.landing.standout.description")}
        </motion.p>
      </motion.div>

      <motion.div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-3" variants={containerVariants}>
        {STANDOUT_CARDS.map((card, index) => (
          <motion.div key={card.titleKey} variants={createRevealItemVariants(prefersReducedMotion, { delay: index * 0.06, y: 26 })}>
            <StandoutCard title={t(card.titleKey)} description={t(card.descriptionKey)} icon={card.icon} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}

