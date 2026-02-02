import { headers } from "next/headers";

const defaultSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function SiteJsonLd() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const siteUrl = host ? `https://${host}` : defaultSiteUrl;
  const logoUrl = `${siteUrl}/assets/zerohuit_blanc.png`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zéro huit",
    url: siteUrl,
    logo: logoUrl,
    sameAs: [
      "https://www.facebook.com/productionszerohuit",
      "https://www.instagram.com/zerohuit.ca",
      "https://www.linkedin.com/company/zerohuit/",
      "https://vimeo.com/zerohuit",
    ],
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Zéro huit",
    url: siteUrl,
    telephone: "+1-450-395-1777",
    image: logoUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "74 rue St-Laurent",
      addressLocality: "Beauharnois",
      addressRegion: "QC",
      postalCode: "J6N 1V6",
      addressCountry: "CA",
    },
  };

  const jsonLd = [organization, localBusiness];

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
