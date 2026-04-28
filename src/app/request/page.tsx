import { RequestApp } from "@/components/RequestApp";
import { headers } from "next/headers";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import { applyTaxonomyTranslations } from "@/lib/i18n/server";
import type { Taxonomy } from "@/lib/types";

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

export default async function RequestPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return <RequestApp />;
  }

  const supabase = getSupabasePublicServerClient();
  const { data } = await supabase
    .from("taxonomies")
    .select("id,kind,label")
    .eq("kind", "objectif")
    .order("label", { ascending: true });
  const taxonomies = await applyTaxonomyTranslations(
    (data ?? []) as Taxonomy[],
    locale,
  );

  return (
    <RequestApp
      initialObjectiveOptions={taxonomies.map((taxonomy) => ({
        id: taxonomy.id,
        label: taxonomy.label,
      }))}
    />
  );
}
