"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();
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
      toast.success("Password reset instructions sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset email.");
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email to receive reset instructions."
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      }
    >
      {sentToEmail ? (
        <div className="space-y-4 rounded-lg border border-border/70 bg-muted/40 p-4">
          <p className="text-sm">
            We sent a reset link to <span className="font-medium">{sentToEmail}</span>.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSentToEmail(null);
              form.reset();
            }}
          >
            Send another email
          </Button>
        </div>
      ) : (
        <AuthForm
          form={form}
          onSubmit={(values) => void onSubmit(values)}
          submitLabel="Send reset email"
          isSubmitting={forgotPasswordMutation.isPending}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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

