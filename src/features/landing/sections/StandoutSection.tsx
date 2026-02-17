import { Brain, Circle, ImageIcon, UserRound } from "lucide-react"

import { StandoutCard } from "@/features/landing/components/StandoutCard"

const STANDOUT_CARDS = [
  {
    title: "Handles Complexity with Ease",
    description:
      "Navid understands layers of context, nuance, and intent so you can move through hard problems with clarity and speed.",
    icon: Brain,
  },
  {
    title: "Generates Visuals Instantly",
    description:
      "From abstract ideas to polished outputs, Navid turns your prompts into compelling visuals ready to share and iterate.",
    icon: ImageIcon,
  },
  {
    title: "Personalized Just for You",
    description:
      "Responses adapt to your style, goals, and domain context so every interaction feels natural, precise, and useful.",
    icon: UserRound,
  },
]

export function StandoutSection() {
  return (
    <section className="relative isolate overflow-hidden bg-transparent px-6 py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <p className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Circle className="size-2 fill-current" />
          Why Navid Stands Out
        </p>
        <h2 className="mt-4 text-balance text-[clamp(2rem,4.8vw,4.5rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
          Smarter responses. Stunning visuals. Always adaptive
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
          Navid provides powerful, personalized support that feels intuitive and responsive.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-3">
        {STANDOUT_CARDS.map((card) => (
          <StandoutCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  )
}
