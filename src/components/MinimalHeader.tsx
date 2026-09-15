"use client";

import { useEffect, useState } from "react";

import { AppHeader } from "./AppHeader";
import zerohuitLogo from "../../assets/zerohuit_blanc.png";

type Props = {
  ctaHref?: string;
  /**
   * En-tête qui suit le défilement : transparent sur le hero, puis fond noir
   * translucide et flou dès qu'on quitte le haut de la page. Les landings qui
   * ne l'activent pas gardent l'en-tête absolu d'origine.
   */
  scrollAware?: boolean;
};

export function MinimalHeader({ ctaHref, scrollAware = false }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!scrollAware) return;

    const syncScrollState = () => setIsScrolled(window.scrollY > 24);
    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollState);
  }, [scrollAware]);

  if (!scrollAware) {
    return (
      <AppHeader
        sessionEmail={null}
        onSignOut={() => {}}
        onOpenAuth={() => {}}
        logoSrc={zerohuitLogo}
        logoAlt="Zerohuit"
        position="absolute"
        headerClassName="border-transparent bg-transparent backdrop-blur-0"
        variant="minimal"
        ctaHref={ctaHref}
      />
    );
  }

  return (
    <AppHeader
      sessionEmail={null}
      onSignOut={() => {}}
      onOpenAuth={() => {}}
      logoSrc={zerohuitLogo}
      logoAlt="Zerohuit"
      position="fixed"
      headerClassName={`border-b transition-colors duration-300 motion-reduce:transition-none ${
        isScrolled
          ? "border-white/10 bg-[#0c0c0c]/80 backdrop-blur-md"
          : "border-transparent bg-transparent backdrop-blur-0"
      }`}
      variant="minimal"
      ctaHref={ctaHref}
      /* Logo un cran plus grand et barre plus aérée que la variante d'origine. */
      logoClassName="h-14 w-auto max-w-[46vw] object-contain sm:h-28 sm:max-w-none"
      containerClassName="px-5 py-4 sm:px-6 lg:px-10"
      ctaClassName="inline-flex whitespace-nowrap px-5 py-2.5 text-[0.8rem] sm:px-6 sm:py-3 sm:text-sm"
    />
  );
}
