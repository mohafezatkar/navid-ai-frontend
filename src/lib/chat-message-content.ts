export type ParsedAssistantContent = {
  visibleContent: string;
  thoughtContent: string;
};

const THINK_BLOCK_REGEX = /<think>([\s\S]*?)<\/think>/gi;

export function parseAssistantContent(content: string): ParsedAssistantContent {
  if (!content) {
    return {
      visibleContent: "",
      thoughtContent: "",
    };
  }

  const thoughtSegments: string[] = [];
  const visibleContent = content
    .replace(THINK_BLOCK_REGEX, (_match, thought: string) => {
      const normalizedThought = thought.trim();
      if (normalizedThought.length > 0) {
        thoughtSegments.push(normalizedThought);
      }

      return "\n\n";
    })
    .trim();

  return {
    visibleContent,
    thoughtContent: thoughtSegments.join("\n\n"),
  };
}

