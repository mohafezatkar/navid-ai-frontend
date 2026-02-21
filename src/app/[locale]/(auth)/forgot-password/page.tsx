"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/app/[locale]/(auth)/components/auth-card";
import { AuthForm } from "@/app/[locale]/(auth)/components/auth-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/app/[locale]/(auth)/hooks/use-auth-mutations";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const forgotPasswordSchema = z.object({
    email: z.email(t("auth.validation.validEmail")),
  });
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPasswordMutation.mutateAsync(values);
      setSentToEmail(values.email);
      toast.success(t("auth.toasts.passwordResetInstructionsSent"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.auth.failedSendResetEmail"));
    }
  };

  return (
    <AuthCard
      title={t("auth.forgotPassword.title")}
      description={t("auth.forgotPassword.description")}
      footer={
        <p className="text-sm text-muted-foreground">
          {t("auth.rememberedPassword")}{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            {t("actions.backToLogin")}
          </Link>
        </p>
      }
    >
      {sentToEmail ? (
        <div className="space-y-4 rounded-lg border border-border/70 bg-muted/40 p-4">
          <p className="text-sm">
            {t("auth.forgotPassword.sentMessage", { email: sentToEmail })}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSentToEmail(null);
              form.reset();
            }}
          >
            {t("actions.sendAnotherEmail")}
          </Button>
        </div>
      ) : (
        <AuthForm
          form={form}
          onSubmit={(values) => void onSubmit(values)}
          submitLabel={t("actions.sendResetEmail")}
          isSubmitting={forgotPasswordMutation.isPending}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.email")}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AuthForm>
      )}
    </AuthCard>
  );
}


