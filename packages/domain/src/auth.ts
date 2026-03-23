import { z } from "zod";
import { organizationContextSchema } from "./organization";

export const authModeSchema = z.enum(["demo", "supabase"]);

export const appSessionSchema = z.object({
  mode: authModeSchema,
  userId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  organization: organizationContextSchema
});

export type AuthMode = z.infer<typeof authModeSchema>;
export type AppSession = z.infer<typeof appSessionSchema>;
