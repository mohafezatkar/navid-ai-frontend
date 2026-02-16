'use client'

import { NavidLandingCallToAction } from "@/components/landing/navid-landing-call-to-action"
import { NavidLandingFeatureGrid } from "@/components/landing/navid-landing-feature-grid"
import { NavidLandingHeader } from "@/components/landing/navid-landing-header"
import { NavidLandingHeroContent } from "@/components/landing/navid-landing-hero-content"
import { NavidLandingHeroBackground } from "@/components/landing/navid-landing-hero"
import { NavidLandingWorkflow } from "@/components/landing/navid-landing-workflow"
import { MeshGradient } from "@paper-design/shaders-react"

export { ShaderPlane, EnergyRing, NavidLandingHeroBackground } from "@/components/landing/navid-landing-hero"

export function NavidLandingPage() {
  const speed = 1.0

  const SHADER = {
    ink: "#0A0A0B",
    blueBlack: "#0B0D13",
    deepNavy: "#0D1218",
    midnight: "#141B27",
    deepSlate: "#192A42",
    deepTealSlate: "#284359",
    steelCyanBlue: "#587995",
    paleBlueGray: "#7994AA",
    haze: "#C8C9CA",
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative z-10 mx-auto max-w-full">
        <section className="relative isolate min-h-[100svh] overflow-hidden">
          <div className="absolute inset-0 z-0" style={{ backgroundColor: SHADER.ink }}>
            <NavidLandingHeroBackground className="opacity-80" />

            <MeshGradient
              className="absolute inset-0 h-full w-full opacity-80"
              colors={[
                SHADER.ink,
                SHADER.deepNavy,
                SHADER.midnight,
                SHADER.deepSlate,
                SHADER.deepTealSlate,
                SHADER.steelCyanBlue,
                SHADER.paleBlueGray,
              ]}
              speed={speed}
            />

            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full blur-3xl"
                style={{
                  backgroundColor: SHADER.deepTealSlate,
                  opacity: 0.12,
                  animationDuration: `${3 / speed}s`,
                }}
              />
              <div
                className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full blur-2xl"
                style={{
                  backgroundColor: SHADER.haze,
                  opacity: 0.08,
                  animationDuration: `${2 / speed}s`,
                }}
              />
            </div>
          </div>

          <div className="relative z-30">
            <NavidLandingHeader />
            <NavidLandingHeroContent />
          </div>
        </section>

        <div className="mt-14 space-y-14">
          <NavidLandingFeatureGrid />
          <NavidLandingWorkflow />
          <NavidLandingCallToAction />
        </div>
      </div>
    </main>
  )
}
