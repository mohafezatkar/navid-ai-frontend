"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MeshGradient, StaticMeshGradient } from "@paper-design/shaders-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const LIGHT_SHADER_PALETTE = {
  background: "#F4F7FB",
  colors: ["#F7FAFD", "#EEF4FC", "#E7F0FC", "#DCE8F9", "#D8E6F3", "#D9EEE8", "#E9DCC6", "#E8CDA7"],
  accentGlow: "#D9EEE8",
  hazeGlow: "#E8CDA7",
} as const;

const DARK_SHADER_PALETTE = {
  background: "#0A0A0B",
  colors: ["#0A0A0B", "#0B0D13", "#0D1218", "#141B27", "#192A42", "#284359", "#587995", "#7994AA"],
  accentGlow: "#284359",
  hazeGlow: "#C8C9CA",
} as const;

type MeshShaderBackgroundProps = {
  animate?: boolean;
  className?: string;
};

function subscribeToClientReady(): () => void {
  return () => {};
}

export function MeshShaderBackground({ animate = true, className }: MeshShaderBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [isReadyForAnimation, setIsReadyForAnimation] = useState(false);
  const isMounted = useSyncExternalStore(subscribeToClientReady, () => true, () => false);
  const shaderPalette =
    isMounted && resolvedTheme === "dark" ? DARK_SHADER_PALETTE : LIGHT_SHADER_PALETTE;

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
      style={{ backgroundColor: shaderPalette.background }}
    >
      {shouldAnimate ? (
        <MeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          colors={shaderPalette.colors}
          speed={0.55}
          distortion={0.65}
          swirl={0.08}
          minPixelRatio={1}
          maxPixelCount={900000}
        />
      ) : (
        <StaticMeshGradient
          className="absolute inset-0 h-full w-full opacity-80"
          colors={shaderPalette.colors}
          minPixelRatio={1}
          maxPixelCount={900000}
        />
      )}

      <div className="absolute inset-0">
        <div
          className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: shaderPalette.accentGlow, opacity: 0.12 }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-24 w-24 rounded-full blur-2xl"
          style={{ backgroundColor: shaderPalette.hazeGlow, opacity: 0.08 }}
        />
      </div>
    </div>
  );
}
