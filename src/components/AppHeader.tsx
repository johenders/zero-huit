"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const headerPosition = position === "absolute" ? "absolute left-0 right-0" : "sticky";
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`top-0 z-10 bg-transparent ${headerPosition}${
        headerClassName ? ` ${headerClassName}` : ""
      }`}
    >
      <div className="mx-auto flex w-full max-w-none items-center justify-between gap-4 px-4 py-3 lg:px-6">
        {logoSrc ? (
          <Link href="/" className="flex items-center">
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
            <Link href="/" className={navItemClass(isActive("/"))}>
              Accueil
            </Link>
            <Link href="/about" className={navItemClass(isActive("/about"))}>
              &#192; propos
            </Link>
            <Link href="/services" className={navItemClass(isActive("/services"))}>
              Services
            </Link>
            <Link href="/portfolio" className={navItemClass(isActive("/portfolio"))}>
              Nos projets
            </Link>
            <Link href="/contact" className={navItemClass(isActive("/contact"))}>
              Contact
            </Link>
          </nav>
          <nav className="flex items-center gap-2 sm:hidden">
            <Link href="/" className={navItemClass(isActive("/"))}>
              Accueil
            </Link>
            <Link href="/about" className={navItemClass(isActive("/about"))}>
              &#192; propos
            </Link>
            <Link href="/services" className={navItemClass(isActive("/services"))}>
              Services
            </Link>
            <Link href="/portfolio" className={navItemClass(isActive("/portfolio"))}>
              Projets
            </Link>
            <Link href="/contact" className={navItemClass(isActive("/contact"))}>
              Contact
            </Link>
          </nav>
          <Link
            href="/request"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 sm:flex"
          >
            Demande de soumission
          </Link>
          <Link
            href="/request"
            className="flex items-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 sm:hidden"
          >
            Soumission
          </Link>
        </div>
      </div>
    </header>
  );
}
