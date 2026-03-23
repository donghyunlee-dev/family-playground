import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/supabase/env";
import { getPublicSupabaseEnv } from "@/lib/supabase/public-env";
import type { Database } from "@/lib/supabase/types";

export function getServiceRoleEnv() {
  const { url, anonKey } = getPublicSupabaseEnv();
  const { SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey } = getRequiredEnv(
    process.env,
    ["SUPABASE_SERVICE_ROLE_KEY"] as const,
  );

  return { url, anonKey, serviceRoleKey };
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getServiceRoleEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { getPublicSupabaseEnv };
