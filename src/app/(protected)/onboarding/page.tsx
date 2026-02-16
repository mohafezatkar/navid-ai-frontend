"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  CircleEllipsis,
  Code2,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  ListChecks,
  Palette,
  PartyPopper,
  PenSquare,
  Plane,
  Search,
  ShoppingCart,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/features/auth/hooks/use-session-query";
import { useModelsQuery } from "@/features/chat/hooks/use-models-query";
import { useUpdatePreferencesMutation } from "@/features/settings/hooks/use-preferences-query";
import { cn } from "@/lib/utils";

type OnboardingStep = "intent" | "goals" | "tour";
type OnboardingIntent = "school" | "work" | "personal" | "fun" | "other";
type OnboardingGoal =
  | "create"
  | "trip"
  | "brainstorm"
  | "plan"
  | "search"
  | "write"
  | "learn"
  | "organize"
  | "help"
  | "shop"
  | "health"
  | "money"
  | "code"
  | "data"
  | "growth";

const STEP_TRANSITION_SECONDS = 0.24;
const TOUR_TIMINGS = {
  firstSentenceDelaySeconds: 0.5,
  firstSentenceDurationSeconds: 1,
  secondSentenceDelaySeconds: 1.5,
  secondSentenceDurationSeconds: 1,
  autoFinishDelayMs: 4200,
};

const INTENT_OPTIONS: Array<{
  value: OnboardingIntent;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "school", label: "School", icon: GraduationCap },
  { value: "work", label: "Work", icon: BriefcaseBusiness },
  { value: "personal", label: "Personal tasks", icon: ListChecks },
  { value: "fun", label: "Fun and entertainment", icon: PartyPopper },
  { value: "other", label: "Other", icon: CircleEllipsis },
];

const GOAL_OPTIONS: Array<{
  value: OnboardingGoal;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "create", label: "Create something", icon: Palette },
  { value: "trip", label: "Plan a trip", icon: Plane },
  { value: "brainstorm", label: "Brainstorm", icon: Lightbulb },
  { value: "plan", label: "Plan something", icon: Sparkles },
  { value: "search", label: "Search", icon: Search },
  { value: "write", label: "Write or edit", icon: PenSquare },
  { value: "learn", label: "Learn & study", icon: BookOpen },
  { value: "organize", label: "Get organized", icon: CalendarCheck },
  { value: "help", label: "Get step-by-step help", icon: ListChecks },
  { value: "shop", label: "Shop smarter", icon: ShoppingCart },
  { value: "health", label: "Stay healthy", icon: HeartPulse },
  { value: "money", label: "Manage money", icon: Wallet },
  { value: "code", label: "Code or debug", icon: Code2 },
  { value: "data", label: "Analyze data", icon: BarChart3 },
  { value: "growth", label: "Grow professionally", icon: BriefcaseBusiness },
];

export default function OnboardingPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { data: session, isLoading: isSessionLoading } = useSessionQuery();
  const modelsQuery = useModelsQuery();
  const updatePreferencesMutation = useUpdatePreferencesMutation();

  const [step, setStep] = useState<OnboardingStep>("intent");
  const [intent, setIntent] = useState<OnboardingIntent | null>(null);
  const [goals, setGoals] = useState<OnboardingGoal[]>([]);
  const hasScheduledFinalizationRef = useRef(false);

  const defaultModelId = modelsQuery.data?.[0]?.id ?? "";

  useEffect(() => {
    if (session?.onboardingComplete) {
      router.replace("/chat");
    }
  }, [router, session]);

  const finalizeOnboarding = useCallback(async () => {
    if (!defaultModelId) {
      return;
    }

    try {
      await updatePreferencesMutation.mutateAsync({
        theme: "system",
        defaultModelId,
      });
      toast.success("Onboarding complete.");
      router.replace("/chat");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete onboarding.");
    }
  }, [defaultModelId, router, updatePreferencesMutation]);

  useEffect(() => {
    if (step !== "tour") {
      hasScheduledFinalizationRef.current = false;
      return;
    }

    if (
      hasScheduledFinalizationRef.current ||
      modelsQuery.isLoading ||
      !defaultModelId
    ) {
      return;
    }

    hasScheduledFinalizationRef.current = true;
    const timeoutId = window.setTimeout(
      () => {
        void finalizeOnboarding();
      },
      prefersReducedMotion ? 260 : TOUR_TIMINGS.autoFinishDelayMs,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [defaultModelId, finalizeOnboarding, modelsQuery.isLoading, prefersReducedMotion, step]);

  const toggleGoal = (goal: OnboardingGoal) => {
    setGoals((currentGoals) => {
      if (currentGoals.includes(goal)) {
        return currentGoals.filter((value) => value !== goal);
      }
      return [...currentGoals, goal];
    });
  };

  if (isSessionLoading) {
    return <LoadingState label="Checking onboarding status..." fullScreen />;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            {step === "intent" ? (
              <motion.section
                key="intent"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{
                  duration: prefersReducedMotion ? 0.14 : STEP_TRANSITION_SECONDS,
                  ease: "easeOut",
                }}
                className="space-y-6"
              >
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-semibold tracking-tight">
                    What brings you to Navid?
                  </h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    We&apos;ll use this information to suggest ideas you might find useful.
                  </p>
                </div>

                <div className="space-y-2">
                  {INTENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = intent === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        className={cn(
                          "h-12 w-full justify-start rounded-lg border px-4 text-sm",
                          isSelected
                            ? "border-border bg-muted text-foreground"
                            : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground",
                        )}
                        onClick={() => setIntent(option.value)}
                      >
                        <Icon className="size-4" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
                    disabled={!intent}
                    onClick={() => setStep("goals")}
                  >
                    Next
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 w-full"
                    onClick={() => setStep("goals")}
                  >
                    Skip
                  </Button>
                </div>
              </motion.section>
            ) : step === "goals" ? (
              <motion.section
                key="goals"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{
                  duration: prefersReducedMotion ? 0.14 : STEP_TRANSITION_SECONDS,
                  ease: "easeOut",
                }}
                className="space-y-6"
              >
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-semibold tracking-tight">
                    What do you want to do with Navid?
                  </h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Pick one or more options so we can tailor your first suggestions.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {GOAL_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = goals.includes(option.value);

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        className={cn(
                          "h-10 rounded-full border px-4 text-sm",
                          isSelected
                            ? "border-border bg-muted text-foreground"
                            : "border-border/50 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
                        )}
                        onClick={() => toggleGoal(option.value)}
                      >
                        <Icon className="size-4" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => setStep("tour")}
                  >
                    Continue
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 w-full"
                    onClick={() => setStep("tour")}
                  >
                    Skip
                  </Button>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="tour"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{
                  duration: prefersReducedMotion ? 0.14 : STEP_TRANSITION_SECONDS,
                  ease: "easeOut",
                }}
                className="flex min-h-[320px] items-center justify-center"
              >
                <div className="space-y-1 text-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: prefersReducedMotion
                        ? 0.12
                        : TOUR_TIMINGS.firstSentenceDurationSeconds,
                      delay: prefersReducedMotion ? 0 : TOUR_TIMINGS.firstSentenceDelaySeconds,
                      ease: "easeOut",
                    }}
                    className="text-5xl font-semibold tracking-tight"
                  >
                    Nice to meet you.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: prefersReducedMotion
                        ? 0.12
                        : TOUR_TIMINGS.secondSentenceDurationSeconds,
                      delay: prefersReducedMotion ? 0 : TOUR_TIMINGS.secondSentenceDelaySeconds,
                      ease: "easeOut",
                    }}
                    className="text-5xl font-semibold tracking-tight text-muted-foreground"
                  >
                    Here&apos;s a quick tour...
                  </motion.p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
