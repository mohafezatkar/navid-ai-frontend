"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LoadingButtonProps = Omit<React.ComponentProps<typeof Button>, "asChild"> & {
  loading?: boolean
  loadingText?: string
  spinnerClassName?: string
}

function LoadingButton({
  loading = false,
  loadingText,
  spinnerClassName,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className={cn("size-4 animate-spin", spinnerClassName)} /> : null}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

export { LoadingButton }
