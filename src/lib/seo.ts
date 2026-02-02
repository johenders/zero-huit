import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/shared";
import { withLocaleHref } from "@/lib/i18n/shared";

type BuildMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: BuildMetadataInput): Metadata {
  const canonical = withLocaleHref(locale, path);
  const fr = withLocaleHref("fr", path);
  const en = withLocaleHref("en", path);
  const ogLocale = locale === "en" ? "en_CA" : "fr_CA";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "fr-CA": fr,
        "en-CA": en,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: ogLocale,
    },
    twitter: {
      title,
      description,
    },
  };
}
