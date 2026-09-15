"use client";

import { usePathname } from "next/navigation";

import { HomeHeader } from "@/components/HomeHeader";
import { MinimalHeader } from "@/components/MinimalHeader";
import { CookieBanner } from "@/components/CookieBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { stripLocalePrefix } from "@/lib/i18n/shared";

type Props = {
  children: React.ReactNode;
};

/**
 * Landing pages sectorielles : en-tête minimal, aucun pied de page, hero
 * pleine hauteur sans décalage. La valeur est la destination du CTA de
 * l'en-tête (undefined = pas de CTA).
 *
 * Ajouter une nouvelle page sectorielle = ajouter une entrée ici.
 */
const minimalLandingCtaHrefs: Record<string, string | undefined> = {
  "/production-video-rive-sud-mtl": undefined,
  "/evenements": "/evenements/demande",
  "/municipal": "/demande",
  "/recrutement": "/demande",
  "/production-video-sante": "/demande",
  "/organismes": "/contact",
  "/production-video-sante/dossier": "/demande",
};

export function SiteShell({ children }: Props) {
  const pathname = usePathname();
  const normalizedPath = stripLocalePrefix(pathname).pathname;
  const isHome = normalizedPath === "/";
  const isRequest =
    normalizedPath.startsWith("/request") ||
    normalizedPath.startsWith("/evenements/demande");
  const isMinimalHeader = Object.hasOwn(minimalLandingCtaHrefs, normalizedPath);
  const minimalCtaHref = minimalLandingCtaHrefs[normalizedPath];
  /**
   * Les landings sectorielles se passent du pied de page. `/organismes` fait
   * exception : la page renvoie vers le contact, les coordonnées et les pages
   * légales du site, qui n'existent que là.
   */
  const hideFooter = isMinimalHeader && normalizedPath !== "/organismes";
  const hideShell =
    normalizedPath === "/login" ||
    normalizedPath.startsWith("/auth/callback") ||
    normalizedPath.startsWith("/debug");
  const headerOffset = 120;

  if (isRequest || hideShell) return <>{children}</>;

  const shouldOffset = !isHome && !isMinimalHeader;

  return (
    <>
      {normalizedPath === "/organismes" && (
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-5 focus:py-3 focus:text-black">
          Aller au contenu
        </a>
      )}
      {isMinimalHeader ? (
        <MinimalHeader
          ctaHref={minimalCtaHref}
          scrollAware={normalizedPath === "/organismes"}
        />
      ) : (
        <HomeHeader />
      )}
      <div style={shouldOffset ? { paddingTop: `${headerOffset}px` } : undefined}>
        {children}
      </div>
      {/* `/organismes` se termine déjà par son propre appel à l'action :
          la bande du pied de page ferait doublon. */}
      {!hideFooter ? (
        <SiteFooter showCta={normalizedPath !== "/organismes"} />
      ) : null}
      <CookieBanner />
    </>
  );
}
