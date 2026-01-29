export type AnalyticsConsent = "granted" | "denied";

const CONSENT_STORAGE_KEY = "zh_consent_ga";
const CONSENT_COOKIE_KEY = "zh_consent_ga";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function readCookie(key: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === "granted" || stored === "denied") return stored;
  const cookie = readCookie(CONSENT_COOKIE_KEY);
  if (cookie === "granted" || cookie === "denied") return cookie;
  return null;
}

export function setAnalyticsConsent(value: AnalyticsConsent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(
    value,
  )}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("consent:ga", { detail: value }));
}

export function clearAnalyticsConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  document.cookie = `${CONSENT_COOKIE_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("consent:ga", { detail: null }));
}
