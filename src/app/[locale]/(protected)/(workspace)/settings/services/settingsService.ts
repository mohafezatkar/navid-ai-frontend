import { fetchJson } from "@/lib/api/fetch-json";
import { preferencesSchema, profileSchema } from "@/lib/contracts";

export async function getProfile(): Promise<{ name: string; email: string }> {
  const data = await fetchJson<{ name: string; email: string }>("/settings/profile");
  return profileSchema.parse(data);
}

export async function updateProfile(input: { name: string }): Promise<void> {
  await fetchJson<void>("/settings/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getPreferences(): Promise<{
  theme: "light" | "dark" | "system";
  defaultModelId: string;
}> {
  const data = await fetchJson<{ theme: "light" | "dark" | "system"; defaultModelId: string }>(
    "/settings/preferences",
  );
  return preferencesSchema.parse(data);
}

export async function updatePreferences(input: {
  theme: "light" | "dark" | "system";
  defaultModelId: string;
}): Promise<void> {
  await fetchJson<void>("/settings/preferences", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
