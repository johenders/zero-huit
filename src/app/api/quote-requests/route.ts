import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";

type QuoteRequestPayload = {
  locale?: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  website?: string;
  objectives?: string[];
  audiences?: string[];
  diffusions?: string[];
  description?: string;
  locations?: string;
  deliverables?: Record<string, unknown>;
  upsells?: string[];
  budget?: string;
  timeline?: string;
  referral?: string;
  referenceIds?: string[];
  projectId?: string | null;
  projectTitle?: string | null;
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

function normalizeArray(value?: string[]) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeText(value?: string) {
  return value?.trim() || null;
}

function buildEmailText(payload: QuoteRequestPayload) {
  const eventDate =
    typeof payload.deliverables?.eventDateLabel === "string"
      ? payload.deliverables.eventDateLabel
      : typeof payload.deliverables?.eventDate === "string"
        ? payload.deliverables.eventDate
        : "";
  const packageName =
    typeof payload.deliverables?.package === "string"
      ? payload.deliverables.package
      : "";
  const eventDuration =
    typeof payload.deliverables?.eventDurationLabel === "string"
      ? payload.deliverables.eventDurationLabel
      : typeof payload.deliverables?.eventDuration === "string"
        ? payload.deliverables.eventDuration
        : "";
  const isEventRequest = Boolean(eventDate || eventDuration || packageName);
  if (isEventRequest) {
    return [
      "Nouvelle demande événementielle",
      "",
      `Nom: ${payload.name}`,
      `Entreprise: ${payload.company}`,
      `Courriel: ${payload.email}`,
      `Téléphone: ${payload.phone || "—"}`,
      "",
      `Forfait: ${packageName || "—"}`,
      `Date de l'événement: ${eventDate || "—"}`,
      `Durée de l'événement: ${eventDuration || "—"}`,
      `Référence: ${payload.referral || "—"}`,
    ].join("\n");
  }

  const lines = [
    "Nouvelle demande de soumission",
    "",
    `Nom: ${payload.name}`,
    `Entreprise: ${payload.company}`,
    `Courriel: ${payload.email}`,
    `Téléphone: ${payload.phone || "—"}`,
    `Langue: ${payload.locale || "fr"}`,
    "",
    `Objectifs: ${(payload.objectives ?? []).join(", ") || "—"}`,
    `Audiences: ${(payload.audiences ?? []).join(", ") || "—"}`,
    `Diffusion: ${(payload.diffusions ?? []).join(", ") || "—"}`,
    `Budget: ${payload.budget || "—"}`,
    `Échéancier: ${payload.timeline || "—"}`,
    `Date de l'événement: ${eventDate || "—"}`,
    `Durée de l'événement: ${eventDuration || "—"}`,
    `Référence: ${payload.referral || "—"}`,
    `Forfait: ${packageName || "—"}`,
    "",
    `Description: ${payload.description || "—"}`,
    `Lieux: ${payload.locations || "—"}`,
  ];
  return lines.join("\n");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as QuoteRequestPayload;
  if (body.website?.trim()) {
    return NextResponse.json({ error: "spam" }, { status: 400 });
  }
  const name = body.name?.trim();
  const company = body.company?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!name || !company || !email) {
    return NextResponse.json(
      { error: "missing_fields" },
      { status: 400 },
    );
  }

  const record = {
    locale: body.locale === "en" ? "en" : "fr",
    name,
    company,
    email,
    phone: normalizeText(body.phone),
    objectives: normalizeArray(body.objectives),
    audiences: normalizeArray(body.audiences),
    diffusions: normalizeArray(body.diffusions),
    description: normalizeText(body.description),
    locations: normalizeText(body.locations),
    deliverables: body.deliverables ?? {},
    needs_subtitles: null,
    upsells: normalizeArray(body.upsells),
    budget: normalizeText(body.budget) ?? null,
    timeline: normalizeText(body.timeline) ?? null,
    referral: normalizeText(body.referral) ?? null,
    reference_ids: (body.referenceIds ?? []).filter(Boolean),
    project_id: body.projectId ?? null,
    project_title: body.projectTitle ?? null,
  };

  const supabase = getSupabasePublicServerClient();
  const { error } = await supabase.from("quote_requests").insert(record);

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM ?? "Zéro huit <no-reply@zerohuit.ca>";
  const to = process.env.RESEND_TO ?? "lev@zerohuit.ca";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to,
        subject: `Nouvelle demande de soumission — ${name}`,
        text: buildEmailText({ ...body, name, company, email }),
      });
    } catch {
      return NextResponse.json(
        { ok: true, email: "failed" },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
