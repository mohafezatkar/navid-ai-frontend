"use client"

import type { LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type StandoutCardProps = {
  title: string
  description: string
  icon: LucideIcon
}

export function StandoutCard({ title, description, icon: Icon }: StandoutCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="group h-full"
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -8,
              scale: 1.01,
            }
      }
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.7 }}
    >
      <Card className="h-full border-border/60 bg-card/70 backdrop-blur-sm transition-colors duration-300 group-hover:border-primary/30">
        <CardHeader className="gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/70 bg-background/60 transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/40">
            <Icon
              className="size-6 text-accent/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-accent"
            />
          </div>
          <CardTitle className="text-2xl leading-snug tracking-tight text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-base leading-7 text-muted-foreground">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}
