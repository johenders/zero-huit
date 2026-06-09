import { NextResponse } from "next/server";
import {
  googleCalendarConfigStatus,
  loadGoogleCalendarIntegration,
} from "@/lib/googleCalendar";

export async function GET() {
  try {
    const config = googleCalendarConfigStatus();
    const integration = config.configured
      ? await loadGoogleCalendarIntegration()
      : null;
    return NextResponse.json({
      ...config,
      connected: Boolean(integration),
      accountEmail: integration?.account_email ?? null,
      connectedAt: integration?.connected_at ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...googleCalendarConfigStatus(),
        connected: false,
        error: error instanceof Error ? error.message : "Status unavailable",
      },
      { status: 500 },
    );
  }
}
