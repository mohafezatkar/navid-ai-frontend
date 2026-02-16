export type Session = {
  userId: string;
  email: string;
  name: string | null;
  onboardingComplete: boolean;
};

export type Model = {
  id: string;
  label: string;
  capabilities: ("text" | "image" | "file")[];
};

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
  status: "queued" | "uploading" | "uploaded" | "failed";
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  createdAt: string;
  status?: "streaming" | "done" | "error";
};

export type Conversation = {
  id: string;
  title: string;
  modelId: string;
  updatedAt: string;
  preview: string;
};

export type StreamEvent =
  | { type: "token"; value: string }
  | { type: "message_done"; message: Message }
  | { type: "error"; error: string };

export interface ApiClient {
  auth: {
    me(): Promise<Session | null>;
    login(input: { email: string; password: string }): Promise<Session>;
    signup(input: {
      email: string;
      password: string;
    }): Promise<Session>;
    logout(): Promise<void>;
    forgotPassword(input: { email: string }): Promise<void>;
    resetPassword(input: { token: string; password: string }): Promise<void>;
    startGoogleOAuth(): void;
  };
  chat: {
    listConversations(): Promise<Conversation[]>;
    createConversation(input: { modelId: string }): Promise<Conversation>;
    getConversation(id: string): Promise<{
      conversation: Conversation;
      messages: Message[];
    }>;
    sendMessage(
      input: { conversationId: string; content: string; attachments: Attachment[] },
      onEvent: (e: StreamEvent) => void,
    ): Promise<void>;
    stopStream(conversationId: string): void;
    editUserMessage(input: {
      conversationId: string;
      messageId: string;
      content: string;
    }): Promise<void>;
    regenerateLastAssistantMessage(input: { conversationId: string }): Promise<void>;
    deleteConversation(id: string): Promise<void>;
    uploadAttachment(file: File): Promise<Attachment>;
    listModels(): Promise<Model[]>;
  };
  settings: {
    getProfile(): Promise<{ name: string; email: string }>;
    updateProfile(input: { name: string }): Promise<void>;
    getPreferences(): Promise<{ theme: "light" | "dark" | "system"; defaultModelId: string }>;
    updatePreferences(input: {
      theme: "light" | "dark" | "system";
      defaultModelId: string;
    }): Promise<void>;
  };
  help: {
    listArticles(): Promise<Array<{ id: string; title: string; body: string }>>;
  };
}
