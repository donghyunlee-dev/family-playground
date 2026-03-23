import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/public-env";
import { getRequestOrigin } from "@/lib/request-origin";
import { normalizeNextPath } from "@/lib/redirect-path";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);
  const { searchParams } = new URL(request.url);
  const next = normalizeNextPath(searchParams.get("next"));
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();
  const response = NextResponse.redirect(
    `${origin}/login?force=1&next=${encodeURIComponent(next)}`,
  );
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

  await supabase.auth.signOut();

  cookieStore
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-"))
    .forEach((cookie) => {
      response.cookies.set({
        name: cookie.name,
        value: "",
        path: "/",
        maxAge: 0,
      });
    });

  return response;
}
