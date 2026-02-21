"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { Menu } from "lucide-react"

import { LanguageSwitcher } from "@/components/shared/language-switcher"
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
} from "@/app/[locale]/(marketing)/landing/lib/motion"
import { isRtlLanguage } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { routes } from "@/lib/routes"

const NAV_ITEMS = [
  { key: "apiPlatform", href: "#link" },
  { key: "sagittariEngine", href: "#link" },
  { key: "research", href: "#link" },
  { key: "news", href: "#link" },
  { key: "pricing", href: "#link" },
  { key: "career", href: "#link" },
]

type LandingHeaderProps = {
  children?: ReactNode
}

function subscribeToClientReady(): () => void {
  return () => {}
}

export function LandingHeader({ children }: LandingHeaderProps) {
  const t = useTranslations()
  const isRtl = isRtlLanguage(useLocale())
  const [isScrolled, setIsScrolled] = useState(false)
  const isMounted = useSyncExternalStore(subscribeToClientReady, () => true, () => false)
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
              <Link href="/" aria-label={t("actions.goHome")} className="flex items-center text-foreground">
                <Image
                  src="/brand/logo.svg"
                  alt={t("common.brandName")}
                  width={340}
                  height={88}
                  priority
                  className="h-16 w-auto"
                />
                <span className="select-none text-2xl font-bold tracking-tight text-foreground/90 md:ms-1">
                  Navid
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center gap-8"
              style={{ marginInlineStart: "auto" }}
              variants={navContainerVariants}
            >
              <motion.div variants={navItemVariants}>
                <NavigationMenu viewport={false} className="hidden md:flex">
                  <NavigationMenuList className="gap-8">
                    {NAV_ITEMS.map((item) => (
                      <NavigationMenuItem key={item.key}>
                        <NavigationMenuLink
                          asChild
                          className="rounded-none bg-transparent p-0 text-md font-semibold text-foreground/85 transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground"
                        >
                          <Link href={item.href}>{t(`navigation.${item.key}`)}</Link>
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
                  <Link href={routes.auth.register}>{t("actions.tryNavid")}</Link>
                </Button>
              </motion.div>
              <motion.div variants={navItemVariants} className="hidden md:block">
                <LanguageSwitcher />
              </motion.div>

              <motion.div variants={navItemVariants}>
                {isMounted ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
                      >
                        <Menu className="size-6" />
                        <span className="sr-only">{t("actions.openNavigationMenu")}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side={isRtl ? "left" : "right"}
                      className={cn(
                        "border-border bg-background/95 text-foreground",
                        isRtl ? "border-r" : "border-l",
                      )}
                    >
                      <SheetHeader>
                        <SheetTitle>{t("navigation.navigation")}</SheetTitle>
                      </SheetHeader>
                      <motion.div
                        className="mt-4 flex flex-col gap-5 px-4"
                        initial="hidden"
                        animate="visible"
                        variants={navContainerVariants}
                      >
                        {NAV_ITEMS.map((item, index) => (
                          <motion.div key={item.key} variants={createRevealItemVariants(prefersReducedMotion, { y: 10, delay: index * 0.04, duration: 0.5 })}>
                            <Link
                              href={item.href}
                              className="text-xl font-semibold text-foreground/85 transition-colors hover:text-foreground"
                            >
                              {t(`navigation.${item.key}`)}
                            </Link>
                          </motion.div>
                        ))}
                        <motion.div variants={createRevealItemVariants(prefersReducedMotion, { y: 10, delay: 0.24, duration: 0.5 })}>
                          <LanguageSwitcher className="mb-3" />
                          <Button asChild variant="default" size="lg" className="mt-2 font-semibold">
                            <Link href={routes.auth.register}>{t("actions.tryNavid")}</Link>
                          </Button>
                        </motion.div>
                      </motion.div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
                    aria-hidden="true"
                    disabled
                  >
                    <Menu className="size-6" />
                    <span className="sr-only">{t("actions.openNavigationMenu")}</span>
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </nav>
      </header>

      <div className="relative z-30">{children}</div>
    </section>
  )
}

