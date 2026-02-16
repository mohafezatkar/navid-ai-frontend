import { cn } from "@/lib/utils"

export function NavidShowcaseBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.2),transparent_48%)]" />
      <img
        className="absolute -right-24 -top-40 h-[155%] w-auto max-w-none object-contain opacity-40 invert dark:mix-blend-lighten dark:invert-0"
        src="https://ik.imagekit.io/lrigu76hy/tailark/abstract-bg.jpg?updatedAt=1745733473768"
        alt=""
        height="4000"
        width="3000"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.24)_0%,rgba(2,6,23,0.7)_60%,rgba(2,6,23,0.92)_100%)]" />
    </div>
  )
}
