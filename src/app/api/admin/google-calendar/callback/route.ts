import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeGoogleAuthorizationCode,
  getGoogleAccountEmail,
  getPrimaryGoogleCalendar,
  googleCalendarConfig,
  loadGoogleCalendarIntegration,
  saveGoogleCalendarIntegration,
} from "@/lib/googleCalendar";

const STATE_COOKIE = "google_calendar_oauth_state";

function redirectWithError(request: NextRequest, message: string) {
  const response = NextResponse.redirect(
    new URL(
      `/admin/rendez-vous?google=error&message=${encodeURIComponent(message)}`,
      request.url,
    ),
  );
  response.cookies.delete(STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) return redirectWithError(request, oauthError);
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError(request, "Invalid Google OAuth state");
  }

  try {
    const token = await exchangeGoogleAuthorizationCode(
      request.nextUrl.origin,
      code,
    );
    if (!token.access_token) {
      throw new Error("Google did not return an access token");
    }
    const accountEmail = await getGoogleAccountEmail(token.access_token);
    const expectedEmail = googleCalendarConfig().ownerEmail.toLowerCase();
    if (!accountEmail || accountEmail !== expectedEmail) {
      throw new Error(`Connect Google with ${expectedEmail}`);
    }
    const calendar = await getPrimaryGoogleCalendar(token.access_token);
    const existing = await loadGoogleCalendarIntegration();
    const refreshToken =
      token.refresh_token && token.refresh_token.trim()
        ? token.refresh_token
        : null;
    if (!refreshToken && !existing) {
      throw new Error(
        "Google did not return a refresh token. Revoke access and reconnect.",
      );
    }
    if (refreshToken) {
      await saveGoogleCalendarIntegration({
        accountEmail,
        calendarId: calendar.id || accountEmail,
        refreshToken,
        scope: token.scope ?? null,
      });
    }

    const response = NextResponse.redirect(
      new URL("/admin/rendez-vous?google=connected", request.url),
    );
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (error) {
    return redirectWithError(
      request,
      error instanceof Error ? error.message : "Google connection failed",
    );
  }
}
