import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const INTEGRATION_ID = "production-calendar";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

type CalendarIntegration = {
  id: string;
  account_email: string;
  calendar_id: string;
  refresh_token_encrypted: string;
  scope: string | null;
  connected_at: string;
  updated_at: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleCalendarInfo = {
  id?: string;
  summary?: string;
  timeZone?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
};

type GoogleFreeBusyResponse = {
  calendars?: Record<
    string,
    {
      busy?: Array<{ start?: string; end?: string }>;
      errors?: Array<{ reason?: string; message?: string }>;
    }
  >;
};

type GoogleEventResponse = {
  id?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
};

function googleMeetUrl(event: GoogleEventResponse) {
  return (
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video",
    )?.uri ||
    null
  );
}

export type BusyPeriod = {
  start: string;
  end: string;
};

export type CalendarEventInput = {
  id: string;
  start: string;
  end: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  budget?: string | null;
  referral?: string | null;
  locale: "fr" | "en";
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function encryptionKey() {
  const encoded = requiredEnv("GOOGLE_TOKEN_ENCRYPTION_KEY");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key",
    );
  }
  return key;
}

export function googleCalendarConfig() {
  return {
    clientId: requiredEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    ownerEmail:
      process.env.GOOGLE_CALENDAR_OWNER_EMAIL?.trim() || "lev@zerohuit.ca",
    defaultAttendee:
      process.env.GOOGLE_CALENDAR_DEFAULT_ATTENDEE?.trim() ||
      "info@zerohuit.ca",
    timeZone:
      process.env.GOOGLE_CALENDAR_TIMEZONE?.trim() || "America/Toronto",
  };
}

export function googleCalendarConfigStatus() {
  return {
    configured: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim() &&
        process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim(),
    ),
    ownerEmail:
      process.env.GOOGLE_CALENDAR_OWNER_EMAIL?.trim() || "lev@zerohuit.ca",
  };
}

export function encryptGoogleRefreshToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

function decryptGoogleRefreshToken(value: string) {
  const [version, ivValue, tagValue, encryptedValue] = value.split(":");
  if (
    version !== "v1" ||
    !ivValue ||
    !tagValue ||
    !encryptedValue
  ) {
    throw new Error("Invalid encrypted Google refresh token");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function googleOAuthRedirectUri(origin: string) {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    `${origin}/api/admin/google-calendar/callback`
  );
}

export function buildGoogleAuthorizationUrl(origin: string, state: string) {
  const config = googleCalendarConfig();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", googleOAuthRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("login_hint", config.ownerEmail);
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    [
      "openid",
      "email",
      "https://www.googleapis.com/auth/calendar",
    ].join(" "),
  );
  return url;
}

async function parseGoogleResponse<T>(response: Response) {
  const json = (await response.json()) as T & {
    error?: { message?: string } | string;
    error_description?: string;
  };
  if (!response.ok) {
    const message =
      typeof json.error === "string"
        ? json.error_description || json.error
        : json.error?.message || `Google API error (${response.status})`;
    throw new Error(message);
  }
  return json;
}

export async function exchangeGoogleAuthorizationCode(
  origin: string,
  code: string,
) {
  const config = googleCalendarConfig();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: googleOAuthRedirectUri(origin),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  return parseGoogleResponse<GoogleTokenResponse>(response);
}

async function refreshGoogleAccessToken(refreshTokenEncrypted: string) {
  const config = googleCalendarConfig();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: decryptGoogleRefreshToken(refreshTokenEncrypted),
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const token = await parseGoogleResponse<GoogleTokenResponse>(response);
  if (!token.access_token) {
    throw new Error("Google did not return an access token");
  }
  return token.access_token;
}

export async function getGoogleAccountEmail(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const userInfo = await parseGoogleResponse<GoogleUserInfo>(response);
  return userInfo.email?.trim().toLowerCase() || null;
}

export async function getPrimaryGoogleCalendar(accessToken: string) {
  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/primary`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  return parseGoogleResponse<GoogleCalendarInfo>(response);
}

export async function loadGoogleCalendarIntegration() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("calendar_integrations")
    .select("*")
    .eq("id", INTEGRATION_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CalendarIntegration | null) ?? null;
}

export async function saveGoogleCalendarIntegration(input: {
  accountEmail: string;
  calendarId: string;
  refreshToken: string;
  scope?: string | null;
}) {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.from("calendar_integrations").upsert({
    id: INTEGRATION_ID,
    account_email: input.accountEmail,
    calendar_id: input.calendarId,
    refresh_token_encrypted: encryptGoogleRefreshToken(input.refreshToken),
    scope: input.scope ?? null,
    connected_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function authorizedCalendarContext() {
  const integration = await loadGoogleCalendarIntegration();
  if (!integration) {
    throw new Error("Google Calendar is not connected");
  }
  return {
    integration,
    accessToken: await refreshGoogleAccessToken(
      integration.refresh_token_encrypted,
    ),
  };
}

export async function queryGoogleBusy(
  timeMin: string,
  timeMax: string,
): Promise<BusyPeriod[]> {
  const { integration, accessToken } = await authorizedCalendarContext();
  const response = await fetch(`${GOOGLE_CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: googleCalendarConfig().timeZone,
      items: [{ id: integration.calendar_id }],
    }),
    cache: "no-store",
  });
  const result = await parseGoogleResponse<GoogleFreeBusyResponse>(response);
  const calendar =
    result.calendars?.[integration.calendar_id] ??
    Object.values(result.calendars ?? {})[0];
  if (calendar?.errors?.length) {
    throw new Error(
      calendar.errors[0]?.message ||
        calendar.errors[0]?.reason ||
        "Unable to read Google Calendar availability",
    );
  }
  return (calendar?.busy ?? [])
    .filter((period) => period.start && period.end)
    .map((period) => ({
      start: period.start as string,
      end: period.end as string,
    }));
}

export async function createGoogleCalendarEvent(input: CalendarEventInput) {
  const config = googleCalendarConfig();
  const { integration, accessToken } = await authorizedCalendarContext();
  const attendeeEmails = Array.from(
    new Set(
      [input.email, config.defaultAttendee]
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
  const response = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(
      integration.calendar_id,
    )}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: `a0${input.id.replaceAll("-", "")}`,
        summary: `Rendez-vous découverte - ${input.company || input.name}`,
        description: [
          `Nom: ${input.name}`,
          `Entreprise: ${input.company}`,
          `Courriel: ${input.email}`,
          `Téléphone: ${input.phone || "—"}`,
          `Budget: ${input.budget || "—"}`,
          `Source: ${input.referral || "—"}`,
        ].join("\n"),
        start: {
          dateTime: input.start,
          timeZone: config.timeZone,
        },
        end: {
          dateTime: input.end,
          timeZone: config.timeZone,
        },
        attendees: attendeeEmails.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        extendedProperties: {
          private: {
            appointmentRequestId: input.id,
            source: "zerohuit.ca",
          },
        },
      }),
      cache: "no-store",
    },
  );
  let event = await parseGoogleResponse<GoogleEventResponse>(response);
  if (!event.id) throw new Error("Google did not return an event ID");
  const eventId = event.id;
  let meetUrl = googleMeetUrl(event);

  for (const delay of [250, 500, 1000]) {
    if (meetUrl) break;
    await new Promise((resolve) => setTimeout(resolve, delay));
    const eventResponse = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(
        integration.calendar_id,
      )}/events/${encodeURIComponent(eventId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );
    event = await parseGoogleResponse<GoogleEventResponse>(eventResponse);
    meetUrl = googleMeetUrl(event);
  }

  return {
    eventId,
    eventUrl: event.htmlLink ?? null,
    meetUrl,
  };
}
