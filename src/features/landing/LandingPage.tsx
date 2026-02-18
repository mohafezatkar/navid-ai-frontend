'use client'

import { LandingFooter } from "@/features/landing/layout/LandingFooter"
import { LandingHeader } from "@/features/landing/layout/LandingHeader"
import { EnginePowerSection } from "@/features/landing/sections/EnginePowerSection"
import { HeroSection } from "@/features/landing/sections/HeroSection"
import { ImageGenerationSection } from "@/features/landing/sections/ImageGenerationSection"
import { IntelligenceSection } from "@/features/landing/sections/IntelligenceSection"
import { LaunchCtaSection } from "@/features/landing/sections/LaunchCtaSection"
import { StandoutSection } from "@/features/landing/sections/StandoutSection"

export function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <LandingHeader>
        <HeroSection />
      </LandingHeader>

      <div className="relative z-10 mx-auto max-w-full">
        <div className="relative isolate overflow-hidden bg-background">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -left-32 top-1/2 h-192 w-3xl -translate-y-1/2 rounded-full bg-primary/14 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-28 md:gap-40">
            <div className="relative flex flex-col gap-28 md:gap-40">
              <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />
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
