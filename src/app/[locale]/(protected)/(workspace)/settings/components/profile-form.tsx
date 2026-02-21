"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
import { useUpdateProfileMutation } from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-profile-query";

type ProfileFormValues = {
  name: string;
};

type ProfileFormProps = {
  initialValues: {
    name: string;
    email: string;
  };
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const t = useTranslations();
  const mutation = useUpdateProfileMutation();
  const profileFormSchema = z.object({
    name: z.string().min(2, t("auth.validation.displayNameMin")),
  });
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: initialValues.name,
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    await mutation.mutateAsync(values);
    toast.success(t("status.profileUpdated"));
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.displayName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t("common.email")}</FormLabel>
          <FormControl>
            <Input value={initialValues.email} disabled />
          </FormControl>
        </FormItem>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("actions.saveChanges")}
        </Button>
      </form>
    </Form>
  );
}

