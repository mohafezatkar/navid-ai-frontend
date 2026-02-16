import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
};

export function AuthCard({
  title,
  description,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
}: AuthCardProps) {
  return (
    <Card className={cn("border-border/60 bg-card/80 shadow-lg backdrop-blur", className)}>
      <CardHeader className={cn("space-y-2", headerClassName)}>
        <CardTitle className={cn("text-2xl tracking-tight", titleClassName)}>{title}</CardTitle>
        <CardDescription className={descriptionClassName}>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-5", contentClassName)}>
        {children}
        {footer ? (
          <div className={cn("border-t border-border/60 pt-4", footerClassName)}>{footer}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
