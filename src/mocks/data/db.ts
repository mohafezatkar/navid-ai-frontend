import type {
  Attachment,
  Conversation,
  Message,
  Model,
  Session,
} from "@/lib/api/types";
import type { HelpArticle } from "@/lib/contracts/help";
import type { ThemeMode } from "@/lib/contracts/common";
import { MockHttpError } from "@/mocks/data/errors";

type MockUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  onboardingComplete: boolean;
  preferences: {
    theme: ThemeMode;
    defaultModelId: string;
  };
};

type MockDatabase = {
  users: MockUser[];
  models: Model[];
  conversationsByUserId: Record<string, Conversation[]>;
  messagesByConversationId: Record<string, Message[]>;
  helpArticles: HelpArticle[];
  currentUserId: string | null;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "User";
  const normalized = localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!normalized) {
    return "User";
  }
  return normalized
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function trimPreview(input: string): string {
  return input.trim().slice(0, 120);
}

function buildConversationTitle(input: string): string {
  const text = input.trim();
  if (!text) {
    return "New conversation";
  }
  return text.split(/\s+/).slice(0, 6).join(" ");
}

function buildAssistantReply(content: string, attachments: Attachment[]): string {
  const attachmentSummary =
    attachments.length > 0
      ? ` I also processed ${attachments.length} attachment${attachments.length > 1 ? "s" : ""}.`
      : "";

  return `Here is a structured response to: "${content.trim()}". I can refine this answer, generate alternatives, or break it into implementation steps.${attachmentSummary}`;
}

const initialModels: Model[] = [
  { id: "gpt-4.2", label: "GPT-4.2", capabilities: ["text", "file"] },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", capabilities: ["text", "image", "file"] },
  { id: "gpt-vision-pro", label: "Vision Pro", capabilities: ["text", "image"] },
];

const initialUsers: MockUser[] = [
  {
    id: "usr_demo",
    email: "demo@navid.ai",
    password: "password123",
    name: "Demo User",
    onboardingComplete: true,
    preferences: {
      theme: "system",
      defaultModelId: "gpt-4o-mini",
    },
  },
];

const demoConversation: Conversation = {
  id: "conv_demo",
  title: "Product launch checklist",
  modelId: "gpt-4o-mini",
  updatedAt: nowIso(),
  preview: "Help me draft a launch checklist for a new SaaS feature.",
};

const demoMessages: Message[] = [
  {
    id: "msg_demo_user_1",
    role: "user",
    content: "Help me draft a launch checklist for a new SaaS feature.",
    createdAt: nowIso(),
    status: "done",
  },
  {
    id: "msg_demo_assistant_1",
    role: "assistant",
    content:
      "Start with scope lock, release criteria, support readiness, instrumentation, rollback, and launch communication. I can provide a detailed task matrix next.",
    createdAt: nowIso(),
    status: "done",
  },
];

const db: MockDatabase = {
  users: initialUsers,
  models: initialModels,
  conversationsByUserId: {
    usr_demo: [demoConversation],
  },
  messagesByConversationId: {
    conv_demo: demoMessages,
  },
  helpArticles: [
    {
      id: "help_getting_started",
      title: "Getting Started",
      body: "Create a conversation, pick a model, then send your first prompt. Use attachments for image and document context.",
    },
    {
      id: "help_prompt_quality",
      title: "Writing Better Prompts",
      body: "Provide context, constraints, and output format. Iterate with follow-up instructions for better precision.",
    },
    {
      id: "help_attachments",
      title: "Using Attachments",
      body: "Supported files include images, PDF, and text docs. Keep files focused and under size limits for best performance.",
    },
  ],
  currentUserId: null,
};

function findUserByEmail(email: string): MockUser | undefined {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function toSession(user: MockUser): Session {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    onboardingComplete: user.onboardingComplete,
  };
}

function getCurrentUser(): MockUser | null {
  if (!db.currentUserId) {
    return null;
  }
  return db.users.find((user) => user.id === db.currentUserId) ?? null;
}

function requireCurrentUser(): MockUser {
  const user = getCurrentUser();
  if (!user) {
    throw new MockHttpError(401, "UNAUTHORIZED", "Authentication required.");
  }
  return user;
}

function ensureConversationOwnership(userId: string, conversationId: string): Conversation {
  const conversations = db.conversationsByUserId[userId] ?? [];
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) {
    throw new MockHttpError(404, "NOT_FOUND", "Conversation not found.");
  }
  return conversation;
}

function ensureMessages(conversationId: string): Message[] {
  if (!db.messagesByConversationId[conversationId]) {
    db.messagesByConversationId[conversationId] = [];
  }
  return db.messagesByConversationId[conversationId];
}

function bumpConversation(conversation: Conversation, preview: string, fallbackTitleSource: string) {
  conversation.updatedAt = nowIso();
  conversation.preview = trimPreview(preview);
  if (conversation.title === "New conversation") {
    conversation.title = buildConversationTitle(fallbackTitleSource);
  }
}

export const mockDb = {
  auth: {
    me(): Session | null {
      const user = getCurrentUser();
      return user ? toSession(user) : null;
    },
    login(input: { email: string; password: string }): Session {
      const user = findUserByEmail(input.email);
      if (!user || user.password !== input.password) {
        throw new MockHttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }
      db.currentUserId = user.id;
      return toSession(user);
    },
    signup(input: { email: string; password: string }): Session {
      if (findUserByEmail(input.email)) {
        throw new MockHttpError(409, "EMAIL_TAKEN", "Email already exists.");
      }

      const user: MockUser = {
        id: createId("usr"),
        email: input.email,
        password: input.password,
        name: nameFromEmail(input.email),
        onboardingComplete: false,
        preferences: {
          theme: "system",
          defaultModelId: db.models[0]?.id ?? "gpt-4.2",
        },
      };

      db.users.push(user);
      db.currentUserId = user.id;
      db.conversationsByUserId[user.id] = [];
      return toSession(user);
    },
    logout() {
      db.currentUserId = null;
    },
    forgotPassword() {
      return;
    },
    resetPassword(input: { token: string; password: string }) {
      if (!input.token || input.token.length < 8) {
        throw new MockHttpError(400, "INVALID_TOKEN", "Reset token is invalid.");
      }
      const user = getCurrentUser() ?? db.users[0];
      if (!user) {
        throw new MockHttpError(404, "NO_USER", "No account available for password reset.");
      }
      user.password = input.password;
    },
    googleStart(): Session {
      let user = findUserByEmail("google-user@navid.ai");
      if (!user) {
        user = {
          id: createId("usr"),
          email: "google-user@navid.ai",
          password: "oauth-managed",
          name: "Google User",
          onboardingComplete: true,
          preferences: {
            theme: "system",
            defaultModelId: db.models[0]?.id ?? "gpt-4.2",
          },
        };
        db.users.push(user);
        db.conversationsByUserId[user.id] = [];
      }

      db.currentUserId = user.id;
      return toSession(user);
    },
  },
  chat: {
    listModels(): Model[] {
      requireCurrentUser();
      return db.models;
    },
    listConversations(): Conversation[] {
      const user = requireCurrentUser();
      return [...(db.conversationsByUserId[user.id] ?? [])].sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : -1,
      );
    },
    createConversation(input: { modelId: string }): Conversation {
      const user = requireCurrentUser();
      const exists = db.models.some((model) => model.id === input.modelId);
      if (!exists) {
        throw new MockHttpError(400, "INVALID_MODEL", "Model does not exist.");
      }

      const conversation: Conversation = {
        id: createId("conv"),
        title: "New conversation",
        modelId: input.modelId,
        updatedAt: nowIso(),
        preview: "",
      };

      db.conversationsByUserId[user.id] = [
        conversation,
        ...(db.conversationsByUserId[user.id] ?? []),
      ];
      db.messagesByConversationId[conversation.id] = [];
      return conversation;
    },
    getConversation(conversationId: string): { conversation: Conversation; messages: Message[] } {
      const user = requireCurrentUser();
      const conversation = ensureConversationOwnership(user.id, conversationId);
      const messages = ensureMessages(conversationId);
      return { conversation, messages };
    },
    addMessage(input: {
      conversationId: string;
      content: string;
      attachments: Attachment[];
    }): Message {
      const user = requireCurrentUser();
      const conversation = ensureConversationOwnership(user.id, input.conversationId);
      const messages = ensureMessages(input.conversationId);

      const userMessage: Message = {
        id: createId("msg"),
        role: "user",
        content: input.content,
        attachments: input.attachments,
        createdAt: nowIso(),
        status: "done",
      };
      messages.push(userMessage);

      const assistantMessage: Message = {
        id: createId("msg"),
        role: "assistant",
        content: buildAssistantReply(input.content, input.attachments),
        createdAt: nowIso(),
        status: "done",
      };
      messages.push(assistantMessage);

      bumpConversation(conversation, input.content, input.content);
      return assistantMessage;
    },
    editUserMessage(input: {
      conversationId: string;
      messageId: string;
      content: string;
    }): void {
      const user = requireCurrentUser();
      const conversation = ensureConversationOwnership(user.id, input.conversationId);
      const messages = ensureMessages(input.conversationId);
      const targetIndex = messages.findIndex(
        (message) => message.id === input.messageId && message.role === "user",
      );

      if (targetIndex < 0) {
        throw new MockHttpError(404, "MESSAGE_NOT_FOUND", "User message not found.");
      }

      messages[targetIndex] = {
        ...messages[targetIndex],
        content: input.content,
      };

      const preservedMessages = messages.slice(0, targetIndex + 1);
      const regeneratedAssistant: Message = {
        id: createId("msg"),
        role: "assistant",
        content: buildAssistantReply(input.content, []),
        createdAt: nowIso(),
        status: "done",
      };

      db.messagesByConversationId[input.conversationId] = [
        ...preservedMessages,
        regeneratedAssistant,
      ];
      bumpConversation(conversation, input.content, input.content);
    },
    regenerateLastAssistantMessage(input: { conversationId: string }): void {
      const user = requireCurrentUser();
      const conversation = ensureConversationOwnership(user.id, input.conversationId);
      const messages = ensureMessages(input.conversationId);

      const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
      if (!lastUserMessage) {
        throw new MockHttpError(400, "NO_USER_MESSAGE", "No user message to regenerate from.");
      }

      const withoutLatestAssistant = [...messages];
      for (let index = withoutLatestAssistant.length - 1; index >= 0; index -= 1) {
        if (withoutLatestAssistant[index].role === "assistant") {
          withoutLatestAssistant.splice(index, 1);
          break;
        }
      }

      const regeneratedAssistant: Message = {
        id: createId("msg"),
        role: "assistant",
        content: `${buildAssistantReply(lastUserMessage.content, [])} (Regenerated)`,
        createdAt: nowIso(),
        status: "done",
      };

      db.messagesByConversationId[input.conversationId] = [
        ...withoutLatestAssistant,
        regeneratedAssistant,
      ];
      bumpConversation(conversation, regeneratedAssistant.content, lastUserMessage.content);
    },
    deleteConversation(conversationId: string): void {
      const user = requireCurrentUser();
      ensureConversationOwnership(user.id, conversationId);
      db.conversationsByUserId[user.id] = (db.conversationsByUserId[user.id] ?? []).filter(
        (conversation) => conversation.id !== conversationId,
      );
      delete db.messagesByConversationId[conversationId];
    },
    uploadAttachment(file: File): Attachment {
      requireCurrentUser();

      const attachmentId = createId("att");
      return {
        id: attachmentId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        status: "uploaded",
        url: `/mock/attachments/${attachmentId}/${encodeURIComponent(file.name)}`,
      };
    },
  },
  settings: {
    getProfile(): { name: string; email: string } {
      const user = requireCurrentUser();
      return {
        name: user.name,
        email: user.email,
      };
    },
    updateProfile(input: { name: string }): void {
      const user = requireCurrentUser();
      user.name = input.name;
    },
    getPreferences(): { theme: ThemeMode; defaultModelId: string } {
      const user = requireCurrentUser();
      return user.preferences;
    },
    updatePreferences(input: { theme: ThemeMode; defaultModelId: string }): void {
      const user = requireCurrentUser();
      user.preferences = {
        theme: input.theme,
        defaultModelId: input.defaultModelId,
      };

      if (!user.onboardingComplete) {
        user.onboardingComplete = true;
      }
    },
  },
  help: {
    listArticles(): HelpArticle[] {
      requireCurrentUser();
      return db.helpArticles;
    },
  },
};
