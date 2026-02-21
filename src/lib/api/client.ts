import type { ApiClient } from "@/lib/api/types";
import {
  forgotPassword,
  login,
  logout,
  me,
  resetPassword,
  signupCompleteProfile,
  signupResendCode,
  signupStart,
  signupVerifyCode,
  startGoogleOAuth,
} from "@/app/[locale]/(auth)/services/authService";
import {
  createConversation,
  deleteConversation,
  editUserMessage,
  getConversation,
  listConversations,
  listModels,
  regenerateLastAssistantMessage,
  sendMessage,
  stopStream,
  uploadAttachment,
} from "@/app/[locale]/(protected)/(workspace)/chat/services/chatService";
import {
  getPreferences,
  getProfile,
  updatePreferences,
  updateProfile,
} from "@/app/[locale]/(protected)/(workspace)/settings/services/settingsService";
import { listArticles } from "@/app/[locale]/(protected)/(workspace)/help/services/helpService";

export const apiClient: ApiClient = {
  auth: {
    me,
    login,
    signupStart,
    signupVerifyCode,
    signupResendCode,
    signupCompleteProfile,
    logout,
    forgotPassword,
    resetPassword,
    startGoogleOAuth,
  },
  chat: {
    listConversations,
    createConversation,
    getConversation,
    sendMessage,
    stopStream,
    editUserMessage,
    regenerateLastAssistantMessage,
    deleteConversation,
    uploadAttachment,
    listModels,
  },
  settings: {
    getProfile,
    updateProfile,
    getPreferences,
    updatePreferences,
  },
  help: {
    listArticles,
  },
};
