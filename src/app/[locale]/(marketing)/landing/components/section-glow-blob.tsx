import { cn } from "@/lib/utils"

type SectionGlowBlobProps = {
  side?: "start" | "end"
  className?: string
}

export function SectionGlowBlob({ side = "start", className }: SectionGlowBlobProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px] -start-20",
        side === "start" ? "-start-20" : "-end-20",
        className,
      )}
    />
  )
}
