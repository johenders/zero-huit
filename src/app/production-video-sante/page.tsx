import { headers } from "next/headers";

import { SectorJsonLd } from "@/components/landing/SectorJsonLd";
import { SectorLandingPage } from "@/components/landing/SectorLandingPage";
import { santeContent } from "@/content/secteurs/sante";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";

const defaultSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const content = santeContent[locale];

  return buildPageMetadata({
    locale,
    path: content.meta.path,
    title: content.meta.title,
    description: content.meta.description,
  });
}

export default async function ProductionVideoSantePage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const host = requestHeaders.get("host");
  const siteUrl = host ? `https://${host}` : defaultSiteUrl;
  const content = santeContent[locale];

  return (
    <>
      <SectorJsonLd content={content} siteUrl={siteUrl} />
      <SectorLandingPage content={content} locale={locale} sectorId="sante" />
    </>
  );
}
