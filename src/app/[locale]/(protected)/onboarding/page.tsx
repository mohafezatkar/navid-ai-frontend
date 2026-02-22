"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  ChevronLeft,
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
import {
  usePreferencesQuery,
  useUpdatePreferencesMutation,
} from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-preferences-query";
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
type TourPreviewKind = "ask" | "picture" | "uploads";

const STEP_TRANSITION_SECONDS = 0.24;
const TOUR_INTRO_TIMINGS = {
  firstSentenceDelaySeconds: 0.5,
  firstSentenceDurationSeconds: 1,
  secondSentenceDelaySeconds: 1.5,
  secondSentenceDurationSeconds: 1,
  autoAdvanceDelayMs: 3200,
};
const TOUR_FEATURE_STEPS: Array<{
  key: TourPreviewKind;
  titleKey: string;
  descriptionKey: string;
}> = [
  {
    key: "ask",
    titleKey: "pages.onboarding.quickTour.steps.ask.title",
    descriptionKey: "pages.onboarding.quickTour.steps.ask.description",
  },
  {
    key: "picture",
    titleKey: "pages.onboarding.quickTour.steps.picture.title",
    descriptionKey: "pages.onboarding.quickTour.steps.picture.description",
  },
  {
    key: "uploads",
    titleKey: "pages.onboarding.quickTour.steps.uploads.title",
    descriptionKey: "pages.onboarding.quickTour.steps.uploads.description",
  },
];
const TOUR_TOTAL_STEPS = TOUR_FEATURE_STEPS.length + 1;

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
  const preferencesQuery = usePreferencesQuery();
  const updatePreferencesMutation = useUpdatePreferencesMutation();

  const [step, setStep] = useState<OnboardingStep>("intent");
  const [intent, setIntent] = useState<OnboardingIntent | null>(null);
  const [goals, setGoals] = useState<OnboardingGoal[]>([]);
  const [tourStepIndex, setTourStepIndex] = useState(-1);

  const defaultModelId = preferencesQuery.data?.defaultModelId ?? "";
  const canFinalizeOnboarding =
    !preferencesQuery.isLoading &&
    Boolean(defaultModelId) &&
    !updatePreferencesMutation.isPending;
  const isTourIntroStep = tourStepIndex < 0;
  const isTourReadyStep = tourStepIndex === TOUR_TOTAL_STEPS - 1;
  const currentTourStep =
    TOUR_FEATURE_STEPS[
      Math.min(
        Math.max(tourStepIndex, 0),
        TOUR_FEATURE_STEPS.length - 1,
      )
    ];

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

  const toggleGoal = (goal: OnboardingGoal) => {
    setGoals((currentGoals) => {
      if (currentGoals.includes(goal)) {
        return currentGoals.filter((value) => value !== goal);
      }
      return [...currentGoals, goal];
    });
  };

  useEffect(() => {
    if (step !== "tour" || !isTourIntroStep) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setTourStepIndex(0),
      prefersReducedMotion ? 260 : TOUR_INTRO_TIMINGS.autoAdvanceDelayMs,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isTourIntroStep, prefersReducedMotion, step]);

  const startTour = () => {
    setTourStepIndex(-1);
    setStep("tour");
  };

  const goToNextTourStep = () => {
    setTourStepIndex((currentStep) => Math.min(currentStep + 1, TOUR_TOTAL_STEPS - 1));
  };

  const goToPreviousTourStep = () => {
    setTourStepIndex((currentStep) => Math.max(currentStep - 1, -1));
  };

  const renderTourPreview = (previewKind: TourPreviewKind) => {
    if (previewKind === "ask") {
      return (
        <div className="space-y-5">
          <div className="flex justify-end">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/95">
              {t("pages.onboarding.quickTour.steps.ask.prompt")}
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm text-white/70">
              {t("pages.onboarding.quickTour.steps.ask.responseHeading")}
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-white/85">
              <li>{t("pages.onboarding.quickTour.steps.ask.point1")}</li>
              <li>{t("pages.onboarding.quickTour.steps.ask.point2")}</li>
              <li>{t("pages.onboarding.quickTour.steps.ask.point3")}</li>
            </ul>
          </div>
        </div>
      );
    }

    if (previewKind === "picture") {
      return (
        <div className="space-y-5">
          <div className="flex items-start justify-end gap-3">
            <Image
              src="/image-generation/2.png"
              alt={t("pages.onboarding.quickTour.steps.picture.thumbnailAlt")}
              width={56}
              height={56}
              className="size-14 rounded-xl border border-white/15 object-cover"
            />
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/95">
              {t("pages.onboarding.quickTour.steps.picture.prompt")}
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
            <p className="mb-3 text-sm font-medium text-white/85">
              {t("pages.onboarding.quickTour.steps.picture.responseHeading")}
            </p>
            <Image
              src="/image-generation/3.png"
              alt={t("pages.onboarding.quickTour.steps.picture.generatedAlt")}
              width={720}
              height={840}
              className="h-auto w-full rounded-2xl border border-white/10 object-cover"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-col items-end gap-3">
          <div className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs">
            <p className="font-semibold text-white">
              {t("pages.onboarding.quickTour.steps.uploads.fileName")}
            </p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/95">
            {t("pages.onboarding.quickTour.steps.uploads.prompt")}
          </span>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <p className="text-sm font-medium text-white/85">
            {t("pages.onboarding.quickTour.steps.uploads.responseHeading")}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/80">
            {t("pages.onboarding.quickTour.steps.uploads.answer")}
          </p>
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">
              {t("pages.onboarding.quickTour.steps.uploads.citationsLabel")}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {t("pages.onboarding.quickTour.steps.uploads.citation")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isSessionLoading) {
    return <LoadingState label={t("status.checkingOnboardingStatus")} fullScreen />;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-10">
        <div className={cn("w-full", step === "tour" && !isTourIntroStep ? "max-w-6xl" : "max-w-md")}>
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
                    onClick={startTour}
                  >
                    {t("actions.continue")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 w-full"
                    onClick={startTour}
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
                className={cn(
                  isTourIntroStep
                    ? "flex min-h-[320px] items-center justify-center"
                    : "relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#151821] text-white shadow-[0_24px_90px_rgba(0,0,0,0.45)]",
                )}
              >
                {!isTourIntroStep && !isTourReadyStep ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute left-5 top-5 z-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={goToPreviousTourStep}
                    aria-label={t("pages.onboarding.quickTour.backAria")}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                ) : null}

                {isTourIntroStep ? (
                  <div className="space-y-1 text-center">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: prefersReducedMotion
                          ? 0.12
                          : TOUR_INTRO_TIMINGS.firstSentenceDurationSeconds,
                        delay: prefersReducedMotion ? 0 : TOUR_INTRO_TIMINGS.firstSentenceDelaySeconds,
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
                          : TOUR_INTRO_TIMINGS.secondSentenceDurationSeconds,
                        delay: prefersReducedMotion ? 0 : TOUR_INTRO_TIMINGS.secondSentenceDelaySeconds,
                        ease: "easeOut",
                      }}
                      className="text-5xl font-semibold tracking-tight text-muted-foreground"
                    >
                      {t("pages.onboarding.tourLine2")}
                    </motion.p>
                  </div>
                ) : isTourReadyStep ? (
                  <div className="flex min-h-[560px] flex-col items-center justify-center px-8 text-center sm:px-12">
                    <div className="mb-6 rounded-full bg-white p-2 text-zinc-900">
                      <Check className="size-5" />
                    </div>
                    <h2 className="text-5xl font-semibold tracking-tight">
                      {t("pages.onboarding.quickTour.readyTitle")}
                    </h2>
                    <p className="mt-8 max-w-md text-base leading-8 text-white/80">
                      {t("pages.onboarding.quickTour.readyDescription")}
                    </p>
                    <Button
                      type="button"
                      className="mt-8 h-11 w-full max-w-xs rounded-full bg-white text-zinc-900 hover:bg-white/90"
                      onClick={() => void finalizeOnboarding()}
                      disabled={!canFinalizeOnboarding}
                    >
                      {updatePreferencesMutation.isPending
                        ? t("status.saving")
                        : t("actions.continue")}
                    </Button>
                    <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                      {t("pages.onboarding.quickTour.readyLegal")}
                    </p>
                  </div>
                ) : (
                  <div className="grid min-h-[560px] gap-8 p-6 md:grid-cols-[320px_minmax(0,1fr)] md:items-center md:px-10 md:py-10">
                    <div className="mx-auto w-full max-w-sm space-y-5 text-center md:text-left">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                        {t("pages.onboarding.quickTour.progress", {
                          current: tourStepIndex + 1,
                          total: TOUR_TOTAL_STEPS,
                        })}
                      </p>
                      <h2 className="text-5xl font-semibold tracking-tight">
                        {t(currentTourStep.titleKey)}
                      </h2>
                      <p className="text-base leading-8 text-white/80">
                        {t(currentTourStep.descriptionKey)}
                      </p>
                      <div className="space-y-3 pt-1">
                        <Button
                          type="button"
                          className="h-11 w-full rounded-full bg-white text-zinc-900 hover:bg-white/90"
                          onClick={goToNextTourStep}
                        >
                          {t("actions.next")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-11 w-full rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                          onClick={() => void finalizeOnboarding()}
                          disabled={!canFinalizeOnboarding}
                        >
                          {updatePreferencesMutation.isPending
                            ? t("status.saving")
                            : t("pages.onboarding.quickTour.skipTour")}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 shadow-[0_0_80px_rgba(255,255,255,0.08)] md:p-6">
                      {renderTourPreview(currentTourStep.key)}
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

