import { authHandlers } from "@/mocks/handlers/auth";
import { chatHandlers } from "@/mocks/handlers/chat";
import { helpHandlers } from "@/mocks/handlers/help";
import { settingsHandlers } from "@/mocks/handlers/settings";

export const handlers = [
  ...authHandlers,
  ...chatHandlers,
  ...settingsHandlers,
  ...helpHandlers,
];
