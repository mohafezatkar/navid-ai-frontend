import type { Metadata } from "next";

import { LandingPage } from "@/features/landing";

export const metadata: Metadata = {
  title: "Navid AI",
  description:
    "Navid AI is a ChatGPT-like workspace with secure authentication, multimodal chat, and a polished onboarding experience.",
};

export default function HomePage() {
  return <LandingPage />;
}


