export type Locale = "fr" | "en";

export const defaultLocale: Locale = "fr";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

export function normalizeLocale(value?: string | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const next = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    return { locale: "en" as Locale, pathname: next };
  }
  return { locale: "fr" as Locale, pathname };
}

export function withLocaleHref(locale: Locale, href: string) {
  if (!href.startsWith("/")) return href;
  if (locale !== "en") return href;
  if (href === "/en" || href.startsWith("/en/")) return href;
  const blockedPrefixes = ["/api", "/admin", "/auth", "/login", "/_next", "/articles"];
  if (blockedPrefixes.some((prefix) => href.startsWith(prefix))) return href;
  return href === "/" ? "/en" : `/en${href}`;
}
