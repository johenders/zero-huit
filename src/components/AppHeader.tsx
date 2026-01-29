"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { stripLocalePrefix, withLocaleHref } from "@/lib/i18n/shared";

type Props = {
  sessionEmail: string | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  logoSrc?: StaticImageData;
  logoAlt?: string;
  position?: "sticky" | "absolute";
  headerClassName?: string;
};

function navItemClass(isActive: boolean) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-[0.18em] ${
    isActive ? "bg-white/10 text-white" : "text-zinc-200 hover:bg-white/5"
  }`;
}

export function AppHeader({
  sessionEmail,
  onSignOut,
  onOpenAuth,
  logoSrc,
  logoAlt = "Logo",
  position = "sticky",
  headerClassName,
}: Props) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerPosition = position === "absolute" ? "absolute left-0 right-0" : "sticky";
  const normalizedPath = stripLocalePrefix(pathname).pathname;
  const isActive = (path: string) => {
    if (path === "/") return normalizedPath === "/";
    return normalizedPath.startsWith(path);
  };

  return (
    <header
      className={`top-0 z-40 bg-transparent ${headerPosition}${
        headerClassName ? ` ${headerClassName}` : ""
      }`}
    >
      <div className="mx-auto flex w-full max-w-none items-center justify-between gap-4 px-4 py-3 lg:px-6">
        {logoSrc ? (
          <Link href={withLocaleHref(locale, "/")} className="flex items-center">
            <Image
              src={logoSrc}
              alt={logoAlt}
              className="h-24 w-auto"
              priority
            />
          </Link>
        ) : (
          <div className="text-[1.35rem] font-semibold leading-none tracking-wide">
            Approx
            <span
              aria-hidden
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent"
            >
              .
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-2 sm:flex">
            <Link href={withLocaleHref(locale, "/")} className={navItemClass(isActive("/"))}>
              {t("nav.home")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/about")}
              className={navItemClass(isActive("/about"))}
            >
              {t("nav.about")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/services")}
              className={navItemClass(isActive("/services"))}
            >
              {t("nav.services")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/portfolio")}
              className={navItemClass(isActive("/portfolio"))}
            >
              {t("nav.portfolio")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/contact")}
              className={navItemClass(isActive("/contact"))}
            >
              {t("nav.contact")}
            </Link>
          </nav>
          <button
            type="button"
            aria-label={
              isMobileMenuOpen ? t("nav.menu.close") : t("nav.menu.open")
            }
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 sm:hidden"
          >
            <span className="sr-only">{t("nav.menu.label")}</span>
            <div className="flex flex-col items-center gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-white" />
              <span className="h-0.5 w-4 rounded-full bg-white" />
              <span className="h-0.5 w-5 rounded-full bg-white" />
            </div>
          </button>
          <Link
            href={withLocaleHref(locale, "/request")}
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 sm:flex"
          >
            {t("nav.cta")}
          </Link>
        </div>
      </div>
      {isMobileMenuOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-zinc-950/95 px-4 py-4 shadow-lg shadow-black/40 backdrop-blur sm:hidden">
          <nav className="flex flex-col items-stretch gap-2">
            <Link
              href={withLocaleHref(locale, "/")}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${navItemClass(isActive("/"))} w-full justify-center`}
            >
              {t("nav.home")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/about")}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${navItemClass(isActive("/about"))} w-full justify-center`}
            >
              {t("nav.about")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/services")}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${navItemClass(isActive("/services"))} w-full justify-center`}
            >
              {t("nav.services")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/portfolio")}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${navItemClass(isActive("/portfolio"))} w-full justify-center`}
            >
              {t("nav.projects")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/contact")}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${navItemClass(isActive("/contact"))} w-full justify-center`}
            >
              {t("nav.contact")}
            </Link>
            <Link
              href={withLocaleHref(locale, "/request")}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20"
            >
              {t("nav.cta")}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
