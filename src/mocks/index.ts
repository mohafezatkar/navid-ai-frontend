let started = false;

export async function startMocking(): Promise<void> {
  if (started || process.env.NEXT_PUBLIC_API_MODE === "live") {
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
