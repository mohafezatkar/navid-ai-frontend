"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { Input } from "@/components/ui/input"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"

const PLACEHOLDER_PROMPTS = [
  "Ask anything\u2026",
  "Translate this text into English",
  "Write a formal email for me",
  "Summarize this text",
  "Create a study plan for the entrance exam",
  "Write an Instagram caption",
  "Explain this code to me",
  "Suggest a business idea",
  "Rewrite my resume professionally",
  "Plan a 5-day trip",
]

const TYPING_SPEED_MS = 55
const DELETING_SPEED_MS = 32
const HOLD_AFTER_TYPING_MS = 1300
const HOLD_AFTER_DELETING_MS = 280

export function HeroSection() {
  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [typedPlaceholder, setTypedPlaceholder] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const activePrompt = PLACEHOLDER_PROMPTS[activePromptIndex]

  useEffect(() => {
    let timeoutId: number

    if (!isDeleting && typedPlaceholder === activePrompt) {
      timeoutId = window.setTimeout(() => setIsDeleting(true), HOLD_AFTER_TYPING_MS)
    } else if (isDeleting && typedPlaceholder === "") {
      timeoutId = window.setTimeout(() => {
        setIsDeleting(false)
        setActivePromptIndex((previous) => (previous + 1) % PLACEHOLDER_PROMPTS.length)
      }, HOLD_AFTER_DELETING_MS)
    } else {
      const nextLength = typedPlaceholder.length + (isDeleting ? -1 : 1)
      timeoutId = window.setTimeout(
        () => setTypedPlaceholder(activePrompt.slice(0, nextLength)),
        isDeleting ? DELETING_SPEED_MS : TYPING_SPEED_MS,
      )
    }

    return () => window.clearTimeout(timeoutId)
  }, [activePrompt, isDeleting, typedPlaceholder])

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden">
      <section className="flex min-h-[100svh] items-center justify-center">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center text-foreground">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background/60 px-5 py-1.5 text-base text-muted-foreground md:text-lg">
            Navid 1.0 - Public Launch Coming Soon
          </span>
          <h1 className="mt-6 max-w-6xl text-balance text-[clamp(2rem,6vw,5rem)] font-semibold leading-tight tracking-tight">
            AI That Truly Understands You
          </h1>
          <p className="mt-8 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl md:leading-8">
          Navid is a next-generation language model built for speed, deep reasoning, and precise results across coding, analysis, writing, and problem-solving.
          </p>
          <form className="mt-10 w-full max-w-3xl" onSubmit={(event) => event.preventDefault()}>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-sm backdrop-blur-sm">
              <Input
                type="text"
                placeholder={typedPlaceholder}
                aria-label="Prompt input"
                className="h-12 border-0 bg-transparent px-4 text-lg shadow-none placeholder:font-medium placeholder:text-lg focus-visible:ring-0"
              />
              <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-base font-semibold">
                Ask Navid
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="absolute inset-x-0 bottom-0 pb-16 md:pb-24">
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
      </section>
    </div>
  )
}
