"use client";

import { usePathname } from "next/navigation";

import { HomeHeader } from "@/components/HomeHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Props = {
  children: React.ReactNode;
};

export function SiteShell({ children }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isRequest = pathname.startsWith("/request");
  const hideShell =
    pathname === "/login" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/debug");
  const headerOffset = 120;

  if (isRequest || hideShell) return <>{children}</>;

  return (
    <>
      <HomeHeader />
      <div style={!isHome ? { paddingTop: `${headerOffset}px` } : undefined}>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
