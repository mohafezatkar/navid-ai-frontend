'use client'

import { LandingHeader } from "@/features/landing/layout/LandingHeader"
import { CtaSection } from "@/features/landing/sections/CtaSection"
import { FeaturesSection } from "@/features/landing/sections/FeaturesSection"
import { HeroSection } from "@/features/landing/sections/HeroSection"
import { IntelligenceSection } from "@/features/landing/sections/IntelligenceSection"
import { StandoutSection } from "@/features/landing/sections/StandoutSection"
import { WorkflowSection } from "@/features/landing/sections/WorkflowSection"

export function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <LandingHeader>
        <HeroSection />
      </LandingHeader>

      <div className="relative z-10 mx-auto max-w-full">
        <div className="relative isolate overflow-hidden bg-background">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -left-32 top-1/2 h-[48rem] w-[48rem] -translate-y-1/2 rounded-full bg-primary/14 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <IntelligenceSection />
            <StandoutSection />
          </div>
        </div>
        <FeaturesSection />
        <WorkflowSection />
        <CtaSection />
      </div>
    </main>
  )
}
