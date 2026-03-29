import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";
import { normalizeNextPath } from "@/lib/redirect-path";
import { isAppSessionExpired } from "@/lib/session-policy";

function buildSignedOutLoginHref(reason: string | null, next?: string | null) {
  const params = new URLSearchParams();

  if (reason) {
    params.set("error", reason);
  }

  if (next) {
    params.set("next", normalizeNextPath(next));
  }

  return `/auth/sign-out?redirectTo=${encodeURIComponent(
    `/login${params.toString() ? `?${params.toString()}` : ""}`,
  )}`;
}

export async function validateAuthenticatedAppUser(
  user: User,
  next?: string | null,
) {
  if (isAppSessionExpired(user)) {
    redirect(buildSignedOutLoginHref("session-expired", next));
  }

  const access = await ensureFamilyAccess(user);

  if (!access.allowed) {
    redirect(buildSignedOutLoginHref(access.reason, next));
  }

  return {
    user,
    profile: access.profile,
    member: access.member,
  };
}

export async function requireAppSession(next?: string | null) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return validateAuthenticatedAppUser(user, next);
}

export { buildSignedOutLoginHref };
