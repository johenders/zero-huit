import { NextResponse, type NextRequest } from "next/server";
import {
  APPOINTMENT_BUFFER_MINUTES,
  APPOINTMENT_TIME_ZONE,
  appointmentEnd,
  isValidAppointmentSlot,
} from "@/lib/appointments";
import {
  createGoogleCalendarEvent,
  queryGoogleBusy,
} from "@/lib/googleCalendar";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

type AppointmentPayload = {
  locale?: string;
  start?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  budget?: string;
  referral?: string;
  website?: string;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitByIp = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (rateLimitByIp.get(ip) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitByIp.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitByIp.set(ip, timestamps);
  return false;
}

function overlaps(
  start: number,
  end: number,
  blockedStart: number,
  blockedEnd: number,
) {
  return start < blockedEnd && end > blockedStart;
}

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as AppointmentPayload;
  if (body.website?.trim()) {
    return NextResponse.json({ error: "spam" }, { status: 400 });
  }

  const startValue = body.start?.trim() ?? "";
  const name = body.name?.trim() ?? "";
  const company = body.company?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() || null;
  const budget = body.budget?.trim() || null;
  const referral = body.referral?.trim() || null;
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (
    !startValue ||
    !name ||
    !company ||
    !email ||
    !emailIsValid ||
    !budget ||
    !referral
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!isValidAppointmentSlot(startValue)) {
    return NextResponse.json({ error: "invalid_slot" }, { status: 400 });
  }

  const start = new Date(startValue);
  const end = appointmentEnd(startValue);
  const supabase = getSupabaseServiceRoleClient();
  let appointmentId: string | null = null;
  let createdEvent:
    | { eventId: string; eventUrl: string | null; meetUrl: string | null }
    | null = null;

  try {
    await supabase
      .from("appointment_requests")
      .update({
        status: "failed",
        error_message: "Pending reservation expired",
      })
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    const windowStart = new Date(
      start.getTime() - APPOINTMENT_BUFFER_MINUTES * 60 * 1000,
    );
    const windowEnd = new Date(
      end.getTime() + APPOINTMENT_BUFFER_MINUTES * 60 * 1000,
    );
    const busy = await queryGoogleBusy(
      windowStart.toISOString(),
      windowEnd.toISOString(),
    );
    const blocked = busy.some((period) =>
      overlaps(
        start.getTime(),
        end.getTime(),
        new Date(period.start).getTime() -
          APPOINTMENT_BUFFER_MINUTES * 60 * 1000,
        new Date(period.end).getTime() +
          APPOINTMENT_BUFFER_MINUTES * 60 * 1000,
      ),
    );
    if (blocked) {
      return NextResponse.json(
        { error: "slot_unavailable" },
        { status: 409 },
      );
    }

    const { data: appointment, error: insertError } = await supabase
      .from("appointment_requests")
      .insert({
        locale: body.locale === "en" ? "en" : "fr",
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        timezone: APPOINTMENT_TIME_ZONE,
        name,
        company,
        email,
        phone,
        budget,
        referral,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !appointment) {
      const conflict =
        insertError?.code === "23P01" || insertError?.code === "23505";
      return NextResponse.json(
        { error: conflict ? "slot_unavailable" : "db_error" },
        { status: conflict ? 409 : 500 },
      );
    }
    appointmentId = appointment.id;

    const event = await createGoogleCalendarEvent({
      id: appointment.id,
      start: start.toISOString(),
      end: end.toISOString(),
      name,
      company,
      email,
      phone,
      budget,
      referral,
      locale: body.locale === "en" ? "en" : "fr",
    });
    createdEvent = event;

    const { error: updateError } = await supabase
      .from("appointment_requests")
      .update({
        status: "confirmed",
        google_event_id: event.eventId,
        google_event_url: event.eventUrl,
        google_meet_url: event.meetUrl,
        error_message: null,
      })
      .eq("id", appointment.id);
    if (updateError) {
      console.error("[appointments] Google event created but DB update failed", {
        appointmentId: appointment.id,
        googleEventId: event.eventId,
        message: updateError.message,
      });
    }

    return NextResponse.json({
      ok: true,
      appointment: {
        id: appointment.id,
        start: start.toISOString(),
        end: end.toISOString(),
        meetUrl: event.meetUrl,
      },
    });
  } catch (error) {
    if (createdEvent && appointmentId) {
      return NextResponse.json({
        ok: true,
        appointment: {
          id: appointmentId,
          start: start.toISOString(),
          end: end.toISOString(),
          meetUrl: createdEvent.meetUrl,
        },
      });
    }
    if (appointmentId) {
      await supabase
        .from("appointment_requests")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "booking_failed",
        })
        .eq("id", appointmentId);
    }
    const message = error instanceof Error ? error.message : "booking_failed";
    const status = message.includes("not connected") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
