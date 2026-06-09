import { NextResponse, type NextRequest } from "next/server";
import {
  APPOINTMENT_TIME_ZONE,
  availableAppointmentSlots,
  monthBounds,
} from "@/lib/appointments";
import { queryGoogleBusy } from "@/lib/googleCalendar";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? "";
  const bounds = monthBounds(month);
  if (!bounds) {
    return NextResponse.json({ error: "invalid_month" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    await supabase
      .from("appointment_requests")
      .update({
        status: "failed",
        error_message: "Pending reservation expired",
      })
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    const [{ data: reservations, error }, busyPeriods] = await Promise.all([
      supabase
        .from("appointment_requests")
        .select("starts_at,ends_at")
        .in("status", ["pending", "confirmed"])
        .gte("starts_at", bounds.start.toISOString())
        .lt("starts_at", bounds.end.toISOString()),
      queryGoogleBusy(bounds.start.toISOString(), bounds.end.toISOString()),
    ]);
    if (error) throw new Error(error.message);

    const slots = availableAppointmentSlots({
      monthValue: month,
      busyPeriods,
      reservedPeriods: (reservations ?? []).map((reservation) => ({
        start: reservation.starts_at,
        end: reservation.ends_at,
      })),
    });
    return NextResponse.json({
      month,
      timeZone: APPOINTMENT_TIME_ZONE,
      slots,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "availability_failed";
    const status = message.includes("not connected") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
