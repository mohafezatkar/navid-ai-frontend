"use client";

import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

type AuthFormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  children: ReactNode;
};

export function AuthForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  submitLabel,
  isSubmitting,
  children,
}: AuthFormProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {children}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
