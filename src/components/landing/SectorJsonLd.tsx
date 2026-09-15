import {
  isPublishable,
  isValidated,
  type SectorContent,
} from "@/content/secteurs/types";

/**
 * Données structurées d'une page sectorielle : Service, VideoObject, FAQPage
 * et BreadcrumbList. Organization et LocalBusiness sont déjà émis à l'échelle
 * du site par `SiteJsonLd`.
 *
 * Aucun contenu non validé ni aucune sentinelle n'est déclaré : un balisage
 * qui annonce une vidéo ou une réponse inexistante est une erreur signalée.
 */
export function SectorJsonLd({
  content,
  siteUrl,
  path,
}: {
  content: SectorContent;
  siteUrl: string;
  /** Chemin de la page courante — le dossier a le sien. */
  path?: string;
}) {
  const pageUrl = `${siteUrl}${path ?? content.meta.path}`;
  const isDossier = Boolean(path) && path !== content.meta.path;

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.meta.serviceName,
    description: content.meta.description,
    url: pageUrl,
    serviceType: content.meta.serviceName,
    areaServed: { "@type": "AdministrativeArea", name: "Québec, Canada" },
    provider: {
      "@type": "Organization",
      name: "Zéro huit",
      url: siteUrl,
    },
    /* Les huit services de la page, tels qu'ils y sont écrits. Rien d'inventé :
       ni prix, ni avis, ni zone desservie supplémentaire. */
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: content.services.title,
      itemListElement: content.services.items.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.title,
          description: item.body,
        },
      })),
    },
  };

  const videos = content.demo.videos
    .filter((video) => isPublishable(video.uid) && isPublishable(video.transcript))
    .map((video) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.posterAlt,
      thumbnailUrl: `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=2s&height=720`,
      contentUrl: `https://videodelivery.net/${video.uid}/manifest/video.m3u8`,
      embedUrl: `https://iframe.videodelivery.net/${video.uid}`,
      duration: `PT${Math.floor(video.durationSeconds / 60)}M${video.durationSeconds % 60}S`,
      transcript: video.transcript,
    }));

  const faqEntries = isDossier
    ? [...content.faq.items, ...content.objections.items].filter(
        (entry) => isValidated(entry) && isPublishable(entry.answer),
      )
    : [];

  const faqPage =
    faqEntries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntries.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }
      : null;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Zéro huit", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: content.meta.breadcrumbLabel,
        item: `${siteUrl}${content.meta.path}`,
      },
      ...(isDossier
        ? [{ "@type": "ListItem", position: 3, name: "Dossier", item: pageUrl }]
        : []),
    ],
  };

  const jsonLd = [service, ...videos, faqPage, breadcrumb].filter(Boolean);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
