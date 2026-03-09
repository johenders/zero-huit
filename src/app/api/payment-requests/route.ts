import { NextResponse } from "next/server";
import { Resend } from "resend";

type PaymentRequestPayload = {
  fullName: string;
  email: string;
  phone: string;
  fullAddress: string;
  projectName: string;
  shootDate: string;
  amount: string;
  interacQuestion: string;
  interacAnswer: string;
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

function normalize(value: string | undefined) {
  return value?.trim() ?? "";
}

function buildEmailText(payload: PaymentRequestPayload) {
  return [
    "Nouvelle demande de paiement",
    "",
    `Nom complet: ${payload.fullName}`,
    `Courriel: ${payload.email}`,
    `Telephone: ${payload.phone}`,
    `Adresse complete: ${payload.fullAddress}`,
    `Nom du projet: ${payload.projectName}`,
    `Date du tournage: ${payload.shootDate}`,
    `Montant: ${payload.amount}`,
    `Question pour virement Interac: ${payload.interacQuestion}`,
    `Reponse pour virement Interac: ${payload.interacAnswer}`,
  ].join("\n");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json()) as PaymentRequestPayload;
  if (normalize(body.website)) {
    return NextResponse.json({ error: "spam" }, { status: 400 });
  }

  const payload: PaymentRequestPayload = {
    fullName: normalize(body.fullName),
    email: normalize(body.email).toLowerCase(),
    phone: normalize(body.phone),
    fullAddress: normalize(body.fullAddress),
    projectName: normalize(body.projectName),
    shootDate: normalize(body.shootDate),
    amount: normalize(body.amount),
    interacQuestion: normalize(body.interacQuestion),
    interacAnswer: normalize(body.interacAnswer),
  };

  const requiredFields = [
    payload.fullName,
    payload.email,
    payload.phone,
    payload.fullAddress,
    payload.projectName,
    payload.shootDate,
    payload.amount,
    payload.interacQuestion,
    payload.interacAnswer,
  ];

  if (requiredFields.some((value) => !value)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "email_not_configured" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM ?? "Zéro huit <no-reply@zerohuit.ca>";

  try {
    await resend.emails.send({
      from,
      to: "info@zerohuit.ca",
      subject: `DEMANDE DE PAIEMENT - ${payload.projectName} - ${payload.fullName}`,
      text: buildEmailText(payload),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }
}
