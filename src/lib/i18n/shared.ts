export type Locale = "fr" | "en";

export const defaultLocale: Locale = "fr";

const localizedRoutes = [
  { canonical: "/about", fr: "/a-propos", en: "/about" },
  { canonical: "/terms", fr: "/conditions-d-utilisation", en: "/terms" },
  { canonical: "/request", fr: "/demande", en: "/request" },
] as const;

function splitHref(href: string) {
  const match = href.match(/^([^?#]+)(.*)$/);
  return { path: match ? match[1] : href, suffix: match ? match[2] : "" };
}

function toCanonicalPath(pathname: string) {
  for (const route of localizedRoutes) {
    if (pathname === route.fr || pathname === route.en) return route.canonical;
  }
  return pathname;
}

function toLocalizedPath(pathname: string, locale: Locale) {
  for (const route of localizedRoutes) {
    if (pathname === route.canonical) {
      return locale === "fr" ? route.fr : route.en;
    }
    if (pathname === route.fr) {
      return locale === "fr" ? route.fr : route.en;
    }
    if (pathname === route.en) {
      return locale === "en" ? route.en : route.fr;
    }
  }
  if (locale === "en") return pathname;
  return pathname;
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

export function normalizeLocale(value?: string | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const next = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    return { locale: "en" as Locale, pathname: toCanonicalPath(next) };
  }
  return { locale: "fr" as Locale, pathname: toCanonicalPath(pathname) };
}

export function withLocaleHref(locale: Locale, href: string) {
  if (!href.startsWith("/")) return href;
  const { path, suffix } = splitHref(href);
  const localizedPath = toLocalizedPath(path, locale);
  if (locale !== "en") return `${localizedPath}${suffix}`;
  if (href === "/en" || href.startsWith("/en/")) return href;
  const blockedPrefixes = ["/api", "/admin", "/auth", "/login", "/_next", "/articles"];
  if (blockedPrefixes.some((prefix) => path.startsWith(prefix))) return href;
  if (localizedPath === "/") return "/en";
  return `/en${localizedPath}${suffix}`;
}

export function getFrRedirect(pathname: string) {
  for (const route of localizedRoutes) {
    if (pathname === route.canonical) return route.fr;
  }
  return null;
}
