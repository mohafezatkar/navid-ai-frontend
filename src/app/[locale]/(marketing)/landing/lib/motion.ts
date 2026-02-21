import type { Variants, ViewportOptions } from "framer-motion"

export const LANDING_REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const LANDING_REVEAL_VIEWPORT: ViewportOptions = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -8% 0px",
}

type RevealContainerOptions = {
  delayChildren?: number
  staggerChildren?: number
}

type RevealItemOptions = {
  x?: number
  y?: number
  scale?: number
  duration?: number
  delay?: number
}

export function createRevealContainerVariants(
  prefersReducedMotion: boolean | null,
  options: RevealContainerOptions = {},
): Variants {
  const { delayChildren = 0, staggerChildren = 0.12 } = options

  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.26,
          delayChildren,
          staggerChildren: 0.05,
        },
      },
    }
  }

  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren,
        staggerChildren,
      },
    },
  }
}

export function createRevealItemVariants(
  prefersReducedMotion: boolean | null,
  options: RevealItemOptions = {},
): Variants {
  const { x = 0, y = 22, scale = 0.985, duration = 0.8, delay = 0 } = options

  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.24,
          delay,
        },
      },
    }
  }

  return {
    hidden: {
      opacity: 0,
      x,
      y,
      scale,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration,
        delay,
        ease: LANDING_REVEAL_EASE,
      },
    },
  }
}
