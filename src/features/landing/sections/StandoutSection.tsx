"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Brain, Circle, ImageIcon, UserRound } from "lucide-react"

import { StandoutCard } from "@/features/landing/components/StandoutCard"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/features/landing/lib/motion"

const STANDOUT_CARDS = [
  {
    title: "Handles Complexity with Ease",
    description:
      "Navid understands layers of context, nuance, and intent so you can move through hard problems with clarity and speed.",
    icon: Brain,
  },
  {
    title: "Generates Visuals Instantly",
    description:
      "From abstract ideas to polished outputs, Navid turns your prompts into compelling visuals ready to share and iterate.",
    icon: ImageIcon,
  },
  {
    title: "Personalized Just for You",
    description:
      "Responses adapt to your style, goals, and domain context so every interaction feels natural, precise, and useful.",
    icon: UserRound,
  },
]

export function StandoutSection() {
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
        <motion.p className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary" variants={itemVariants}>
          <Circle className="size-2 fill-current" />
          Why Navid Stands Out
        </motion.p>
        <motion.h2
          className="mt-4 text-balance text-[clamp(2rem,4.8vw,4.5rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
          variants={itemVariants}
        >
          Smarter responses. Stunning visuals. Always adaptive
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg"
          variants={itemVariants}
        >
          Navid provides powerful, personalized support that feels intuitive and responsive.
        </motion.p>
      </motion.div>

      <motion.div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-3" variants={containerVariants}>
        {STANDOUT_CARDS.map((card, index) => (
          <motion.div key={card.title} variants={createRevealItemVariants(prefersReducedMotion, { delay: index * 0.06, y: 26 })}>
            <StandoutCard title={card.title} description={card.description} icon={card.icon} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  )
}
