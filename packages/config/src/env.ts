import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    return value === "true";
  }

  return value;
}, z.boolean());

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("AAS Control Plane"),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: booleanFromEnv.default(true),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().min(1).default("aas-control-plane-web")
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv(input: Record<string, string | undefined> = process.env) {
  return envSchema.parse(input);
}

export function isSupabaseConfigured(input: Record<string, string | undefined> = process.env) {
  const env = readEnv(input);

  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isDemoAuthEnabled(input: Record<string, string | undefined> = process.env) {
  return readEnv(input).NEXT_PUBLIC_ENABLE_DEMO_AUTH;
}
