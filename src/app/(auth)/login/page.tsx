"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { PasswordField } from "@/features/auth/components/password-field";
import { AuthStepTransition } from "@/features/auth/components/auth-step-transition";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/hooks/use-auth-mutations";
import { apiClient } from "@/lib/api";

const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginStep = "email" | "password";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<LoginStep>("email");
  const loginMutation = useLoginMutation();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
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

  const onContinue = async () => {
    const isValidEmail = await form.trigger("email");
    if (!isValidEmail) {
      return;
    }

    form.clearErrors("password");
    setStep("password");
  };

  const onSubmit = async (values: LoginValues) => {
    try {
      const session = await loginMutation.mutateAsync(values);
      const next = searchParams.get("next");
      if (session.onboardingComplete) {
        router.replace(next && next.startsWith("/") ? next : "/chat");
      } else {
        router.replace("/onboarding");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in.");
    }
  };

  return (
    <AuthCard
      title={step === "email" ? "Welcome back" : "Enter your password"}
      description={
        step === "email"
          ? "Sign in to continue your conversations."
          : `Signing in as ${emailText}.`
      }
      className="border-0 bg-transparent shadow-none backdrop-blur-none"
      headerClassName="items-center text-center pb-4"
      contentClassName="space-y-4"
      titleClassName="text-4xl font-semibold tracking-tight"
      descriptionClassName="text-base text-muted-foreground"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      }
      footerClassName="border-t-0 pt-0"
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
          </>
        ) : (
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
                disabled={loginMutation.isPending}
                onClick={() => setStep("email")}
              >
                Change
              </Button>
            </div>

            <AuthForm
              form={form}
              onSubmit={(values) => void onSubmit(values)}
              submitLabel="Sign in"
              isSubmitting={loginMutation.isPending}
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
                        autoComplete="current-password"
                        className="h-11 rounded-md border-border/70 bg-background shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AuthForm>

            <Button asChild variant="link" className="w-full text-sm">
              <Link href="/forgot-password">Forgot password?</Link>
            </Button>
          </>
        )}
      </AuthStepTransition>
    </AuthCard>
  );
}

