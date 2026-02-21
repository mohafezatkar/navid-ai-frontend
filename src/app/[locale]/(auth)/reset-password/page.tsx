"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/app/[locale]/(auth)/components/auth-card";
import { AuthForm } from "@/app/[locale]/(auth)/components/auth-form";
import { PasswordField } from "@/app/[locale]/(auth)/components/password-field";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useResetPasswordMutation } from "@/app/[locale]/(auth)/hooks/use-auth-mutations";
import { Link, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const mutation = useResetPasswordMutation();
  const resetPasswordSchema = z
    .object({
      password: z.string().min(8, t("auth.validation.passwordMin")),
      confirmPassword: z.string().min(8, t("auth.validation.passwordMin")),
    })
    .refine((input) => input.password === input.confirmPassword, {
      message: t("auth.validation.passwordsMustMatch"),
      path: ["confirmPassword"],
    });
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await mutation.mutateAsync({
        token,
        password: values.password,
      });
      toast.success(t("auth.toasts.passwordUpdated"));
      router.replace(routes.auth.login);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.auth.failedResetPassword"));
    }
  };

  if (!token) {
    return (
      <AuthCard
        title={t("auth.resetPassword.invalidLinkTitle")}
        description={t("auth.resetPassword.invalidLinkDescription")}
      >
        <Button asChild className="w-full">
          <Link href={routes.auth.forgotPassword}>{t("actions.requestNewResetLink")}</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth.resetPassword.title")}
      description={t("auth.resetPassword.description")}
      footer={
        <p className="text-sm text-muted-foreground">
          {t("auth.needFreshLink")}{" "}
          <Link
            href={routes.auth.forgotPassword}
            className="font-medium text-primary hover:underline"
          >
            {t("actions.requestAnother")}
          </Link>
        </p>
      }
    >
      <AuthForm
        form={form}
        onSubmit={(values) => void onSubmit(values)}
        submitLabel={t("actions.updatePassword")}
        isSubmitting={mutation.isPending}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.newPassword")}</FormLabel>
              <FormControl>
                <PasswordField {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.confirmPassword")}</FormLabel>
              <FormControl>
                <PasswordField {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AuthForm>
    </AuthCard>
  );
}


