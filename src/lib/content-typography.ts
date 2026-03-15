export type ContentDirection = "ltr" | "rtl";

export type ContentTypography = {
  dir: ContentDirection;
  fontClassName: "font-content-ltr" | "font-content-rtl";
};

const RTL_SCRIPT_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/g;
const LTR_SCRIPT_REGEX = /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/g;
const THINK_BLOCK_REGEX = /<think>[\s\S]*?<\/think>/gi;
const CODE_FENCE_REGEX = /```[\s\S]*?```/g;
const INLINE_CODE_REGEX = /`[^`]*`/g;
const URL_REGEX = /https?:\/\/\S+/gi;
const HTML_TAG_REGEX = /<[^>]*>/g;

function countMatches(input: string, pattern: RegExp): number {
  return input.match(pattern)?.length ?? 0;
}

function toTypography(dir: ContentDirection): ContentTypography {
  return {
    dir,
    fontClassName: dir === "rtl" ? "font-content-rtl" : "font-content-ltr",
  };
}

function sanitizeForScriptDetection(input: string): string {
  return input
    .replace(THINK_BLOCK_REGEX, " ")
    .replace(CODE_FENCE_REGEX, " ")
    .replace(INLINE_CODE_REGEX, " ")
    .replace(URL_REGEX, " ")
    .replace(HTML_TAG_REGEX, " ");
}

function detectByFirstStrongCharacter(input: string): ContentDirection | null {
  for (const char of input) {
    if (RTL_SCRIPT_REGEX.test(char)) {
      RTL_SCRIPT_REGEX.lastIndex = 0;
      LTR_SCRIPT_REGEX.lastIndex = 0;
      return "rtl";
    }

    if (LTR_SCRIPT_REGEX.test(char)) {
      RTL_SCRIPT_REGEX.lastIndex = 0;
      LTR_SCRIPT_REGEX.lastIndex = 0;
      return "ltr";
    }
  }

  RTL_SCRIPT_REGEX.lastIndex = 0;
  LTR_SCRIPT_REGEX.lastIndex = 0;
  return null;
}

export function resolveContentTypography(
  content: string | null | undefined,
  fallbackDir: ContentDirection = "ltr",
): ContentTypography {
  const normalized = typeof content === "string" ? content.trim() : "";
  if (normalized.length === 0) {
    return toTypography(fallbackDir);
  }

  const sanitized = sanitizeForScriptDetection(normalized);
  const rtlCount = countMatches(sanitized, RTL_SCRIPT_REGEX);
  const ltrCount = countMatches(sanitized, LTR_SCRIPT_REGEX);

  if (rtlCount === 0 && ltrCount === 0) {
    return toTypography(fallbackDir);
  }

  if (rtlCount === 0) {
    return toTypography("ltr");
  }

  if (ltrCount === 0) {
    return toTypography("rtl");
  }

  if (rtlCount !== ltrCount) {
    return toTypography(rtlCount > ltrCount ? "rtl" : "ltr");
  }

  const firstStrongDir = detectByFirstStrongCharacter(sanitized);
  if (firstStrongDir) {
    return toTypography(firstStrongDir);
  }

  return toTypography(fallbackDir);
}
