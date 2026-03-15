import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

const protectedPrefixes = ["/lobby", "/games", "/ranking", "/profile", "/room"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });
  const pathname = request.nextUrl.pathname;
  const { url, anonKey } = getPublicSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/lobby", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/login", "/lobby/:path*", "/games/:path*", "/ranking/:path*", "/profile/:path*", "/room/:path*"],
};
