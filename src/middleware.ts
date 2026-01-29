import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getFrRedirect } from "@/lib/i18n/shared";

function resolveLocale(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname === "/auth/callback") return true;
  if (pathname.startsWith("/debug")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/assets")) return true;
  if (pathname.startsWith("/images")) return true;
  return false;
}

function buildLoginRedirect(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.searchParams.set("next", next);
  if (reason) url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = resolveLocale(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  if (locale === "fr") {
    const redirectPath = getFrRedirect(pathname);
    if (redirectPath && redirectPath !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      return NextResponse.redirect(url);
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return buildLoginRedirect(request);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return buildLoginRedirect(request, "not_admin");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
