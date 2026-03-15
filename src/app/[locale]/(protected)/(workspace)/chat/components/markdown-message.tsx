"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type MarkdownMessageProps = {
  content: string;
  className?: string;
};

function resolveLanguage(className: string | undefined): string {
  if (!className) {
    return "text";
  }

  const token = className
    .split(" ")
    .find((item) => item.startsWith("language-"));
  if (!token) {
    return "text";
  }

  return token.replace("language-", "") || "text";
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const t = useTranslations();
  const [copied, setCopied] = React.useState(false);
  const resetCopiedTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (resetCopiedTimeoutRef.current) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetCopiedTimeoutRef.current) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
      }
      resetCopiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        resetCopiedTimeoutRef.current = null;
      }, 2000);
    } catch {
      toast.error(t("errors.chat.failedCopyMessage"));
    }
  }, [code, t]);

  return (
    <div dir="ltr" className="my-4 overflow-hidden rounded-xl border border-border/70 bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/15 px-3 py-2 text-xs text-white/70">
        <span className="font-medium uppercase tracking-wide">{language}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label={t("actions.copy")}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="sr-only">{t("actions.copy")}</span>
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",
          padding: "0.95rem",
          fontSize: "0.86rem",
          lineHeight: 1.65,
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("min-w-0 text-inherit", className)}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap [&:not(:first-child)]:mt-4">{children}</p>,
          h1: ({ children }) => <h1 className="mt-5 text-2xl font-semibold first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-5 text-xl font-semibold first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-4 text-lg font-semibold first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-4 text-base font-semibold first:mt-0">{children}</h4>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-2 ps-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 ps-6">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-s-2 border-border ps-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline underline-offset-4 hover:opacity-90"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <table className="my-4 w-full border-collapse overflow-hidden rounded-lg border border-border text-sm">
              {children}
            </table>
          ),
          thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-medium">{children}</th>,
          td: ({ children }) => <td className="border border-border px-3 py-2 align-top">{children}</td>,
          hr: () => <hr className="my-5 border-border" />,
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const code = String(children).replace(/\n$/, "");
            const language = resolveLanguage(codeClassName);
            return <CodeBlock code={code} language={language} />;
          },
          pre: ({ children }) => <>{children}</>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
