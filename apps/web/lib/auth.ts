import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureFamilyAccess } from "@/lib/platform";
import { normalizeNextPath } from "@/lib/redirect-path";

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

export async function requireAppSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await ensureFamilyAccess(user);

  if (!access.allowed) {
    redirect(buildSignedOutLoginHref(access.reason));
  }

  return {
    user,
    profile: access.profile,
    member: access.member,
  };
}

export { buildSignedOutLoginHref };
