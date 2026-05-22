import { headers } from "next/headers";
import { EventRequestApp } from "@/components/EventRequestApp";
import { getUiDictionary } from "@/lib/i18n/server";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/evenements/demande",
    title: dictionary["events.form.meta.title"] ?? "Réserver votre date — Zéro huit",
    description:
      dictionary["events.form.meta.description"] ??
      "Formulaire de réservation pour un recap événementiel avec Zéro huit.",
  });
}

export default function EventRequestPage() {
  return <EventRequestApp />;
}
