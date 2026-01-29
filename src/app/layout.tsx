import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { I18nProvider } from "@/lib/i18n/client";
import { getUiDictionary } from "@/lib/i18n/server";
import { normalizeLocale } from "@/lib/i18n/shared";
import { headers } from "next/headers";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Zéro huit",
  description:
    "Agence de production vidéo haut de gamme sur la Rive-Sud de Montréal.",
  applicationName: "Zéro huit",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/zero_huit_favico.jpg",
    apple: "/zero_huit_favico.jpg",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Zéro huit",
    description:
      "Agence de production vidéo haut de gamme sur la Rive-Sud de Montréal.",
    siteName: "Zéro huit",
    locale: "fr_CA",
  },
  twitter: {
    card: "summary",
    title: "Zéro huit",
    description:
      "Agence de production vidéo haut de gamme sur la Rive-Sud de Montréal.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  return (
    <html lang={locale === "en" ? "en-CA" : "fr-CA"}>
      <body className="antialiased">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <SiteShell>{children}</SiteShell>
        </I18nProvider>
      </body>
    </html>
  );
}
