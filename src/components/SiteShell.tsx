"use client";

import { usePathname } from "next/navigation";

import { HomeHeader } from "@/components/HomeHeader";
import { CookieBanner } from "@/components/CookieBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { stripLocalePrefix } from "@/lib/i18n/shared";

type Props = {
  children: React.ReactNode;
};

export function SiteShell({ children }: Props) {
  const pathname = usePathname();
  const normalizedPath = stripLocalePrefix(pathname).pathname;
  const isHome = normalizedPath === "/";
  const isRequest = normalizedPath.startsWith("/request");
  const hideShell =
    normalizedPath === "/login" ||
    normalizedPath.startsWith("/auth/callback") ||
    normalizedPath.startsWith("/debug");
  const headerOffset = 120;

  if (isRequest || hideShell) return <>{children}</>;

  return (
    <>
      <HomeHeader />
      <div style={!isHome ? { paddingTop: `${headerOffset}px` } : undefined}>
        {children}
      </div>
      <SiteFooter />
      <CookieBanner />
    </>
  );
}
