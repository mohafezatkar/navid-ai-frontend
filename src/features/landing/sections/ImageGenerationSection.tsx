"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Sparkles } from "lucide-react"

import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/features/landing/lib/motion"

type GenerationStep = {
  alt: string
  imageSrc: string
  prompt: string
}

type CyclePhase = "typing" | "showing" | "advancing"
type LoadingState = "starting" | "generating"

const GENERATION_STEPS: GenerationStep[] = [
  {
    alt: "A towering stone monolith in a dramatic mountain valley",
    imageSrc: "/image-generation/1.png",
    prompt:
      "A towering, majestic stone monolith that rises high into the sky. The structure exudes an air of mysticism with intricate carvings and ancient markings.",
  },
  {
    alt: "A futuristic city with glowing structures at dusk",
    imageSrc: "/image-generation/2.png",
    prompt:
      "A futuristic skyline at dusk with luminous architecture, reflective canals, and cinematic atmospheric fog across the horizon.",
  },
  {
    alt: "A surreal desert scene with advanced sci-fi machinery",
    imageSrc: "/image-generation/3.png",
    prompt:
      "A surreal desert with colossal sci-fi machinery buried in sand, dramatic lighting, and ultra-detailed textures in a wide cinematic composition.",
  },
]

const TYPING_SPEED_MS = 22
const DISPLAY_DURATION_MS = 2000
const IMAGE_FADE_DURATION_SECONDS = 0.45

export function ImageGenerationSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<CyclePhase>("typing")
  const [typedPrompt, setTypedPrompt] = useState("")
  const [isImageVisible, setIsImageVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const containerVariants = createRevealContainerVariants(prefersReducedMotion)
  const itemVariants = createRevealItemVariants(prefersReducedMotion)
  const panelVariants = createRevealItemVariants(prefersReducedMotion, { y: 30, duration: 0.9, delay: 0.08 })

  const currentStep = GENERATION_STEPS[activeIndex]
  const typingProgress =
    currentStep.prompt.length === 0 ? 0 : Math.min(100, (typedPrompt.length / currentStep.prompt.length) * 100)
  const loadingProgress = typingProgress
  const loadingState: LoadingState = loadingProgress < 14 ? "starting" : "generating"
  const loadingLabel =
    loadingState === "starting"
      ? "Getting started."
      : "Creating image. May take a moment."
  const loadingMask =
    loadingProgress === 0
      ? "linear-gradient(to bottom, var(--foreground) -5%, var(--foreground) 100%)"
      : `linear-gradient(to bottom, transparent ${Math.max(
          loadingProgress - 5,
          0,
        )}%, transparent ${loadingProgress}%, var(--foreground) ${Math.min(loadingProgress + 5, 100)}%)`

  useEffect(() => {
    if (phase !== "typing") return

    if (typedPrompt.length >= currentStep.prompt.length) {
      const timeoutId = window.setTimeout(() => {
        setIsImageVisible(true)
        setPhase("showing")
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(() => {
      setTypedPrompt(currentStep.prompt.slice(0, typedPrompt.length + 1))
    }, TYPING_SPEED_MS)

    return () => window.clearTimeout(timeoutId)
  }, [currentStep.prompt, phase, typedPrompt])

  useEffect(() => {
    if (phase !== "showing") return

    const timeoutId = window.setTimeout(() => {
      setIsImageVisible(false)
      setPhase("advancing")
    }, DISPLAY_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [phase])

  useEffect(() => {
    if (phase !== "advancing") return

    const timeoutId = window.setTimeout(() => {
      setTypedPrompt("")
      setActiveIndex((previous) => (previous + 1) % GENERATION_STEPS.length)
      setPhase("typing")
    }, prefersReducedMotion ? 0 : Math.round(IMAGE_FADE_DURATION_SECONDS * 1000))

    return () => window.clearTimeout(timeoutId)
  }, [phase, prefersReducedMotion])

  return (
    <motion.section
      className="relative overflow-hidden px-6 py-14 md:px-10 md:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />
      </div>

      <motion.div
        className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch"
        variants={containerVariants}
      >
        <motion.div className="flex flex-col justify-between gap-12" variants={containerVariants}>
          <motion.div className="space-y-5" variants={containerVariants}>
            <motion.p className="inline-flex items-center gap-2 text-sm font-medium text-primary/90" variants={itemVariants}>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
              Text-to-Image Generation
            </motion.p>
            <motion.h2
              className="max-w-xl text-balance text-[clamp(2rem,4.6vw,4.2rem)] font-semibold leading-[1.06] tracking-tight text-foreground"
              variants={itemVariants}
            >
              Describe it, and watch your imagination come to life with stunning detail
            </motion.h2>
          </motion.div>

          <motion.p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg" variants={itemVariants}>
            Navid understands even complex visual prompts and transforms abstract, surreal, or
            hyper-specific ideas into production-ready image outputs.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative min-h-[620px] rounded-3xl bg-card/70 p-4 shadow-sm md:min-h-[820px] md:p-5"
          variants={panelVariants}
        >
          <div className="relative h-full overflow-hidden rounded-2xl bg-card">
            <div
              className={`absolute inset-0 transform-gpu transition-[opacity,filter,transform] duration-500 ${
                phase === "showing" ? "scale-100 opacity-0 blur-0" : "scale-[1.03] opacity-90 blur-xl"
              }`}
            >
              <Image
                src={currentStep.imageSrc}
                alt={currentStep.alt}
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover object-center"
              />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {isImageVisible && (
                <motion.div
                  key={currentStep.imageSrc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : IMAGE_FADE_DURATION_SECONDS,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentStep.imageSrc}
                    alt={currentStep.alt}
                    fill
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {phase === "typing" && (
                <motion.div
                  key={`loading-${activeIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 z-[5]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/60" />
                  <div className="absolute inset-x-5 top-5 md:inset-x-6 md:top-6">
                    <motion.span
                      className="bg-[linear-gradient(110deg,var(--color-muted-foreground),35%,var(--color-foreground),50%,var(--color-muted-foreground),75%,var(--color-muted-foreground))] bg-[length:200%_100%] bg-clip-text text-base font-medium text-transparent"
                      initial={{ backgroundPosition: "200% 0" }}
                      animate={{ backgroundPosition: "-200% 0" }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                        ease: "linear",
                      }}
                    >
                      {loadingLabel}
                    </motion.span>
                  </div>
                  <motion.div
                    className="absolute -top-[25%] h-[125%] w-full bg-background/35"
                    initial={false}
                    animate={{
                      clipPath: `polygon(0 ${loadingProgress}%, 100% ${loadingProgress}%, 100% 100%, 0 100%)`,
                      opacity: 1,
                    }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
                    style={{
                      clipPath: `polygon(0 ${loadingProgress}%, 100% ${loadingProgress}%, 100% 100%, 0 100%)`,
                      maskImage: loadingMask,
                      WebkitMaskImage: loadingMask,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,var(--background)_100%)] opacity-60" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30" />

            <div className="absolute inset-x-4 bottom-4 z-10 md:inset-x-5 md:bottom-5">
              <div className="rounded-xl border border-border/60 bg-background/70 p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-full bg-muted p-1.5 text-foreground">
                    <Sparkles className="size-4" />
                  </span>
                  <p className="min-h-12 text-left text-sm leading-6 text-foreground md:text-base">
                    {typedPrompt || "\u00A0"}
                    <span
                      className={
                        phase === "typing" ? "ml-0.5 inline-block animate-pulse" : "ml-0.5 hidden"
                      }
                    >
                      |
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
