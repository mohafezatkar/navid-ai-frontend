export const queryKeys = {
  auth: {
    session: () => ["auth", "session"] as const,
  },
  chat: {
    conversations: () => ["chat", "conversations"] as const,
    conversation: (conversationId: string) =>
      ["chat", "conversations", conversationId] as const,
  },
  settings: {
    profile: () => ["settings", "profile"] as const,
    preferences: () => ["settings", "preferences"] as const,
  },
  help: {
    articles: () => ["help", "articles"] as const,
  },
};
