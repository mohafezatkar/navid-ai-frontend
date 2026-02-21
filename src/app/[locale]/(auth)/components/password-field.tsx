"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = React.ComponentProps<typeof Input>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const t = useTranslations();

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        <span className="sr-only">{t("actions.togglePasswordVisibility")}</span>
      </Button>
    </div>
  );
}
