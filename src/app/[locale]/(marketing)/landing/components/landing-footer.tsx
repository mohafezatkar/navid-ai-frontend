"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { isRtlLanguage } from "@/i18n/routing"
import { routes } from "@/lib/routes"
import {
  createRevealContainerVariants,
  createRevealItemVariants,
  LANDING_REVEAL_VIEWPORT,
} from "@/app/[locale]/(marketing)/landing/lib/motion"

const FOOTER_LINKS = [
  { key: "sagittariEngine", href: "#link" },
  { key: "apiPlatform", href: "#link" },
  { key: "research", href: "#link" },
  { key: "news", href: "#link" },
  { key: "pricing", href: "#link" },
  { key: "career", href: "#link" },
]

export function LandingFooter() {
  const t = useTranslations()
  const isRtl = isRtlLanguage(useLocale())
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const containerVariants = createRevealContainerVariants(prefersReducedMotion)
  const itemVariants = createRevealItemVariants(prefersReducedMotion, { y: 16, duration: 0.7 })

  return (
    <motion.footer
      className="relative overflow-hidden px-6 pt-10 md:px-10 md:pt-14"
      initial="hidden"
      whileInView="visible"
      viewport={LANDING_REVEAL_VIEWPORT}
    >
      <motion.div className="mx-auto max-w-7xl" variants={containerVariants}>
        <motion.nav
          className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-semibold text-foreground/85 sm:grid-cols-3 lg:grid-cols-6"
          variants={containerVariants}
        >
          {FOOTER_LINKS.map((item, index) => (
            <motion.div key={item.key} variants={createRevealItemVariants(prefersReducedMotion, { y: 14, delay: index * 0.04, duration: 0.64 })}>
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {t(`navigation.${item.key}`)}
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      </motion.div>

      <motion.div className="mt-10 md:mt-12" variants={itemVariants}>
        <Link
          href={routes.auth.register}
          aria-label={t("actions.tryNow")}
          className="block overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
        >
          <div className="relative h-[clamp(7rem,20vw,14rem)] overflow-hidden">
            <motion.div
              className="absolute inset-0 h-[200%]"
              animate={{ y: isHovered ? "-50%" : "0%" }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-1/2 items-center justify-center gap-4 px-4 md:gap-6 md:px-8">
                <span className="select-none whitespace-nowrap text-[clamp(4rem,15.4vw,13.4rem)] font-semibold leading-[0.82] tracking-tight text-foreground/95">
                  {t("common.appName")}
                </span>
              </div>
              <div className="flex h-1/2 items-center justify-center gap-4 px-4 md:gap-6 md:px-8">
                <span className="select-none whitespace-nowrap text-[clamp(3.85rem,15vw,13rem)] font-semibold leading-[0.82] tracking-tight text-foreground">
                  {t("actions.tryNow")}
                </span>
                <ArrowRight
                  className={`size-[clamp(2.5rem,7vw,6rem)] text-foreground ${isRtl ? "rotate-180" : ""}`}
                />
              </div>
            </motion.div>
          </div>
        </Link>
      </motion.div>

      <motion.div className="mx-auto max-w-7xl pb-8 pt-4 text-sm text-muted-foreground" variants={itemVariants}>
        <span>{t("common.copyright")} </span>
        <Link href="#link" className="underline underline-offset-2 transition-colors hover:text-foreground">
          {t("actions.manageCookies")}
        </Link>
      </motion.div>
    </motion.footer>
  )
}

