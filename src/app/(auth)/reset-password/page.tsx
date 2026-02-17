"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { PasswordField } from "@/features/auth/components/password-field";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters."),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const mutation = useResetPasswordMutation();
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
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset password.");
    }
  };

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        description="This link is missing a reset token. Request a new one."
      >
        <Button asChild className="w-full">
          <Link href="/forgot-password">Request new reset link</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a strong password you have not used before."
      footer={
        <p className="text-sm text-muted-foreground">
          Need a fresh link?{" "}
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Request another
          </Link>
        </p>
      }
    >
      <AuthForm
        form={form}
        onSubmit={(values) => void onSubmit(values)}
        submitLabel="Update password"
        isSubmitting={mutation.isPending}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
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
              <FormLabel>Confirm password</FormLabel>
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

