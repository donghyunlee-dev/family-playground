import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/supabase/public-env";
import { normalizeNextPath } from "@/lib/redirect-path";
import { isAppSessionExpired } from "@/lib/session-policy";
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
  const normalizedNext =
    pathname === "/login"
      ? normalizeNextPath(request.nextUrl.searchParams.get("next"))
      : normalizeNextPath(`${pathname}${request.nextUrl.search}`);

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (user && isAppSessionExpired(user)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "session-expired");
    loginUrl.searchParams.set("next", normalizedNext);

    const signOutUrl = new URL("/auth/sign-out", request.url);
    signOutUrl.searchParams.set(
      "redirectTo",
      `${loginUrl.pathname}${loginUrl.search}`,
    );

    return NextResponse.redirect(signOutUrl);
  }

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", normalizedNext);
    return NextResponse.redirect(loginUrl);
  }

  const forceLogin = request.nextUrl.searchParams.get("force") === "1";

  if (pathname === "/login" && user && !forceLogin) {
    const next = normalizeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/lobby/:path*", "/games/:path*", "/ranking/:path*", "/profile/:path*", "/room/:path*"],
};
