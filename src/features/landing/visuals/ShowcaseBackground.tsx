import { cn } from "@/lib/utils"
import { SHADER_PALETTE } from "@/features/landing/visuals/shaderPalette"

export function ShowcaseBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 20% 18%, ${SHADER_PALETTE.haze}33, transparent 48%)`,
        }}
      />
      <img
        className="absolute -right-24 -top-40 h-[155%] w-auto max-w-none object-contain opacity-40 invert dark:mix-blend-lighten dark:invert-0"
        src="https://ik.imagekit.io/lrigu76hy/tailark/abstract-bg.jpg?updatedAt=1745733473768"
        alt=""
        height="4000"
        width="3000"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${SHADER_PALETTE.blueBlack}3d 0%, ${SHADER_PALETTE.deepNavy}b3 60%, ${SHADER_PALETTE.ink}eb 100%)`,
        }}
      />
    </div>
  )
}

