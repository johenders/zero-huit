import { DevChecklist } from "@/components/landing/DraftMode";
import {
  FinalCtaBlock,
  HeroBlock,
  HeroIssuesBlock,
  NarrativeBlock,
  PortfolioBlock,
  ProofMarqueeBlock,
  ProcessBlock,
  SectorFooter,
  ServicesBlock,
} from "@/components/landing/SectorBlocks";
import { buildSectorChecklist } from "@/components/landing/checklist";
import type { SectorContent } from "@/content/secteurs/types";
import { withLocaleHref, type Locale } from "@/lib/i18n/shared";

/**
 * Landing sectorielle publique.
 *
 * Suit le texte fourni par l'équipe, dans son ordre : le récit, l'offre, les
 * publics, l'approche, le processus, le rendement d'un tournage, puis la
 * conversation.
 *
 * Les exigences d'achat institutionnel — fourchettes, objections, étude de
 * cas chiffrée, crédibilité vérifiable — vivent dans le dossier imprimable,
 * à `<chemin>/dossier`.
 */
export function SectorLandingPage({
  content,
  locale,
  sectorId,
}: {
  content: SectorContent;
  locale: Locale;
  sectorId: string;
}) {
  const ctaHref = withLocaleHref(locale, content.cta.href);

  return (
    <main className="font-['Montserrat'] bg-[#05070b] text-white">
      <DevChecklist items={buildSectorChecklist(content)} />

      <HeroBlock
        content={content}
        ctaHref={ctaHref}
        locale={locale}
        sectorId={sectorId}
        variant="minimal"
      />
      <ProofMarqueeBlock content={content} />
      <HeroIssuesBlock content={content} ctaHref={ctaHref} sectorId={sectorId} />
      <NarrativeBlock content={content} />
      <PortfolioBlock content={content} locale={locale} sectorId={sectorId} />
      <ServicesBlock content={content} sectorId={sectorId} />
      <ProcessBlock content={content} />
      <FinalCtaBlock content={content} ctaHref={ctaHref} locale={locale} sectorId={sectorId} />
      <SectorFooter content={content} locale={locale} />
    </main>
  );
}
