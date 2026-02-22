import type {
  Attachment,
  Conversation,
  HelpArticle,
  Message,
  Model,
  Preferences,
  Profile,
  Session,
  SignupStartResponse,
  SignupVerifyCodeResponse,
  SignupVerification,
} from "@/lib/contracts";

export type {
  Attachment,
  Conversation,
  Message,
  Model,
  Preferences,
  Profile,
  Session,
  SignupStartResponse,
  SignupVerifyCodeResponse,
  SignupVerification,
};

export type StreamEvent =
  | { type: "token"; value: string }
  | { type: "message_done"; message: Message }
  | { type: "error"; error: string };

export interface ApiClient {
  auth: {
    me(): Promise<Session | null>;
    login(input: { email: string; password: string }): Promise<Session>;
    signupStart(input: {
      email: string;
      password: string;
    }): Promise<SignupStartResponse>;
    signupVerifyCode(input: {
      signupToken: string;
      code: string;
    }): Promise<SignupVerifyCodeResponse>;
    signupResendCode(input: { signupToken: string }): Promise<void>;
    signupCompleteProfile(input: {
      signupToken: string;
      fullName: string;
      birthDate: string;
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
  };
  settings: {
    getProfile(): Promise<Profile>;
    updateProfile(input: { name: string }): Promise<void>;
    getPreferences(): Promise<Preferences>;
    updatePreferences(input: {
      theme: "light" | "dark" | "system";
      defaultModelId: string;
    }): Promise<void>;
  };
  help: {
    listArticles(): Promise<HelpArticle[]>;
  };
}
