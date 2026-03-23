import { getRequiredEnv } from "@/lib/supabase/env";

export function getPublicSupabaseEnv() {
  const {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  } = getRequiredEnv(process.env, [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const);

  return { url, anonKey };
}
