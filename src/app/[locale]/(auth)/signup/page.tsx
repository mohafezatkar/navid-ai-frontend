"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { AuthCard } from "@/app/[locale]/(auth)/components/auth-card";
import { AuthForm } from "@/app/[locale]/(auth)/components/auth-form";
import { OAuthButtons } from "@/app/[locale]/(auth)/components/oauth-buttons";
import { PasswordField } from "@/app/[locale]/(auth)/components/password-field";
import { AuthStepTransition } from "@/app/[locale]/(auth)/components/auth-step-transition";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSignupCompleteProfileMutation,
  useSignupResendCodeMutation,
  useSignupStartMutation,
  useSignupVerifyCodeMutation,
} from "@/app/[locale]/(auth)/hooks/use-auth-mutations";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { routes } from "@/lib/routes";
type SignupValues = {
  email: string;
  password: string;
};
type SignupStep = "email" | "password" | "code" | "age";

function formatBirthDateInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseBirthDate(rawValue: string): Date | null {
  const match = rawValue.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || year < 1900) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatBirthDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isAtLeast18YearsOld(birthDate: Date): boolean {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 18;
}

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<SignupStep>("email");
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [verificationCodeLength, setVerificationCodeLength] = useState(6);
  const [verificationCode, setVerificationCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const signupStartMutation = useSignupStartMutation();
  const signupVerifyCodeMutation = useSignupVerifyCodeMutation();
  const signupResendCodeMutation = useSignupResendCodeMutation();
  const signupCompleteProfileMutation = useSignupCompleteProfileMutation({
    invalidateSessionOnSuccess: false,
  });
  const signupSchema = z.object({
    email: z.email(t("auth.validation.validEmail")),
    password: z.string().min(8, t("auth.validation.passwordMin")),
  });
  const ageStepSchema = z.object({
    fullName: z.string().trim().min(1, t("auth.validation.fullNameRequired")),
    birthDate: z
      .string()
      .trim()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, t("auth.validation.birthDateFormat"))
      .refine((value) => parseBirthDate(value) !== null, {
        message: t("auth.validation.birthDateValid"),
      })
      .refine((value) => {
        const parsedDate = parseBirthDate(value);
        return parsedDate ? isAtLeast18YearsOld(parsedDate) : true;
      }, {
        message: t("auth.validation.mustBeAdult"),
      }),
  });
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = useWatch({
    control: form.control,
    name: "email",
  });
  const emailText = email ?? "";
  const isCodeComplete = verificationCode.length === verificationCodeLength;

  const onContinue = async () => {
    const isValidEmail = await form.trigger("email");
    if (!isValidEmail) {
      return;
    }

    form.clearErrors("password");
    setStep("password");
  };

  const onSubmit = async (values: SignupValues) => {
    try {
      const signupAttempt = await signupStartMutation.mutateAsync(values);
      setSignupToken(signupAttempt.signupToken);
      setVerificationCodeLength(signupAttempt.verification.codeLength);
      setVerificationCode("");
      setFullName("");
      setBirthDate("");
      setFullNameError(null);
      setBirthDateError(null);
      setStep("code");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.auth.failedSignUp"));
    }
  };

  const onContinueWithCode = async () => {
    const trimmedCode = verificationCode.trim();
    const codePattern = new RegExp(`^\\d{${verificationCodeLength}}$`);
    if (!codePattern.test(trimmedCode)) {
      toast.error(
        t("auth.validation.verificationCodeDigits", {
          count: verificationCodeLength,
        }),
      );
      return;
    }

    if (!signupToken) {
      toast.error(t("errors.auth.signupSessionExpired"));
      setStep("email");
      return;
    }

    try {
      await signupVerifyCodeMutation.mutateAsync({
        signupToken,
        code: trimmedCode,
      });
      setStep("age");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errors.auth.failedVerifyCode");
      toast.error(message);

      if (
        error instanceof ApiError &&
        (error.code === "SIGNUP_TOKEN_EXPIRED" || error.code === "CODE_EXPIRED")
      ) {
        setStep("email");
        setSignupToken(null);
      }
    }
  };

  const onResendCode = async () => {
    if (!signupToken) {
      toast.error(t("errors.auth.signupSessionExpired"));
      setStep("email");
      return;
    }

    try {
      await signupResendCodeMutation.mutateAsync({
        signupToken,
      });
      toast.success(t("auth.toasts.newCodeSent", { email: emailText }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.auth.failedResendCode"));
    }
  };

  const onContinueAgeStep = async () => {
    setFullNameError(null);
    setBirthDateError(null);

    const parsed = ageStepSchema.safeParse({
      fullName,
      birthDate,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setFullNameError(fieldErrors.fullName?.[0] ?? null);
      setBirthDateError(fieldErrors.birthDate?.[0] ?? null);
      return;
    }

    const normalizedName = parsed.data.fullName;
    const parsedDate = parseBirthDate(parsed.data.birthDate);
    if (!parsedDate) {
      setBirthDateError(t("auth.validation.birthDateValid"));
      return;
    }

    if (!signupToken) {
      toast.error(t("errors.auth.sessionExpiredRegisterAgain"));
      setStep("email");
      return;
    }

    try {
      const session = await signupCompleteProfileMutation.mutateAsync({
        signupToken,
        fullName: normalizedName,
        birthDate: formatBirthDateForApi(parsedDate),
      });
      queryClient.setQueryData(queryKeys.auth.session(), session);
      // TODO: Restore onboarding-based redirect once onboarding checks are re-enabled.
      router.replace(routes.workspace.chat);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.auth.failedContinue"),
      );
    }
  };

  return (
    <AuthCard
      title={
        step === "email"
          ? t("auth.signup.titleEmail")
          : step === "password"
            ? t("auth.signup.titlePassword")
            : step === "code"
              ? t("auth.signup.titleCode")
              : t("auth.signup.titleAge")
      }
      description={
        step === "email"
          ? t("auth.signup.descriptionEmail")
          : step === "password"
            ? t("auth.signup.descriptionPassword", { email: emailText })
            : step === "code"
              ? t("auth.signup.descriptionCode", {
                  codeLength: verificationCodeLength,
                  email: emailText,
                })
              : t("auth.signup.descriptionAge")
      }
      className="border-0 bg-transparent shadow-none backdrop-blur-none"
      headerClassName="items-center text-center pb-4"
      contentClassName="space-y-4"
      titleClassName="text-4xl font-semibold tracking-tight"
      descriptionClassName="text-base text-muted-foreground"
    >
      <AuthStepTransition stepKey={step}>
        {step === "email" ? (
          <>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onContinue();
                }}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.email")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="email"
                          className="h-11 rounded-md border-border/70 bg-background shadow-none"
                          placeholder={t("common.nameExample")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
                  type="submit"
                >
                  {t("actions.continueWithEmail")}
                </Button>
              </form>
            </Form>

            <div className="relative py-2 text-center text-sm text-muted-foreground">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border/70" />
              <span className="relative bg-background px-3">{t("auth.orContinueWith")}</span>
            </div>

            <OAuthButtons
              onGoogleClick={() => apiClient.auth.startGoogleOAuth()}
              className="h-11 rounded-md border-border/70 bg-background shadow-none hover:bg-muted/40"
            />

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
                {t("actions.signIn")}
              </Link>
            </p>
          </>
        ) : step === "password" ? (
          <>
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("common.email")}</p>
                <p className="truncate text-sm font-medium">{emailText}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={signupStartMutation.isPending}
                onClick={() => setStep("email")}
              >
                {t("actions.change")}
              </Button>
            </div>

            <AuthForm
              form={form}
              onSubmit={(values) => void onSubmit(values)}
              submitLabel={t("actions.createAccount")}
              isSubmitting={signupStartMutation.isPending}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.password")}</FormLabel>
                    <FormControl>
                      <PasswordField
                        {...field}
                        autoComplete="new-password"
                        className="h-11 rounded-md border-border/70 bg-background shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AuthForm>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              {t("auth.termsPasswordStep")}
            </p>

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
                {t("actions.signIn")}
              </Link>
            </p>
          </>
        ) : step === "code" ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="signup-verification-code">{t("common.code")}</Label>
              <Input
                id="signup-verification-code"
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(
                    event.target.value.replace(/\D/g, "").slice(0, verificationCodeLength),
                  )
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-11 rounded-md border-border/70 bg-background text-center font-mono text-lg tracking-[0.3em] shadow-none"
              />
            </div>

            <Button
              type="button"
              className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={!isCodeComplete || signupVerifyCodeMutation.isPending}
              onClick={() => {
                void onContinueWithCode();
              }}
            >
              {signupVerifyCodeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("actions.continue")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full"
              disabled={signupResendCodeMutation.isPending || signupVerifyCodeMutation.isPending}
              onClick={() => {
                void onResendCode();
              }}
            >
              {signupResendCodeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("actions.resendEmail")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="signup-full-name">{t("common.fullName")}</Label>
              <Input
                id="signup-full-name"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  if (fullNameError) {
                    setFullNameError(null);
                  }
                }}
                autoComplete="name"
                className="h-11 rounded-md border-border/70 bg-background shadow-none"
              />
              {fullNameError ? (
                <p className="text-sm text-destructive">{fullNameError}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="signup-birth-date">{t("common.birthDate")}</Label>
              <Input
                id="signup-birth-date"
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                value={birthDate}
                onChange={(event) => {
                  setBirthDate(formatBirthDateInput(event.target.value));
                  if (birthDateError) {
                    setBirthDateError(null);
                  }
                }}
                placeholder={t("common.birthDatePlaceholder")}
                className="h-11 rounded-md border-border/70 bg-background shadow-none"
              />
              {birthDateError ? (
                <p className="text-sm text-destructive">{birthDateError}</p>
              ) : null}
            </div>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              {t("auth.termsAgeStep")}
            </p>

            <Button
              type="button"
              className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={signupCompleteProfileMutation.isPending}
              onClick={() => {
                void onContinueAgeStep();
              }}
            >
              {signupCompleteProfileMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {t("actions.continue")}
            </Button>
          </div>
        )}
      </AuthStepTransition>
    </AuthCard>
  );
}


