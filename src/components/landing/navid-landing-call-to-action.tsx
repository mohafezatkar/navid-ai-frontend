import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NavidLandingCallToAction() {
  return (
    <section
      id="pricing"
      className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_55%,#334155_100%)] px-6 py-10 text-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.85)] md:px-10 md:py-12"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
            Launch faster
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Turn this starter into your production AI workspace.
          </h2>
          <p className="text-sm leading-6 text-slate-200">
            Keep the architecture, ship your domain logic, and give users a polished assistant
            experience on day one.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
            <Link href="/signup">
              Create account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
