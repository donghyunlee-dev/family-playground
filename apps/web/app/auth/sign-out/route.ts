import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();
  const response = NextResponse.redirect(`${origin}/login`);
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
