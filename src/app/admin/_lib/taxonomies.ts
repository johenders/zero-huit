import type { Taxonomy, TaxonomyKind } from "@/lib/types";

export const keywordGroupKinds: TaxonomyKind[] = ["keyword", "style", "parametre"];

export const taxonomyGroups: { kind: TaxonomyKind; label: string; kinds: TaxonomyKind[] }[] = [
  { kind: "type", label: "Type de vidéo", kinds: ["type"] },
  { kind: "objectif", label: "Objectifs", kinds: ["objectif"] },
  { kind: "keyword", label: "Mots clés", kinds: keywordGroupKinds },
  { kind: "feel", label: "Feel", kinds: ["feel"] },
];

export function mergeTaxonomiesByKinds(
  groupedTaxonomies: Record<TaxonomyKind, Taxonomy[]>,
  kinds: TaxonomyKind[],
) {
  const merged = kinds.flatMap((kind) => groupedTaxonomies[kind]);
  return merged.sort((a, b) => a.label.localeCompare(b.label, "fr"));
}
