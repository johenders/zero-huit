import { headers } from "next/headers";

import { SectorDossierPage } from "@/components/landing/SectorDossierPage";
import { SectorJsonLd } from "@/components/landing/SectorJsonLd";
import { santeContent } from "@/content/secteurs/sante";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";

const defaultSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const DOSSIER_PATH = "/production-video-sante/dossier";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const content = santeContent[locale];

  return buildPageMetadata({
    locale,
    path: DOSSIER_PATH,
    title: `Dossier — ${content.meta.serviceName} | Zéro huit`,
    description: content.meta.description,
  });
}

export default async function DossierSantePage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const host = requestHeaders.get("host");
  const siteUrl = host ? `https://${host}` : defaultSiteUrl;
  const content = santeContent[locale];

  return (
    <>
      {/* Le balisage FAQPage vit ici : c'est ici que se trouvent les réponses. */}
      <SectorJsonLd content={content} siteUrl={siteUrl} path={DOSSIER_PATH} />
      <SectorDossierPage
        content={content}
        locale={locale}
        sectorId="sante"
        landingPath={content.meta.path}
      />
    </>
  );
}
