import { z } from "zod";

import { idSchema, themeModeSchema } from "@/lib/contracts/common";

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
});

export const updateProfileInputSchema = z.object({
  name: z.string().min(2),
});

export const preferencesSchema = z.object({
  theme: themeModeSchema,
  defaultModelId: idSchema,
});

export const updatePreferencesInputSchema = z.object({
  theme: themeModeSchema,
  defaultModelId: idSchema,
});

export type Profile = z.infer<typeof profileSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
