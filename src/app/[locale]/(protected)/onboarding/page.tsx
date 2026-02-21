"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
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
import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";
import { useModelsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-models-query";
import { useUpdatePreferencesMutation } from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-preferences-query";
import { useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
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
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "school", labelKey: "pages.onboarding.intents.school", icon: GraduationCap },
  { value: "work", labelKey: "pages.onboarding.intents.work", icon: BriefcaseBusiness },
  { value: "personal", labelKey: "pages.onboarding.intents.personal", icon: ListChecks },
  { value: "fun", labelKey: "pages.onboarding.intents.fun", icon: PartyPopper },
  { value: "other", labelKey: "pages.onboarding.intents.other", icon: CircleEllipsis },
];

const GOAL_OPTIONS: Array<{
  value: OnboardingGoal;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "create", labelKey: "pages.onboarding.goals.create", icon: Palette },
  { value: "trip", labelKey: "pages.onboarding.goals.trip", icon: Plane },
  { value: "brainstorm", labelKey: "pages.onboarding.goals.brainstorm", icon: Lightbulb },
  { value: "plan", labelKey: "pages.onboarding.goals.plan", icon: Sparkles },
  { value: "search", labelKey: "pages.onboarding.goals.search", icon: Search },
  { value: "write", labelKey: "pages.onboarding.goals.write", icon: PenSquare },
  { value: "learn", labelKey: "pages.onboarding.goals.learn", icon: BookOpen },
  { value: "organize", labelKey: "pages.onboarding.goals.organize", icon: CalendarCheck },
  { value: "help", labelKey: "pages.onboarding.goals.help", icon: ListChecks },
  { value: "shop", labelKey: "pages.onboarding.goals.shop", icon: ShoppingCart },
  { value: "health", labelKey: "pages.onboarding.goals.health", icon: HeartPulse },
  { value: "money", labelKey: "pages.onboarding.goals.money", icon: Wallet },
  { value: "code", labelKey: "pages.onboarding.goals.code", icon: Code2 },
  { value: "data", labelKey: "pages.onboarding.goals.data", icon: BarChart3 },
  { value: "growth", labelKey: "pages.onboarding.goals.growth", icon: BriefcaseBusiness },
];

export default function OnboardingPage() {
  const t = useTranslations();
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
      router.replace(routes.workspace.chat);
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
      toast.success(t("auth.toasts.onboardingComplete"));
      router.replace(routes.workspace.chat);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.onboarding.failedComplete"));
    }
  }, [defaultModelId, router, t, updatePreferencesMutation]);

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
    return <LoadingState label={t("status.checkingOnboardingStatus")} fullScreen />;
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
                    {t("pages.onboarding.intentTitle")}
                  </h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("pages.onboarding.intentDescription")}
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
                        {t(option.labelKey)}
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
                    {t("actions.next")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 w-full"
                    onClick={() => setStep("goals")}
                  >
                    {t("actions.skip")}
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
                    {t("pages.onboarding.goalsTitle")}
                  </h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("pages.onboarding.goalsDescription")}
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
                        {t(option.labelKey)}
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
                    {t("actions.continue")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 w-full"
                    onClick={() => setStep("tour")}
                  >
                    {t("actions.skip")}
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
                    {t("pages.onboarding.tourLine1")}
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
                    {t("pages.onboarding.tourLine2")}
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

