"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { MeshShaderBackground } from "@/components/shared/mesh-shader-background"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
} from "@/features/landing/lib/motion"

const NAV_ITEMS = [
  { label: "API Platform", href: "#link" },
  { label: "Sagittari Engine", href: "#link" },
  { label: "Research", href: "#link" },
  { label: "News", href: "#link" },
  { label: "Pricings", href: "#link" },
  { label: "Career", href: "#link" },
]

type LandingHeaderProps = {
  children?: ReactNode
}

export function LandingHeader({ children }: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const navContainerVariants = createRevealContainerVariants(prefersReducedMotion, {
    delayChildren: 0.08,
    staggerChildren: 0.06,
  })
  const navItemVariants = createRevealItemVariants(prefersReducedMotion, { y: -14, duration: 0.65 })

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
    <section className="relative min-h-svh overflow-hidden">
      <MeshShaderBackground animate={true} />

      <header className="fixed inset-x-0 top-0 z-40">
        <nav
          className={cn(
            "border-none transition-colors duration-300",
            isScrolled
              ? "border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
              : "bg-transparent",
          )}
        >
          <motion.div
            className="flex w-full items-center justify-between px-6 py-1"
            initial="hidden"
            animate="visible"
            variants={navContainerVariants}
          >
            <motion.div variants={navItemVariants}>
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
            </motion.div>

            <motion.div className="ml-auto flex items-center gap-8" variants={navContainerVariants}>
              <motion.div variants={navItemVariants}>
                <NavigationMenu viewport={false} className="hidden md:flex">
                  <NavigationMenuList className="gap-8">
                    {NAV_ITEMS.map((item) => (
                      <NavigationMenuItem key={item.label}>
                        <NavigationMenuLink
                          asChild
                          className="rounded-none bg-transparent p-0 text-md font-semibold text-foreground/85 transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground"
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </motion.div>

              <motion.div variants={navItemVariants}>
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="hidden text-md font-semibold md:inline-flex"
                >
                  <Link href="/signup">Try Navid</Link>
                </Button>
              </motion.div>

              <motion.div variants={navItemVariants}>
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
                    <motion.div
                      className="mt-4 flex flex-col gap-5 px-4"
                      initial="hidden"
                      animate="visible"
                      variants={navContainerVariants}
                    >
                      {NAV_ITEMS.map((item, index) => (
                        <motion.div key={item.label} variants={createRevealItemVariants(prefersReducedMotion, { y: 10, delay: index * 0.04, duration: 0.5 })}>
                          <Link
                            href={item.href}
                            className="text-xl font-semibold text-foreground/85 transition-colors hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                      <motion.div variants={createRevealItemVariants(prefersReducedMotion, { y: 10, delay: 0.24, duration: 0.5 })}>
                        <Button asChild variant="default" size="lg" className="mt-2 font-semibold">
                          <Link href="/signup">Try Navid</Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </SheetContent>
                </Sheet>
              </motion.div>
            </motion.div>
          </motion.div>
        </nav>
      </header>

      <div className="relative z-30">{children}</div>
    </section>
  )
}
