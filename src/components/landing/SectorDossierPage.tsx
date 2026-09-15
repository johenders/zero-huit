import Link from "next/link";

import { DevChecklist } from "@/components/landing/DraftMode";
import {
  CaseStudyBlock,
  FaqBlock,
  FinalCtaBlock,
  InvestmentBlock,
  MechanicsBlock,
  ObjectionsBlock,
  ProblemBlock,
  SectorFooter,
  TeamBlock,
} from "@/components/landing/SectorBlocks";
import { buildSectorChecklist } from "@/components/landing/checklist";
import type { SectorContent } from "@/content/secteurs/types";
import { withLocaleHref, type Locale } from "@/lib/i18n/shared";

/**
 * Dossier sectoriel — version longue, imprimable.
 *
 * C'est la pièce que le champion interne fait circuler et que l'acheteur
 * public annexe à son évaluation. Optimisée pour l'impression (« Enregistrer
 * en PDF » du navigateur) : fond blanc, texte noir, sections non coupées.
 *
 * Elle reste une page web, donc son contenu — objections, FAQ, mécanique —
 * demeure indexable.
 */
export function SectorDossierPage({
  content,
  locale,
  sectorId,
  landingPath,
}: {
  content: SectorContent;
  locale: Locale;
  sectorId: string;
  landingPath: string;
}) {
  const ctaHref = withLocaleHref(locale, content.cta.href);

  return (
    <main className="zh-print font-['Montserrat'] bg-[#05070b] text-white">
      <DevChecklist items={buildSectorChecklist(content)} />

      <header className="border-b border-white/10 bg-[#05070b] px-6 pb-14 pt-32 lg:px-10 print:pt-8">
        <div className="mx-auto w-full max-w-7xl">
          <Link
            href={withLocaleHref(locale, landingPath)}
            className="text-xs font-bold uppercase tracking-[0.18em] text-[#5cc3d7] hover:text-[#8acd5f] print:hidden"
          >
            ← {content.meta.breadcrumbLabel}
          </Link>
          <h1 className="mt-6 max-w-4xl text-3xl font-black uppercase leading-tight sm:text-5xl">
            {content.meta.serviceName}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
            {content.meta.description}
          </p>
          <p className="mt-8 text-xs leading-5 text-zinc-500 print:mt-4">
            {"Dossier de référence — Zéro huit. Pour l'enregistrer en PDF : imprimer cette page et choisir « Enregistrer comme PDF »."}
          </p>
        </div>
      </header>

      <ProblemBlock content={content} />
      <MechanicsBlock content={content} />
      <CaseStudyBlock content={content} />
      <ObjectionsBlock content={content} />
      <InvestmentBlock content={content} />
      <TeamBlock content={content} />
      <FaqBlock content={content} />
      <FinalCtaBlock content={content} ctaHref={ctaHref} locale={locale} sectorId={sectorId} />
      <SectorFooter content={content} locale={locale} />
    </main>
  );
}
