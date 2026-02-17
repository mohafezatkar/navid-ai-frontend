import Link from "next/link"
import { Circle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function IntelligenceSection() {
  return (
    <section className="relative isolate overflow-hidden bg-transparent">
      <div className="relative z-10 mx-auto grid min-h-[540px] max-w-7xl grid-cols-1 gap-14 px-8 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-10">
        <div className="max-w-4xl">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Circle className="h-2.5 w-2.5 fill-current" />
            <span className="text-lg font-bold tracking-wide">Meet Navid</span>
          </p>
          <h2 className="mt-3 text-balance text-[clamp(1.8rem,3.6vw,4rem)] font-medium leading-[1.08] tracking-tight text-primary">
            Navid is an intelligent system designed to handle complex tasks, generate visuals, and
            respond with a deep sense of personalization and adapting to your needs with a
            remarkably human touch
          </h2>
        </div>

        <div className="self-end pb-2">
          <p className="max-w-sm text-base leading-7 text-primary mb-6">
            Whether you&apos;re crafting ideas, solving challenges, or simply exploring - Abelle
            understands your context
          </p>
          <Button asChild variant="default">
            <Link href="/signup">Try Navid</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
