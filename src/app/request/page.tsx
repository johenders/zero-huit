import { RequestApp } from "@/components/RequestApp";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  return buildPageMetadata({
    locale,
    path: "/request",
    title: "Demande de soumission — Zéro huit",
    description:
      "Formulaire pour démarrer un projet vidéo et recevoir une réponse rapide et personnalisée.",
  });
}

export default function RequestPage() {
  return <RequestApp />;
}
