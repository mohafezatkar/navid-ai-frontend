import { z } from "zod";

export const themeModeSchema = z.enum(["light", "dark", "system"]);
export const idSchema = z.string().min(1);
export const isoDateStringSchema = z.string().min(1);

export type ThemeMode = z.infer<typeof themeModeSchema>;
