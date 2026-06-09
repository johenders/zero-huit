import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { buildGoogleAuthorizationUrl } from "@/lib/googleCalendar";

const STATE_COOKIE = "google_calendar_oauth_state";

export async function GET(request: NextRequest) {
  try {
    const state = randomBytes(24).toString("base64url");
    const response = NextResponse.redirect(
      buildGoogleAuthorizationUrl(request.nextUrl.origin, state),
    );
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google configuration error";
    return NextResponse.redirect(
      new URL(
        `/admin/rendez-vous?google=error&message=${encodeURIComponent(message)}`,
        request.url,
      ),
    );
  }
}
