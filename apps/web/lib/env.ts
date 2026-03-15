const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function getMissingPublicEnv(): string[] {
  return requiredKeys.filter((key) => !process.env[key]);
}
