import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Taxonomy } from "@/lib/types";
import { buildFrenchDictionary, uiKeys } from "./ui";
import type { Locale } from "./shared";

export async function getUiDictionary(locale: Locale) {
  const base = buildFrenchDictionary();
  if (locale === "fr") return base;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return base;
  }

  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("translations")
    .select("key,value")
    .eq("locale", locale)
    .in("key", uiKeys);

  if (error || !data) return base;

  const overrides = Object.fromEntries(
    (data ?? []).map((row) => [row.key, row.value]) as Array<[string, string]>,
  );

  return { ...base, ...overrides };
}

export async function applyTaxonomyTranslations(
  taxonomies: Taxonomy[],
  locale: Locale,
) {
  if (locale === "fr") return taxonomies;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return taxonomies;
  }

  const ids = taxonomies.map((taxonomy) => taxonomy.id);
  if (ids.length === 0) return taxonomies;

  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("taxonomy_translations")
    .select("taxonomy_id,label")
    .eq("locale", locale)
    .in("taxonomy_id", ids);

  if (error || !data) return taxonomies;

  const labelById = new Map(
    (data ?? []).map((row) => [row.taxonomy_id, row.label]) as Array<[string, string]>,
  );

  return taxonomies.map((taxonomy) => {
    const translated = labelById.get(taxonomy.id);
    return translated ? { ...taxonomy, label: translated } : taxonomy;
  });
}
