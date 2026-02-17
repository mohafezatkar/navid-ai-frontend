"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { MeshGradient, StaticMeshGradient } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShowcaseBackground } from "@/features/landing/visuals/ShowcaseBackground"
import { SHADER_PALETTE } from "@/features/landing/visuals/shaderPalette"

const NAV_ITEMS = [
  { label: "API Platform", href: "#link" },
  { label: "Sagittari Engine", href: "#link" },
  { label: "Research", href: "#link" },
  { label: "News", href: "#link" },
  { label: "Pricings", href: "#link" },
  { label: "Career", href: "#link" },
]

const SHADER_COLORS = [
  SHADER_PALETTE.ink,
  SHADER_PALETTE.blueBlack,
  SHADER_PALETTE.deepNavy,
  SHADER_PALETTE.midnight,
  SHADER_PALETTE.deepSlate,
  SHADER_PALETTE.deepTealSlate,
  SHADER_PALETTE.steelCyanBlue,
  SHADER_PALETTE.paleBlueGray,
]

type LandingShaderBackgroundProps = {
  animate: boolean
}

function LandingShaderBackground({ animate }: LandingShaderBackgroundProps) {
  const [isReadyForAnimation, setIsReadyForAnimation] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const enableAnimation = () => setIsReadyForAnimation(true)

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(enableAnimation, { timeout: 1200 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(enableAnimation, 450)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const shouldAnimate = animate && isReadyForAnimation

  return (
    <div className="absolute inset-0 z-0" style={{ backgroundColor: SHADER_PALETTE.ink }}>
      <ShowcaseBackground className="opacity-80" />
      {shouldAnimate ? (
        <MeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          colors={SHADER_COLORS}
          speed={0.55}
          distortion={0.65}
          swirl={0.08}
          minPixelRatio={1}
          maxPixelCount={900000}
        />
      ) : (
        <StaticMeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          colors={SHADER_COLORS}
          minPixelRatio={1}
          maxPixelCount={900000}
        />
      )}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: SHADER_PALETTE.deepTealSlate, opacity: 0.12 }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: SHADER_PALETTE.haze, opacity: 0.08 }}
        />
      </div>
    </div>
  )
}

type LandingHeaderProps = {
  children?: ReactNode
}

export function LandingHeader({ children }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
  
    const update = () => {
      ticking = false
      const next = window.scrollY > 12
      setIsScrolled((prev) => (prev === next ? prev : next))
    }
  
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }
  
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="relative isolate min-h-svh overflow-hidden">
      <LandingShaderBackground animate={true} />

      <header className="fixed inset-x-0 top-0 z-40">
        <nav
          className={cn(
            "border-none transition-colors duration-300",
            isScrolled
              ? "border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
              : "bg-transparent",
          )}
        >
          <div className="flex w-full items-center justify-between px-6 pb-6 pt-8">
            <Link href="/" aria-label="home" className="flex items-center text-foreground">
              <Image
                src="/brand/logo.svg"
                alt="Navid"
                width={340}
                height={88}
                priority
                className="h-16 w-auto"
              />
              <span className="select-none text-2xl font-bold tracking-tight text-foreground/90 md:ml-1">
                Navid
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-8">
              <NavigationMenu viewport={false} className="hidden md:flex">
                <NavigationMenuList className="gap-8">
                  {NAV_ITEMS.map((item) => (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuLink
                        asChild
                        className="rounded-none bg-transparent p-0 text-lg font-semibold text-foreground/85 transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>

              <Button
                asChild
                variant="default"
                size="lg"
                className="hidden text-md font-semibold md:inline-flex"
              >
                <Link href="#link">Try Navid</Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
                  >
                    <Menu className="size-6" />
                    <span className="sr-only">Open Navigation Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="border-l border-border bg-background/95 text-foreground">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 flex flex-col gap-5 px-4">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="text-xl font-semibold text-foreground/85 transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button asChild variant="default" size="lg" className="mt-2 font-semibold">
                      <Link href="#link">Try Navid</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative z-30">{children}</div>
    </section>
  )
}
