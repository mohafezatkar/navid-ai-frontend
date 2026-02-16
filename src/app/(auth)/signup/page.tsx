"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import type { Session } from "@/lib/api/types";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { PasswordField } from "@/components/auth/password-field";
import { AuthStepTransition } from "@/components/auth/auth-step-transition";
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
import { useSignupMutation } from "@/features/auth/hooks/use-auth-mutations";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const signupSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;
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

const ageStepSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your full name."),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Enter your birth date as MM/DD/YYYY.")
    .refine((value) => parseBirthDate(value) !== null, {
      message: "Enter a valid birth date.",
    })
    .refine((value) => {
      const parsedDate = parseBirthDate(value);
      return parsedDate ? isAtLeast18YearsOld(parsedDate) : true;
    }, {
      message: "You must be at least 18 years old to use Navid AI.",
    }),
});

export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<SignupStep>("email");
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const signupMutation = useSignupMutation({ invalidateSessionOnSuccess: false });
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
  const isCodeComplete = verificationCode.length === 6;

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
      const session = await signupMutation.mutateAsync(values);
      setPendingSession(session);
      setVerificationCode("");
      setFullName("");
      setBirthDate("");
      setFullNameError(null);
      setBirthDateError(null);
      setStep("code");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign up.");
    }
  };

  useEffect(() => {
    if (step !== "code" || verificationCode.length !== 6) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStep("age");
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [step, verificationCode]);

  const onContinueWithCode = () => {
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }
    setStep("age");
  };

  const onResendCode = () => {
    toast.success(`A new code was sent to ${emailText}.`);
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

    if (!pendingSession) {
      toast.error("Session expired. Please register again.");
      setStep("email");
      return;
    }

    setIsCompletingProfile(true);

    try {
      await apiClient.settings.updateProfile({ name: normalizedName });
      const updatedSession: Session = {
        ...pendingSession,
        name: normalizedName,
      };
      queryClient.setQueryData(queryKeys.auth.session(), updatedSession);
      router.replace(updatedSession.onboardingComplete ? "/chat" : "/onboarding");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to continue. Please try again.",
      );
    } finally {
      setIsCompletingProfile(false);
    }
  };

  return (
    <AuthCard
      title={
        step === "email"
          ? "Create your account"
          : step === "password"
            ? "Set your password"
            : step === "code"
              ? "Check your inbox"
              : "Let's confirm your age"
      }
      description={
        step === "email"
          ? "Start with your email address."
          : step === "password"
            ? `Create a secure password for ${emailText}.`
            : step === "code"
              ? `Enter the 6-digit verification code we sent to ${emailText}.`
              : "This helps us personalize your experience and keep Navid AI safe."
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="email"
                          className="h-11 rounded-md border-border/70 bg-background shadow-none"
                          placeholder="name@example.com"
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
                  Continue with email
                </Button>
              </form>
            </Form>

            <div className="relative py-2 text-center text-sm text-muted-foreground">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border/70" />
              <span className="relative bg-background px-3">Or continue with</span>
            </div>

            <OAuthButtons
              onGoogleClick={() => apiClient.auth.startGoogleOAuth()}
              className="h-11 rounded-md border-border/70 bg-background shadow-none hover:bg-muted/40"
            />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : step === "password" ? (
          <>
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium">{emailText}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={signupMutation.isPending}
                onClick={() => setStep("email")}
              >
                Change
              </Button>
            </div>

            <AuthForm
              form={form}
              onSubmit={(values) => void onSubmit(values)}
              submitLabel="Create account"
              isSubmitting={signupMutation.isPending}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
              By continuing, you agree to the Terms of Service and Privacy Policy.
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : step === "code" ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="signup-verification-code">Code</Label>
              <Input
                id="signup-verification-code"
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-11 rounded-md border-border/70 bg-background text-center font-mono text-lg tracking-[0.3em] shadow-none"
              />
            </div>

            <Button
              type="button"
              className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={isCodeComplete}
              onClick={onContinueWithCode}
            >
              Continue
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full"
              onClick={onResendCode}
            >
              Resend email
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="signup-full-name">Full name</Label>
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
              <Label htmlFor="signup-birth-date">Birth date</Label>
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
                placeholder="MM/DD/YYYY"
                className="h-11 rounded-md border-border/70 bg-background shadow-none"
              />
              {birthDateError ? (
                <p className="text-sm text-destructive">{birthDateError}</p>
              ) : null}
            </div>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              By clicking &quot;Continue&quot;, you agree to our Terms and have read our
              Privacy Policy.
            </p>

            <Button
              type="button"
              className="h-11 w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={isCompletingProfile}
              onClick={() => {
                void onContinueAgeStep();
              }}
            >
              {isCompletingProfile ? <Loader2 className="size-4 animate-spin" /> : null}
              Continue
            </Button>
          </div>
        )}
      </AuthStepTransition>
    </AuthCard>
  );
}
