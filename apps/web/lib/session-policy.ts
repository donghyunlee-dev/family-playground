import type { User } from "@supabase/supabase-js";

export const APP_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getSessionStartedAt(user: User) {
  const rawTimestamp = user.last_sign_in_at ?? user.created_at ?? null;

  if (!rawTimestamp) {
    return null;
  }

  const timestamp = Date.parse(rawTimestamp);

  return Number.isNaN(timestamp) ? null : timestamp;
}

export function isAppSessionExpired(user: User) {
  const startedAt = getSessionStartedAt(user);

  if (startedAt === null) {
    return false;
  }

  return Date.now() - startedAt >= APP_SESSION_MAX_AGE_MS;
}
