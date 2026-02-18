"use client";

import { useEffect, useState } from "react";
import { MeshGradient, StaticMeshGradient } from "@paper-design/shaders-react";

import { cn } from "@/lib/utils";

const SHADER_PALETTE = {
  ink: "#0A0A0B",
  blueBlack: "#0B0D13",
  deepNavy: "#0D1218",
  midnight: "#141B27",
  deepSlate: "#192A42",
  deepTealSlate: "#284359",
  steelCyanBlue: "#587995",
  paleBlueGray: "#7994AA",
  haze: "#C8C9CA",
} as const;

const SHADER_COLORS = [
  SHADER_PALETTE.ink,
  SHADER_PALETTE.blueBlack,
  SHADER_PALETTE.deepNavy,
  SHADER_PALETTE.midnight,
  SHADER_PALETTE.deepSlate,
  SHADER_PALETTE.deepTealSlate,
  SHADER_PALETTE.steelCyanBlue,
  SHADER_PALETTE.paleBlueGray,
];

type MeshShaderBackgroundProps = {
  animate?: boolean;
  className?: string;
};

export function MeshShaderBackground({ animate = true, className }: MeshShaderBackgroundProps) {
  const [isReadyForAnimation, setIsReadyForAnimation] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const enableAnimation = () => setIsReadyForAnimation(true);

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(enableAnimation, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(enableAnimation, 450);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const shouldAnimate = animate && isReadyForAnimation;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{ backgroundColor: SHADER_PALETTE.ink }}
    >
      {shouldAnimate ? (
        <MeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          colors={SHADER_COLORS}
          speed={0.55}
          distortion={0.65}
          swirl={0.08}
          minPixelRatio={1}
          maxPixelCount={900000}
        />
      ) : (
        <StaticMeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          colors={SHADER_COLORS}
          minPixelRatio={1}
          maxPixelCount={900000}
        />
      )}

      <div className="absolute inset-0">
        <div
          className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: SHADER_PALETTE.deepTealSlate, opacity: 0.12 }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: SHADER_PALETTE.haze, opacity: 0.08 }}
        />
      </div>
    </div>
  );
}
