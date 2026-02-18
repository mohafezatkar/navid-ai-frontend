"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Gauge, Sparkles } from "lucide-react"

import { MeshShaderBackground } from "@/components/shared/mesh-shader-background"
import { Button } from "@/components/ui/button"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/features/landing/lib/motion"

const ENGINE_ITEMS = [
  {
    title: "Sagittari Core",
    description: "Enhance image generation throughput up to 40% with optimized inference routing.",
  },
  {
    title: "Navid Deep Research",
    description: "Handle deep research tasks with richer context synthesis and faster retrieval.",
  },
  {
    title: "Collaboration With Google Deep Learning",
    description: "Built on modern model techniques for reliable reasoning and responsive output.",
  },
]

export function EnginePowerSection() {
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
        <div className="absolute right-0 top-1/3 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div className="relative z-10 mx-auto max-w-4xl text-center" variants={containerVariants}>
        <motion.p className="inline-flex items-center gap-2 text-sm font-medium text-primary/90" variants={itemVariants}>
          <span className="size-1.5 rounded-full bg-primary/80" />
          Inside Navid Engines
        </motion.p>
        <motion.h2
          className="mt-4 text-balance text-[clamp(2rem,4.6vw,4.1rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
          variants={itemVariants}
        >
          Unleashing the Power of Navid Intelligence Stack
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
              className="text-6xl font-semibold leading-none tracking-tight text-primary md:text-7xl"
              variants={itemVariants}
            >
              89%
            </motion.p>
            <motion.p className="mt-5 max-w-md text-2xl leading-tight text-primary md:text-[2rem]" variants={itemVariants}>
              Faster Response Time and Generative Accuracy
            </motion.p>

            <motion.div className="mt-7 space-y-3" variants={containerVariants}>
              {ENGINE_ITEMS.map((item, index) => (
                <motion.article
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-card/35 px-4 py-4 md:px-5"
                  variants={createRevealItemVariants(prefersReducedMotion, { y: 18, delay: index * 0.06, duration: 0.72 })}
                >
                  <h3 className="text-lg font-semibold leading-tight text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-primary/80">{item.description}</p>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="space-y-6 lg:pl-2" variants={contentPanelVariants}>
          <motion.span
            className="inline-flex rounded-xl border border-border/60 bg-card/40 p-3 text-primary"
            variants={itemVariants}
          >
            <Gauge className="size-5" />
          </motion.span>
          <motion.h3
            className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground"
            variants={itemVariants}
          >
            Faster than ever before, delivering results in seconds
          </motion.h3>
          <motion.p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg" variants={itemVariants}>
            With improved efficiency and responsiveness, every interaction feels natural and
            instantaneous, making it easier to achieve your goals quickly and effortlessly.
          </motion.p>
          <motion.div className="flex items-center gap-3 pt-2" variants={itemVariants}>
            <Button asChild variant="secondary" size="lg">
              <Link href="/signup">Try Navid 2.1</Link>
            </Button>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              Production-ready workflows
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
