import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/public-env";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") ?? "/login";
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();
  const response = NextResponse.redirect(new URL(redirectTo, origin));
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

  return response;
}
