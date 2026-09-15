import {
  isPublishable,
  isValidated,
  type SectorContent,
} from "@/content/secteurs/types";

/** Ce qui bloque la mise en ligne, listé une seule fois en coin d'écran. */
export function buildSectorChecklist(content: SectorContent): string[] {
  const caseStudy = content.caseStudies.items[0];
  const caseStudyReady =
    isPublishable(caseStudy.organization) &&
    isPublishable(caseStudy.result.value) &&
    isPublishable(caseStudy.testimonial.name);

  return [
    content.hero.imageIsTemporary
      ? "Photo du hero : photo de plateau temporaire, à remplacer par une vraie captation du secteur"
      : null,
    ...content.demo.videos
      .filter(
        (v) =>
          !isPublishable(v.uid) ||
          !isPublishable(v.transcript) ||
          !isPublishable(v.captionsSrc),
      )
      .map((v) => `Vidéo « ${v.title} » : UID, transcription, sous-titres`),
    caseStudyReady ? null : "Étude de cas chiffrée + témoignage nominatif",
    content.investment.tiers.some((t) => !isPublishable(t.range))
      ? "Fourchettes de prix"
      : null,
    content.objections.items.some((o) => !isValidated(o))
      ? `Objections à valider : ${content.objections.items.filter((o) => !isValidated(o)).length}`
      : null,
    content.faq.items.some((f) => !isValidated(f))
      ? `Réponses de FAQ à valider : ${content.faq.items.filter((f) => !isValidated(f)).length}`
      : null,
    content.team.credentials.some((c) => !isPublishable(c.value))
      ? "Crédibilité : NEQ, année de fondation, taille d'équipe, assurances"
      : null,
    content.proof.logos.some((l) => l.authorization !== "documentee")
      ? `Autorisations de logo : ${content.proof.logos.filter((l) => l.authorization !== "documentee").length}`
      : null,
  ].filter((item): item is string => Boolean(item));
}
