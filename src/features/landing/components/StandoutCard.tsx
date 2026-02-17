import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type StandoutCardProps = {
  title: string
  description: string
  icon: LucideIcon
}

export function StandoutCard({ title, description, icon: Icon }: StandoutCardProps) {
  return (
    <Card className="h-full border-border/60 bg-card/70 backdrop-blur-sm">
      <CardHeader className="gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/70 bg-background/60">
          <Icon className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl leading-snug tracking-tight text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-base leading-7 text-muted-foreground">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
