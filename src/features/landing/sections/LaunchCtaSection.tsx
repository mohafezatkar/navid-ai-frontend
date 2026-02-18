"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

import { MeshShaderBackground } from "@/components/shared/mesh-shader-background"
import { Button } from "@/components/ui/button"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/features/landing/lib/motion"

export function LaunchCtaSection() {
  const prefersReducedMotion = useReducedMotion()
  const containerVariants = createRevealContainerVariants(prefersReducedMotion)
  const itemVariants = createRevealItemVariants(prefersReducedMotion)
  const frameVariants = createRevealItemVariants(prefersReducedMotion, { y: 30, scale: 0.98, duration: 0.9 })

  return (
    <motion.section
      className="relative flex min-h-svh items-center px-4 py-8 md:px-8 md:py-10"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <div className="mx-auto w-full max-w-[96rem]">
        <motion.div
          className="relative flex min-h-[72svh] w-full items-center justify-center overflow-hidden rounded-3xl border border-border/60 px-6 py-16 md:min-h-[80svh] md:px-14 md:py-24"
          variants={frameVariants}
        >
          <MeshShaderBackground animate={true} className="opacity-95" />

          <motion.div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center" variants={containerVariants}>
            <motion.span
              className="inline-flex items-center rounded-full border border-border bg-background/75 px-5 py-1.5 text-base text-foreground shadow-sm backdrop-blur-md md:text-lg"
              variants={itemVariants}
            >
              Navid 1.0 - Public Launch Coming Soon
            </motion.span>
            <motion.h2
              className="mt-5 text-balance text-[clamp(2.1rem,5vw,4.25rem)] font-semibold leading-[1.05] tracking-tight text-primary"
              variants={itemVariants}
            >
              Do More With Navid
            </motion.h2>

            <motion.div className="mt-8 flex flex-wrap items-center justify-center" variants={itemVariants}>
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">Try Navid 2.1</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
