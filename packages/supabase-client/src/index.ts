import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export interface PublicSupabaseConfig {
  url?: string;
  anonKey?: string;
}

export interface ServiceRoleSupabaseConfig extends PublicSupabaseConfig {
  serviceRoleKey?: string;
}

export function createPublicSupabaseConfig(config: PublicSupabaseConfig) {
  return config;
}

export function createPublicEnvSummary(config: PublicSupabaseConfig): string {
  if (config.url && config.anonKey) {
    return "Configured";
  }

  return "Missing required public environment variables";
}

export function createClient(config: Required<PublicSupabaseConfig>) {
  return createBrowserClient(config.url, config.anonKey);
}

export function createAdminClient(config: Required<ServiceRoleSupabaseConfig>) {
  return createClientFromServiceRole(config.url, config.serviceRoleKey);
}

export function createClientFromServiceRole(url: string, serviceRoleKey: string) {
  return createSupabaseJsClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
