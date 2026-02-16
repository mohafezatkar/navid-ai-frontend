import Link from "next/link"

import { Button } from "@/components/ui/button"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"

export function NavidLandingHeroContent() {
  return (
    <div className="overflow-x-hidden">
      <section>
        <div className="pb-16 pt-20 md:pb-20 md:pt-28 lg:pt-32">
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center text-white">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/25 px-4 py-1 text-sm text-white/90">
              Abelle 2.2 Launched At 21st May 2025
            </span>

            <h1 className="mt-6 max-w-4xl text-balance text-8xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Always Make Things Understandable
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-slate-200 md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-black/35 px-6 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#link">
                  <span className="text-nowrap">Build With API</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white px-6 text-base text-black hover:bg-zinc-100">
                <Link href="#link">
                  <span className="text-nowrap">Try Abelle 2.1</span>
                </Link>
              </Button>
            </div>

            <img
              className="pointer-events-none mt-12 h-44 w-full max-w-3xl object-cover opacity-45 mix-blend-screen invert sm:h-64 lg:h-80 dark:invert-0"
              src="https://ik.imagekit.io/lrigu76hy/tailark/abstract-bg.jpg?updatedAt=1745733473768"
              alt="Abstract Object"
              height="4000"
              width="3000"
            />
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="group relative w-full px-3 md:px-6">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <div className="w-full text-center md:w-56 md:border-r md:border-white/20 md:pr-6 md:text-right">
              <p className="text-sm text-white/80">Powering the best teams</p>
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

              <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-[#0A0A0B]" />
              <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-[#0A0A0B]" />
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
