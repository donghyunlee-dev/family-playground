import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/public-env";
import { getRequestOrigin } from "@/lib/request-origin";
import { normalizeNextPath } from "@/lib/redirect-path";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const next = normalizeNextPath(searchParams.get("next"));
  const force = searchParams.get("force") === "1";
  const mode = searchParams.get("mode");
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();
  const response = NextResponse.next();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  if (force) {
    await supabase.auth.signOut();
  }

  const callbackPath =
    mode === "popup" ? "/auth/popup-callback" : "/auth/callback";
  const redirectTo = `${origin}${callbackPath}?next=${encodeURIComponent(next)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    const params = new URLSearchParams({
      error: "auth-callback-failed",
      detail: error?.message ?? "Google OAuth URL was not returned.",
    });

    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  const redirectResponse = NextResponse.redirect(data.url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
