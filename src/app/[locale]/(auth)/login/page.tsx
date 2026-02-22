"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/app/[locale]/(auth)/components/auth-card";
import { AuthForm } from "@/app/[locale]/(auth)/components/auth-form";
import { OAuthButtons } from "@/app/[locale]/(auth)/components/oauth-buttons";
import { PasswordField } from "@/app/[locale]/(auth)/components/password-field";
import { AuthStepTransition } from "@/app/[locale]/(auth)/components/auth-step-transition";
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
import { useLoginMutation } from "@/app/[locale]/(auth)/hooks/use-auth-mutations";
import { Link, useRouter } from "@/i18n/navigation";
import { apiClient } from "@/lib/api";
import { routes } from "@/lib/routes";
type LoginValues = {
  email: string;
  password: string;
};
type LoginStep = "email" | "password";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("email");
  const loginMutation = useLoginMutation();
  const loginSchema = z.object({
    email: z.email(t("auth.validation.validEmail")),
    password: z.string().min(8, t("auth.validation.passwordMin")),
  });
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
      await loginMutation.mutateAsync(values);
      // TODO: Respect onboarding completion (and optional `next`) once onboarding checks are re-enabled.
      router.replace(routes.workspace.chat);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.auth.failedSignIn"));
    }
  };

  return (
    <AuthCard
      title={
        step === "email"
          ? t("auth.login.titleEmail")
          : t("auth.login.titlePassword")
      }
      description={
        step === "email"
          ? t("auth.login.descriptionEmail")
          : t("auth.login.descriptionPassword", { email: emailText })
      }
      className="border-0 bg-transparent shadow-none backdrop-blur-none"
      headerClassName="items-center text-center pb-4"
      contentClassName="space-y-4"
      titleClassName="text-4xl font-semibold tracking-tight"
      descriptionClassName="text-base text-muted-foreground"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.newHere")}{" "}
          <Link href={routes.auth.register} className="font-medium text-primary hover:underline">
            {t("actions.createAnAccount")}
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
          </>
        ) : (
          <>
            <div className="relative">
              <Input
                id="login-email-readonly"
                readOnly
                value={emailText}
                autoComplete="email"
                className="h-11 rounded-md border-border/70 bg-background pb-1 pt-5 pr-16 text-sm shadow-none"
              />
              <label
                htmlFor="login-email-readonly"
                className="pointer-events-none absolute left-3 top-1.5 text-xs text-muted-foreground"
              >
                {t("common.email")}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 -translate-y-1/2 px-2 text-xs"
                disabled={loginMutation.isPending}
                onClick={() => setStep("email")}
              >
                {t("actions.change")}
              </Button>
            </div>

            <AuthForm
              form={form}
              onSubmit={(values) => void onSubmit(values)}
              submitLabel={t("actions.signIn")}
              isSubmitting={loginMutation.isPending}
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
              <Link href={routes.auth.forgotPassword}>{t("auth.login.forgotPassword")}</Link>
            </Button>
          </>
        )}
      </AuthStepTransition>
    </AuthCard>
  );
}


