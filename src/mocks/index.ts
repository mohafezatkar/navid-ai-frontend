import { IS_MOCK_MODE } from "@/lib/api/config";

let started = false;

export async function startMocking(): Promise<void> {
  if (started || !IS_MOCK_MODE) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  const { worker } = await import("@/mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
  started = true;
}
