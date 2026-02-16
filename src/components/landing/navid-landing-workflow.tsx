const WORKFLOW_STEPS = [
  {
    title: "Authenticate and onboard",
    description:
      "Users sign up, verify access, and complete onboarding so each workspace starts in a known state.",
  },
  {
    title: "Work inside one assistant shell",
    description:
      "Conversations, model switching, and attachments stay in a focused environment without context drift.",
  },
  {
    title: "Scale with feature slices",
    description:
      "Settings, chat, and help modules remain independent so teams can ship updates without cross-module regressions.",
  },
];

export function NavidLandingWorkflow() {
  return (
    <section id="workflow" className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">How it works</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          A practical workflow from first session to production.
        </h2>
        <p className="max-w-md text-sm leading-6 text-slate-600">
          The project layout is already designed around clear route groups and feature ownership, so
          adding new capabilities is incremental instead of disruptive.
        </p>
      </div>

      <div className="space-y-3">
        {WORKFLOW_STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              Step {(index + 1).toString().padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
