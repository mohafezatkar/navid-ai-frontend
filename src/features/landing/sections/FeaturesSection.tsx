import { Layers, LockKeyhole, MessageSquareMore, Sparkles, TimerReset, Workflow } from "lucide-react"

const LANDING_FEATURES = [
  {
    title: "Multimodal Conversations",
    description: "Handle text and attachments in one assistant workspace for daily product work.",
    icon: MessageSquareMore,
  },
  {
    title: "Session-Protected Routes",
    description: "Secure auth boundaries and protected layouts are already wired into the app shell.",
    icon: LockKeyhole,
  },
  {
    title: "Composable UI Primitives",
    description: "ShadCN components and reusable shell blocks keep feature development consistent.",
    icon: Layers,
  },
  {
    title: "Fast Iteration Loop",
    description: "MSW-based mocks and query hooks make frontend flows easy to test and refine quickly.",
    icon: TimerReset,
  },
  {
    title: "Structured App Workflow",
    description: "Onboarding, settings, and help flows are split into clear route groups and feature slices.",
    icon: Workflow,
  },
  {
    title: "Production-Ready Foundation",
    description: "Typed API contracts and state stores let teams scale without rewiring core architecture.",
    icon: Sparkles,
  },
]

export function FeaturesSection() {
  return (
    <section id="product" className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you get</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Build on a serious foundation, not a throwaway demo.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm"
          >
            <feature.icon className="size-5 text-primary" />
            <h3 className="mt-3 text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
