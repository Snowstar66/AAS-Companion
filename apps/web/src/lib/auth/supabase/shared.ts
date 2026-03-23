import { isSupabaseConfigured } from "@aas-companion/config";
import { getAppEnv } from "@/lib/env";

export function getSupabaseBrowserConfig() {
  const env = getAppEnv();

  if (!isSupabaseConfigured(process.env)) {
    return null;
  }

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}
