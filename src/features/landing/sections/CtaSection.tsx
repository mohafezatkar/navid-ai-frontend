import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section
      id="pricing"
      className="rounded-[2rem] border border-border bg-card px-6 py-10 text-card-foreground shadow-sm md:px-10 md:py-12"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Launch faster</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Turn this starter into your production AI workspace.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep the architecture, ship your domain logic, and give users a polished assistant
            experience on day one.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              Create account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
