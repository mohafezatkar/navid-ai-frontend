'use client'

import { useLocale } from "next-intl"

import { LandingFooter } from "@/app/[locale]/(marketing)/landing/components/landing-footer"
import { LandingHeader } from "@/app/[locale]/(marketing)/landing/components/landing-header"
import { EnginePowerSection } from "@/app/[locale]/(marketing)/landing/components/engine-power-section"
import { HeroSection } from "@/app/[locale]/(marketing)/landing/components/hero-section"
import { ImageGenerationSection } from "@/app/[locale]/(marketing)/landing/components/image-generation-section"
import { IntelligenceSection } from "@/app/[locale]/(marketing)/landing/components/intelligence-section"
import { LaunchCtaSection } from "@/app/[locale]/(marketing)/landing/components/launch-cta-section"
import { StandoutSection } from "@/app/[locale]/(marketing)/landing/components/standout-section"
import { isRtlLanguage } from "@/i18n/routing"

export function LandingPage() {
  const locale = useLocale()
  const dir = isRtlLanguage(locale) ? "rtl" : "ltr"

  return (
    <main dir={dir} className="relative min-h-screen bg-background">
      <LandingHeader>
        <HeroSection />
      </LandingHeader>

      <div className="relative z-10 mx-auto max-w-full">
        <div className="relative isolate overflow-hidden bg-background">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute top-1/2 h-192 w-3xl -translate-y-1/2 rounded-full bg-primary/14 blur-[120px] [inset-inline-start:-8rem]" />
            <div className="absolute bottom-0 end-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-28 md:gap-40">
            <div className="relative flex flex-col gap-28 md:gap-40">
              <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute end-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />
              </div>
              <div className="relative z-10">
                <IntelligenceSection />
              </div>
              <div className="relative z-10">
                <StandoutSection />
              </div>
            </div>
            <ImageGenerationSection />
            <EnginePowerSection />
            <LaunchCtaSection />
          </div>
        </div>
      </div>

      <LandingFooter />
    </main>
  )
}

