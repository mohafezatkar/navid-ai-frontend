export const routes = {
  home: "/",
  marketing: {
    landing: {
      root: "/",
      sectionIds: {
        product: "product",
        features: "features",
        research: "research",
        pricing: "pricing",
      },
      sections: {
        product: "/#product",
        features: "/#features",
        research: "/#research",
        pricing: "/#pricing",
      },
    },
  },
  auth: {
    login: "/login",
    register: "/signup",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  workspace: {
    chat: "/chat",
    conversation: (id: string) => `/chat/${id}`,
    onboarding: "/onboarding",
    settings: {
      root: "/settings",
      profile: "/settings/profile",
      preferences: "/settings/preferences",
    },
    help: "/help",
  },
} as const;
