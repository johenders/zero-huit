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

export function SiteShell({ children }: Props) {
  const pathname = usePathname();
  const normalizedPath = stripLocalePrefix(pathname).pathname;
  const minimalLandingPaths = [
    "/production-video-rive-sud-mtl",
    "/evenements",
    "/municipal",
    "/recrutement",
  ];
  const isHome = normalizedPath === "/";
  const isRequest =
    normalizedPath.startsWith("/request") ||
    normalizedPath.startsWith("/evenements/demande");
  const isMinimalHeader = minimalLandingPaths.includes(normalizedPath);
  const minimalCtaHref =
    normalizedPath === "/evenements"
      ? "/evenements/demande"
      : normalizedPath === "/municipal" || normalizedPath === "/recrutement"
        ? "/demande"
        : undefined;
  const hideFooter = minimalLandingPaths.includes(normalizedPath);
  const hideShell =
    normalizedPath === "/login" ||
    normalizedPath.startsWith("/auth/callback") ||
    normalizedPath.startsWith("/debug");
  const headerOffset = 120;

  if (isRequest || hideShell) return <>{children}</>;

  const shouldOffset = !isHome && !isMinimalHeader;

  return (
    <>
      {isMinimalHeader ? <MinimalHeader ctaHref={minimalCtaHref} /> : <HomeHeader />}
      <div style={shouldOffset ? { paddingTop: `${headerOffset}px` } : undefined}>
        {children}
      </div>
      {!hideFooter ? <SiteFooter /> : null}
      <CookieBanner />
    </>
  );
}
