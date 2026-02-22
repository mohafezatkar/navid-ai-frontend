"use client";

import * as React from "react";
import {
  Mic,
  Plus,
  ArrowUp,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatInputTool = {
  id: string;
  label: string;
};

type ChatInputProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void | Promise<void>;
  onToolSelect?: (toolId: string) => void;
  onAttachClick?: () => void;
  onVoiceClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showTools?: boolean;
  showAttach?: boolean;
  showVoice?: boolean;
  tools?: ChatInputTool[];
  className?: string;
  inputClassName?: string;
};

const DEFAULT_TOOLS: ChatInputTool[] = [
  { id: "write", label: "Write" },
  { id: "research", label: "Research" },
  { id: "brainstorm", label: "Brainstorm" },
];

export function ChatInput({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onToolSelect,
  onAttachClick,
  onVoiceClick,
  placeholder = "Ask anything",
  disabled,
  showTools = false,
  showAttach = false,
  showVoice = false,
  tools = DEFAULT_TOOLS,
  className,
  inputClassName,
}: ChatInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const inputValue = isControlled ? value : internalValue;
  const canSubmit = inputValue.trim().length > 0 && !disabled && !isSubmitting;

  const setValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit?.(inputValue.trim());
      setValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full rounded-full border border-border bg-card px-2 py-1",
        className,
      )}
    >
      <div className="flex items-center gap-1 pl-3 pr-1">
        {showAttach ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={onAttachClick}
            disabled={disabled}
            aria-label="Attach file"
          >
            <Plus className="size-4" />
          </Button>
        ) : null}

        {showTools ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                disabled={disabled}
                aria-label="Open tools"
              >
                <Wrench className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {tools.map((tool) => (
                <DropdownMenuItem
                  key={tool.id}
                  onClick={() => onToolSelect?.(tool.id)}
                >
                  {tool.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Input
          value={inputValue}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "h-10 border-0 bg-card px-1 shadow-none focus-visible:ring-0 dark:bg-card text-lg font-light placeholder:text-lg placeholder:font-light",
            inputClassName,
          )}
        />

        <div className="flex items-center gap-1">
          {showVoice ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={onVoiceClick}
              disabled={disabled}
              aria-label="Voice input"
            >
              <Mic className="size-4" />
            </Button>
          ) : null}

          <Button
            type="submit"
            size="icon-sm"
            className="rounded-full"
            disabled={!canSubmit}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
