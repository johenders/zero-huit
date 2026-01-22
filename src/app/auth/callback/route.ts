import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    console.warn("[auth/callback] Missing ?code= param", {
      url: requestUrl.toString(),
      search: requestUrl.search,
      hash: requestUrl.hash,
    });
    return NextResponse.redirect(
      new URL(`/debug/auth?missing_code=1&next=${encodeURIComponent(next)}`, requestUrl.origin),
    );
  }

  const redirectUrl = new URL(next, requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
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
    auth: { flowType: "pkce" },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const cause =
      (error as unknown as { cause?: unknown }).cause ??
      (error as unknown as { __cause?: unknown }).__cause ??
      null;
    console.error("[auth/callback] exchangeCodeForSession failed", {
      message: error.message,
      cause: cause ? String(cause) : null,
      code,
      next,
    });
    return NextResponse.redirect(
      new URL(
        `/debug/auth?exchange_error=${encodeURIComponent(error.message)}&exchange_cause=${encodeURIComponent(
          cause ? String(cause) : "",
        )}&next=${encodeURIComponent(next)}`,
        requestUrl.origin,
      ),
    );
  }

  return response;
}
