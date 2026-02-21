"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const TYPING_SPEED_MS = 55
const DELETING_SPEED_MS = 32
const HOLD_AFTER_TYPING_MS = 1300
const HOLD_AFTER_DELETING_MS = 280
const HERO_ENTRANCE_DELAY_SECONDS = 0.52
const HERO_ENTRANCE_DELAY_REDUCED_SECONDS = 0.18
const HERO_ENTRANCE_DURATION_REDUCED_SECONDS = 0.34
const HERO_TEXT_DURATION_SECONDS = 0.92
const HERO_CHAT_DURATION_SECONDS = 1.08
const HERO_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function HeroSection() {
  const t = useTranslations()
  const placeholderPrompts = [
    t("pages.landing.prompts.p1"),
    t("pages.landing.prompts.p2"),
    t("pages.landing.prompts.p3"),
    t("pages.landing.prompts.p4"),
    t("pages.landing.prompts.p5"),
    t("pages.landing.prompts.p6"),
    t("pages.landing.prompts.p7"),
    t("pages.landing.prompts.p8"),
    t("pages.landing.prompts.p9"),
    t("pages.landing.prompts.p10"),
  ]
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [typedPlaceholder, setTypedPlaceholder] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const activePrompt = placeholderPrompts[activePromptIndex]

  useEffect(() => {
    let timeoutId: number

    if (!isDeleting && typedPlaceholder === activePrompt) {
      timeoutId = window.setTimeout(() => setIsDeleting(true), HOLD_AFTER_TYPING_MS)
    } else if (isDeleting && typedPlaceholder === "") {
      timeoutId = window.setTimeout(() => {
        setIsDeleting(false)
        setActivePromptIndex((previous) => (previous + 1) % placeholderPrompts.length)
      }, HOLD_AFTER_DELETING_MS)
    } else {
      const nextLength = typedPlaceholder.length + (isDeleting ? -1 : 1)
      timeoutId = window.setTimeout(
        () => setTypedPlaceholder(activePrompt.slice(0, nextLength)),
        isDeleting ? DELETING_SPEED_MS : TYPING_SPEED_MS,
      )
    }

    return () => window.clearTimeout(timeoutId)
  }, [activePrompt, isDeleting, placeholderPrompts.length, typedPlaceholder])

  const containerVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: HERO_ENTRANCE_DURATION_REDUCED_SECONDS,
            delayChildren: HERO_ENTRANCE_DELAY_REDUCED_SECONDS,
            staggerChildren: 0.06,
          },
        },
      }
    : {
        hidden: {},
        visible: {
          transition: { delayChildren: HERO_ENTRANCE_DELAY_SECONDS, staggerChildren: 0.1 },
        },
      }

  const textItemVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: HERO_ENTRANCE_DURATION_REDUCED_SECONDS } },
      }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: HERO_TEXT_DURATION_SECONDS, ease: HERO_EASE },
        },
      }

  const chatInputVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: HERO_ENTRANCE_DURATION_REDUCED_SECONDS } },
      }
    : {
        hidden: { opacity: 0, y: 22, scale: 0.985, filter: "blur(8px)" },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: HERO_CHAT_DURATION_SECONDS, ease: HERO_EASE },
        },
      }

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <section className="flex min-h-svh items-center justify-center">
        <motion.div
          className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center text-foreground"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={textItemVariants}
            className="inline-flex items-center rounded-full border border-border bg-background/70 px-5 py-1.5 text-base text-foreground shadow-sm backdrop-blur-md md:text-lg"
          >
            {t("pages.landing.launchBadge")}
          </motion.span>
          <motion.h1
            variants={textItemVariants}
            className="mt-6 max-w-6xl text-balance text-[clamp(2rem,6vw,5rem)] font-semibold leading-tight tracking-tight"
          >
            {t("pages.landing.heroTitle")}
          </motion.h1>
          <motion.p
            variants={textItemVariants}
            className="mt-8 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl md:leading-8"
          >
            {t("pages.landing.heroDescription")}
          </motion.p>
          <motion.form
            variants={chatInputVariants}
            className="mt-10 w-full max-w-3xl"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="relative rounded-3xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur-sm">
              <Textarea
                placeholder={typedPlaceholder}
                aria-label={t("pages.landing.promptInputLabel")}
                className="h-16 resize-none border-0 bg-transparent px-5 py-3 pe-16 text-lg leading-6 shadow-none field-sizing-fixed placeholder:font-medium placeholder:text-lg focus-visible:ring-0 md:h-32 md:px-6 md:py-4 md:pe-20 md:text-lg md:placeholder:text-lg"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute bottom-4 end-4 h-9 w-9 rounded-full"
                aria-label={t("pages.landing.sendPromptLabel")}
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </section>

      {/* <section className="absolute inset-x-0 bottom-0 pb-16 md:pb-24">
        <div className="group relative w-full px-3 md:px-6">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <div className="w-full text-center md:w-56 md:border-r md:border-border/60 md:pr-6 md:text-right">
              <p className="text-sm text-muted-foreground">Powering the best teams</p>
            </div>
            <div className="relative w-full py-6 md:flex-1">
              <InfiniteSlider durationOnHover={20} duration={40} gap={112}>
                <div className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                    alt="Nvidia Logo"
                    height="20"
                    width="auto"
                  />
                </div>

                <div className="flex">
                  <img
                    className="mx-auto h-4 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/column.svg"
                    alt="Column Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-4 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/github.svg"
                    alt="GitHub Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/nike.svg"
                    alt="Nike Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                    alt="Lemon Squeezy Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-4 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                    alt="Laravel Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex">
                  <img
                    className="mx-auto h-7 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                    alt="Lilly Logo"
                    height="28"
                    width="auto"
                  />
                </div>

                <div className="flex">
                  <img
                    className="mx-auto h-6 w-fit dark:invert"
                    src="https://html.tailus.io/blocks/customers/openai.svg"
                    alt="OpenAI Logo"
                    height="24"
                    width="auto"
                  />
                </div>
              </InfiniteSlider>

              <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background" />
              <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background" />
              <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}
