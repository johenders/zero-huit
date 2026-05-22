"use client";

import { AppHeader } from "./AppHeader";
import zerohuitLogo from "../../assets/zerohuit_blanc.png";

type Props = {
  ctaHref?: string;
};

export function MinimalHeader({ ctaHref }: Props) {
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
