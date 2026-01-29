import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Zéro huit",
  description: "High-end video production agency on Montreal's South Shore.",
  applicationName: "Zéro huit",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/en",
  },
  icons: {
    icon: "/assets/zero_huit_favico.jpg",
    apple: "/assets/zero_huit_favico.jpg",
  },
  openGraph: {
    type: "website",
    url: "/en",
    title: "Zéro huit",
    description: "High-end video production agency on Montreal's South Shore.",
    siteName: "Zéro huit",
    locale: "en_CA",
  },
  twitter: {
    card: "summary",
    title: "Zéro huit",
    description: "High-end video production agency on Montreal's South Shore.",
  },
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
