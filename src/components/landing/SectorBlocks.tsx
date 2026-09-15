import Image from "next/image";
import Link from "next/link";

import { ApproachShowcase } from "@/components/landing/ApproachShowcase";
import { Draft, Pending, PREVIEW_DRAFTS } from "@/components/landing/DraftMode";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { PortfolioGrid } from "@/components/landing/PortfolioGrid";
import { ProcessTimeline } from "@/components/landing/ProcessTimeline";
import { ProjectComposer } from "@/components/landing/ProjectComposer";
import { SectorIcon } from "@/components/landing/SectorIcons";
import { ServicesShowcase } from "@/components/landing/ServicesShowcase";
import { VideoFacade } from "@/components/landing/VideoFacade";
import {
  isPublishable,
  isValidated,
  type SectorContent,
  type SectorVideo,
} from "@/content/secteurs/types";
import { withLocaleHref, type Locale } from "@/lib/i18n/shared";

/**
 * Blocs partagés par les deux pages d'un secteur :
 *
 *   · la landing courte  (`SectorLandingPage`)  — vitrine
 *   · le dossier complet (`SectorDossierPage`)  — référence imprimable
 *
 * Langage visuel repris de /evenements : titre très large, carte vitrée dans
 * le hero, prix en gros dégradé, en-têtes centrés, cartes à bordure dégradée.
 */

export const ACCENT = "bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f]";
const PRICE_TEXT =
  "bg-gradient-to-r from-[#26b7df] to-[#8acd5f] bg-clip-text font-black leading-none text-transparent";
/** Bordure en dégradé : signature visuelle des cartes de contenu. */
const GRADIENT_BORDER =
  "rounded-lg bg-gradient-to-b from-[#5cc3d7] via-white/25 to-[#8acd5f] p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]";

/**
 * Ponctuation finale en dégradé — signature de marque.
 * Un titre qui se termine par « ? » ou « ! » garde son signe : on le colore,
 * on ne lui ajoute pas un point par-dessus.
 */
export function GradientPunct({ text }: { text: string }) {
  const match = text.match(/[.?!]$/);
  const punctuation = match ? match[0] : ".";
  return (
    <>
      {text.replace(/[.?!]$/, "")}
      {/*
        `bg-clip-text` ne peint que la boîte de fond du span. Les titres portent
        un interlettrage négatif, qui rétrécit cette boîte sous l'encre du
        glyphe : le point apparaissait coupé à droite. On annule l'interlettrage
        sur la ponctuation et on élargit d'un cheveu.
      */}
      <span
        className={`${ACCENT} inline-block bg-clip-text pr-[0.04em] tracking-normal text-transparent`}
      >
        {punctuation}
      </span>
    </>
  );
}

export function H2({ children }: { children: string }) {
  return (
    <h2 className="text-3xl font-extrabold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl">
      <GradientPunct text={children} />
    </h2>
  );
}

/** En-tête de section centré, comme sur /evenements. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <header
      className={
        centered
          ? "zh-reveal mx-auto max-w-3xl text-center"
          : "zh-reveal max-w-2xl"
      }
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5cc3d7] sm:text-sm">
        {eyebrow}
      </p>
      <div className="mt-4">
        <H2>{title}</H2>
      </div>
      {lead ? (
        <p
          className={`mt-6 text-base leading-8 text-zinc-300 sm:text-lg ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}

export function Section({
  children,
  muted = false,
  compact = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  /** Section courte : peu de contenu, donc moins de respiration verticale. */
  compact?: boolean;
}) {
  return (
    <section
      className={`relative isolate overflow-hidden ${
        compact ? "py-16 sm:py-24" : "py-20 sm:py-28"
      } ${muted ? "border-y border-white/10 bg-[#090f14]" : "bg-[#05070b]"}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 opacity-70 ${
          muted
            ? "bg-[radial-gradient(circle_at_82%_18%,rgba(92,195,215,0.10),transparent_27%),radial-gradient(circle_at_12%_86%,rgba(138,205,95,0.07),transparent_25%)]"
            : "bg-[radial-gradient(circle_at_8%_15%,rgba(92,195,215,0.06),transparent_24%)]"
        }`}
      />
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        {children}
      </div>
    </section>
  );
}

export function isVideoPublishable(video: SectorVideo) {
  return (
    isPublishable(video.uid) &&
    isPublishable(video.transcript) &&
    isPublishable(video.captionsSrc)
  );
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/** Règle : un seul intitulé d'action, répété à l'identique sur toute la page. */
export function PrimaryCta({
  href,
  label,
  sectorId,
  position,
  size = "default",
}: {
  href: string;
  label: string;
  sectorId: string;
  position: string;
  size?: "default" | "large";
}) {
  return (
    <Link
      href={href}
      data-analytics-event="cta_primary_click"
      data-analytics-sector={sectorId}
      data-analytics-position={position}
      className={`inline-flex items-center justify-center rounded-full ${ACCENT} ${
        size === "large" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
      } font-black uppercase text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5cc3d7] print:hidden`}
    >
      {label}
    </Link>
  );
}

/** Voie de sortie basse pression : ici, le dossier sectoriel. */
export function LowPressureLink({
  content,
  locale,
  sectorId,
}: {
  content: SectorContent;
  locale: Locale;
  sectorId: string;
}) {
  const { lowPressureCta } = content;
  const ready = isPublishable(lowPressureCta.href);
  if (!ready && !PREVIEW_DRAFTS) return null;

  const href = ready
    ? lowPressureCta.href.startsWith("/")
      ? withLocaleHref(locale, lowPressureCta.href)
      : lowPressureCta.href
    : "#";

  return (
    <Link
      href={href}
      data-analytics-event="low_pressure_click"
      data-analytics-sector={sectorId}
      className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5cc3d7] print:hidden"
    >
      {lowPressureCta.label}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · Hero — titre très large + carte d'offre vitrée                  */
/* ------------------------------------------------------------------ */

export function HeroBlock({
  content,
  ctaHref,
  locale,
  sectorId,
  variant = "card",
}: {
  content: SectorContent;
  ctaHref: string;
  locale: Locale;
  sectorId: string;
  /**
   * `card`    — hero argumenté : titre, promesse, signaux, carte d'offre.
   * `minimal` — hero de galerie : l'image en plein cadre, le titre, l'action.
   *             Ce que le hero ne dit plus est repris par `HeroIssuesBlock`.
   */
  variant?: "card" | "minimal";
}) {
  const { hero, heroCard } = content;
  /** Une, deux ou trois lignes : seules celles qui sont écrites sont rendues. */
  const titleLines = [hero.titleLine1, hero.titleLine2, hero.titleLine3].filter(
    (line): line is string => Boolean(line),
  );

  if (variant === "minimal") {
    return (
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Voile vertical : le titre reste lisible, l'image reste visible. */}
        {/* Voile doublé : 0,34 devient 0,68 au milieu ; les deux extrémités
            montent à 0,90 plutôt qu'à 1, sinon l'image disparaîtrait. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,11,0.90)_0%,rgba(3,7,11,0.68)_42%,rgba(3,7,11,0.90)_78%,#05070b_100%)]" />

        {/* Aligné à gauche, sur la gouttière commune au reste de la page. */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-left lg:px-10">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-white/70 sm:text-xs">
            {hero.eyebrow}
          </p>

          <h1
            className={`mt-8 font-extrabold leading-[0.94] tracking-[-0.055em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] ${
              titleLines.length === 1
                ? "text-4xl sm:text-5xl lg:text-7xl xl:text-[7rem]"
                : titleLines.length === 3
                  ? "text-4xl sm:text-6xl lg:text-7xl xl:text-[6rem]"
                  : "text-5xl sm:text-7xl lg:text-8xl xl:text-[7rem]"
            }`}
          >
            {titleLines.map((line) => (
              <span key={line} className="block">
                <GradientPunct text={line} />
              </span>
            ))}
          </h1>

          {/* Une seule action dans le hero épuré : la voie basse pression
              reste offerte au bas de page. */}
          <div className="mt-12 flex justify-start">
            <PrimaryCta
              href={ctaHref}
              label={content.cta.label}
              sectorId={sectorId}
              position="hero"
              size="large"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[42rem] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
      </div>
      {/* Voile à opacité fixe : contraste garanti quelle que soit l'image. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,11,0.97)_0%,rgba(3,7,11,0.88)_48%,rgba(3,7,11,0.48)_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(92,195,215,0.22),transparent_27%),radial-gradient(circle_at_26%_94%,rgba(138,205,95,0.15),transparent_30%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05070b] to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[42rem] w-full max-w-7xl flex-col justify-center gap-12 px-6 pb-20 pt-32 lg:grid lg:grid-cols-[minmax(0,1.15fr)_23rem] lg:items-center lg:gap-16 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8acd5f] sm:text-sm">
            {hero.eyebrow}
          </p>

          {/* Deux lignes courtes : le titre se scanne d'un coup d'œil. */}
          <h1 className="mt-7 text-4xl font-extrabold leading-[0.94] tracking-[-0.055em] sm:text-5xl lg:text-6xl xl:text-[4.75rem]">
            {titleLines.map((line, index) => (
              <span key={line} className="block text-white">
                {index === titleLines.length - 1 ? (
                  <GradientPunct text={line} />
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          {/* Descriptif factuel : petit, en casse normale. */}
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
            {hero.subtitle}
          </p>

          <div className={`mt-9 h-1 w-24 ${ACCENT}`} />

          <p className="mt-8 text-xl font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-2xl">
            {hero.valuePropLead}
          </p>
          {hero.valuePropBody ? (
            <p className="mt-3 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">
              {hero.valuePropBody}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-4">
            <PrimaryCta
              href={ctaHref}
              label={content.cta.label}
              sectorId={sectorId}
              position="hero"
            />
            <LowPressureLink
              content={content}
              locale={locale}
              sectorId={sectorId}
            />
          </div>

          {/* Signal de confiance : décisif en santé et dans le secteur public. */}
          {hero.trustLine || hero.trustPoints?.length ? (
            <div className="mt-10 border-t border-white/15 pt-6">
              {hero.trustLine ? (
                <p className="max-w-lg text-sm leading-6 text-zinc-300">
                  {hero.trustLine}
                </p>
              ) : null}
              <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                {(hero.trustPoints ?? []).map((point, index) => (
                  <li
                    key={point}
                    className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-zinc-400"
                  >
                    {index > 0 ? (
                      <span aria-hidden="true" className="text-zinc-600">
                        ·
                      </span>
                    ) : null}
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="rounded-2xl border border-white/15 bg-[#081116]/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-md sm:p-7">
          <p className="text-sm font-extrabold leading-tight tracking-[-0.02em] text-white">
            {heroCard.title}
          </p>
          <div className="mt-7 grid gap-5">
            {heroCard.items.map((item) => (
              <div
                key={item.value}
                className="zh-item flex items-start gap-4 border-t border-white/10 pt-5"
              >
                <span className="zh-icon mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
                  <SectorIcon name={item.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold leading-5 text-white">
                    {item.value}
                  </span>
                  <span className="mt-1.5 block text-xs leading-5 text-zinc-400">
                    {item.label}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-zinc-400">
            {heroCard.footnote}
          </p>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 1b · Enjeux — ce que le hero minimal ne dit plus                    */
/* ------------------------------------------------------------------ */

/**
 * Accompagne `HeroBlock variant="minimal"` : le descriptif de l'offre et les
 * enjeux du secteur, qui vivaient dans la carte vitrée du hero argumenté.
 */
export function HeroIssuesBlock({
  content,
  ctaHref,
  sectorId,
}: {
  content: SectorContent;
  ctaHref: string;
  sectorId: string;
}) {
  const { heroCard } = content;
  const lastTitleLine = heroCard.titleLine2 ?? heroCard.title;

  /**
   * Les colonnes ne sont pas des cartes : elles ne portent qu'un filet, du côté
   * où une voisine les précède — horizontal quand elles s'empilent, vertical
   * quand elles s'alignent. Jamais sur les bords extérieurs de la section.
   */
  const dividerClasses = (index: number) =>
    index === 0
      ? ""
      : "border-t border-black/10 transition-colors duration-300 hover:border-black/20 sm:border-t-0 sm:border-l";

  return (
    /* Seule section claire de la page : la rupture souligne le passage des
       enjeux du client à ce qu'on en fait. Les couleurs de marque y sont
       assombries d'un cran, le cyan et le vert d'origine étant illisibles
       sur fond clair. */
    <section className="relative isolate overflow-hidden bg-[#f4f5f6] py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="zh-reveal mx-auto max-w-6xl text-center">
          {/*
          Deux lignes, une phrase par ligne. La plus longue fait 43 caractères :
          le corps est donc plafonné à chaque palier par la largeur disponible,
          sinon elle se casse en deux et le titre passe à trois lignes.
        */}
          <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#0b0f14] sm:text-[2.25rem] lg:text-[2.375rem] xl:text-[2.875rem]">
            {heroCard.titleLine2 ? (
              <span className="block">{heroCard.title}</span>
            ) : null}
            <span className="block">
              <GradientPunct text={lastTitleLine} />
            </span>
          </h2>
          {heroCard.lead ? (
            /* ~730 px : une mesure de lecture, pas une pleine largeur. */
            <p className="mx-auto mt-6 max-w-[45.5rem] text-base leading-8 text-zinc-600 sm:text-lg">
              {heroCard.lead}
            </p>
          ) : null}
        </div>

        {/* Aucune gouttière : ce sont les filets et le rembourrage qui séparent. */}
        <div className="mt-16 grid grid-cols-1 sm:mt-20 sm:grid-cols-3">
          {heroCard.items.map((item, index) => (
            /* Structure identique dans les trois colonnes : icône de hauteur
             fixe, écart fixe, titre, écart fixe, explication. Les titres
             tenant sur une ligne, les explications s'alignent d'elles-mêmes. */
            <div
              key={item.value}
              className={`zh-item group flex flex-col py-10 sm:px-8 sm:py-11 lg:py-6 ${dividerClasses(index)}`}
            >
              <SectorIcon
                name={item.icon}
                className="h-6 w-6 shrink-0 text-[#1f8ba3] transition-transform duration-300 [stroke-width:1.25] group-hover:-translate-y-[3px]"
              />
              <p className="mt-5 text-xl font-extrabold leading-7 tracking-[-0.02em] text-[#0b0f14]">
                {item.value}
              </p>
              <p className="mt-3 text-[0.95rem] leading-7 text-zinc-600 transition-colors duration-300 group-hover:text-zinc-800">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {heroCard.closingCta ? (
          <p className="mt-16 text-center text-base leading-8 text-zinc-600 sm:mt-20">
            {heroCard.closingCta.question}{" "}
            <Link
              href={ctaHref}
              data-analytics-event="cta_secondary_click"
              data-analytics-sector={sectorId}
              data-analytics-position="issues"
              className="group ml-1 inline-flex items-center gap-2 font-bold text-[#0b0f14] underline decoration-[#1f8ba3] decoration-2 underline-offset-[6px] transition-colors duration-300 hover:decoration-[#5b9c34]"
            >
              {heroCard.closingCta.label}
              <span
                aria-hidden="true"
                className="text-[#5b9c34] no-underline transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Preuve — logos défilants, sans libellé                          */
/* ------------------------------------------------------------------ */

export function ProofMarqueeBlock({ content }: { content: SectorContent }) {
  /** Règle du guide : aucun logo sans autorisation écrite documentée. */
  const logos = content.proof.logos.filter(
    (logo) => logo.authorization === "documentee",
  );
  if (logos.length === 0) return null;

  return (
    /* Remontée sur le bas du hero : les logos se posent sur l'image plutôt que
       sur la bande qui la suit. Le fond reste transparent pour la laisser voir. */
    <section className="relative z-10 -mt-24 overflow-hidden pb-8 print:hidden sm:-mt-28 sm:pb-10">
      <LogoMarquee logos={logos} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Problème                                                        */
/* ------------------------------------------------------------------ */

export function ProblemBlock({
  content,
  limit,
}: {
  content: SectorContent;
  limit?: number;
}) {
  const realities = limit
    ? content.problem.realities.slice(0, limit)
    : content.problem.realities;

  return (
    <Section>
      <SectionHead
        eyebrow={content.problem.eyebrow}
        title={content.problem.title}
        lead={content.problem.lead}
      />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {realities.map((reality, index) => (
          <article
            key={reality.title}
            className="zh-item zh-reveal rounded-lg border border-white/10 bg-white/[0.04] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span className="zh-icon flex h-12 w-12 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
              <SectorIcon name={reality.icon} />
            </span>
            <h3 className="mt-6 text-lg font-black uppercase leading-tight text-white">
              {reality.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {reality.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** Respiration : une image pleine largeur et une seule phrase. */
export function BreatherBlock({ content }: { content: SectorContent }) {
  return (
    <section className="relative flex min-h-[42vh] items-center overflow-hidden print:hidden">
      <Image
        src={content.team.images[1].src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-20 text-center lg:px-10">
        <p className="text-xl font-semibold leading-9 text-white sm:text-2xl">
          {content.problem.closing}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Démonstration                                                   */
/* ------------------------------------------------------------------ */

export function DemoBlock({
  content,
  sectorId,
}: {
  content: SectorContent;
  sectorId: string;
}) {
  const show = content.demo.videos.some(isVideoPublishable) || PREVIEW_DRAFTS;
  if (!show) return null;

  return (
    <Section muted>
      <SectionHead
        eyebrow={content.demo.eyebrow}
        title={content.demo.title}
        lead={content.demo.lead}
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {content.demo.videos.map((video, index) => (
          <article key={video.title} className={`zh-reveal ${GRADIENT_BORDER}`}>
            <div className="overflow-hidden rounded-lg bg-[#05070b] p-5">
              {isVideoPublishable(video) ? (
                <VideoFacade
                  uid={video.uid}
                  title={video.title}
                  durationSeconds={video.durationSeconds}
                  posterAlt={video.posterAlt}
                  productionNotes={video.productionNotes}
                  transcript={video.transcript}
                  hasCaptions={isPublishable(video.captionsSrc)}
                  preload={index === 0 ? "metadata" : "none"}
                  trackingId={`${sectorId}-${video.kind}`}
                />
              ) : PREVIEW_DRAFTS ? (
                <>
                  <div className="flex aspect-video items-center justify-center rounded bg-black/60">
                    <span className="text-sm text-zinc-600">{video.title}</span>
                  </div>
                  <p className="mt-4 text-sm font-black uppercase text-white">
                    {video.title}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {video.productionNotes.map((note) => (
                      <li
                        key={note}
                        className="flex gap-3 text-sm leading-6 text-zinc-300"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1 w-4 shrink-0 bg-[#5cc3d7]"
                        />
                        {note}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · Mécanique                                                       */
/* ------------------------------------------------------------------ */

export function MechanicsBlock({ content }: { content: SectorContent }) {
  return (
    <Section muted>
      <SectionHead
        eyebrow={content.mechanics.eyebrow}
        title={content.mechanics.title}
        lead={content.mechanics.lead}
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {content.mechanics.steps.map((step, index) => (
          <article
            key={step.title}
            className="zh-item zh-reveal rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center gap-4">
              <span className="zh-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
                <SectorIcon name={step.icon} className="h-6 w-6" />
              </span>
              <span className={`${PRICE_TEXT} text-4xl`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-black uppercase leading-tight text-white">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-300">{step.body}</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs font-bold uppercase leading-5 text-[#8acd5f]">
              <Draft
                ready={isPublishable(step.milestone)}
                preview={<Pending />}
              >
                {step.milestone}
              </Draft>
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-7">
        <h3 className="text-lg font-black uppercase text-white">
          {content.mechanics.deliverables.title}
        </h3>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.mechanics.deliverables.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-6 text-zinc-300"
            >
              <span
                aria-hidden="true"
                className="mt-2.5 h-1 w-4 shrink-0 bg-[#8acd5f]"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 6 · Preuve profonde                                                 */
/* ------------------------------------------------------------------ */

export function CaseStudyBlock({ content }: { content: SectorContent }) {
  const caseStudy = content.caseStudies.items[0];
  const ready =
    isPublishable(caseStudy.organization) &&
    isPublishable(caseStudy.result.value) &&
    isPublishable(caseStudy.testimonial.name);
  if (!ready) return null;

  return (
    <Section>
      <SectionHead
        eyebrow={content.caseStudies.eyebrow}
        title={content.caseStudies.title}
        lead={content.caseStudies.lead}
      />
      <div className={`zh-reveal mt-14 ${GRADIENT_BORDER}`}>
        <article className="grid gap-12 rounded-lg bg-[#05070b] p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8acd5f]">
              {caseStudy.organization}
            </p>
            <dl className="mt-7 grid gap-7">
              <CaseField label="Contexte" value={caseStudy.context} />
              <CaseField label="Contrainte" value={caseStudy.constraint} />
              <CaseList label="Approche" items={caseStudy.approach} />
              <CaseList label="Livrables" items={caseStudy.deliverables} />
            </dl>
          </div>
          <div className="flex flex-col gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5cc3d7]">
                {caseStudy.result.metric}
              </p>
              <p className={`${PRICE_TEXT} mt-4 text-6xl sm:text-7xl`}>
                {caseStudy.result.value}
              </p>
              <p className="mt-4 text-xs leading-5 text-zinc-400">
                {caseStudy.result.attribution}
              </p>
            </div>
            <blockquote className="border-l-2 border-[#8acd5f] pl-6">
              <p className="text-lg leading-8 text-zinc-200">
                « {caseStudy.testimonial.quote} »
              </p>
              <footer className="mt-5 text-sm leading-6 text-zinc-400">
                <span className="font-bold text-white">
                  {caseStudy.testimonial.name}
                </span>
                {", "}
                {caseStudy.testimonial.role}
                <br />
                {caseStudy.testimonial.organization}
              </footer>
            </blockquote>
          </div>
        </article>
      </div>
    </Section>
  );
}

function CaseField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#5cc3d7]">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-7 text-zinc-300">{value}</dd>
    </div>
  );
}

function CaseList({
  label,
  items,
}: {
  label: string;
  items: readonly string[] | string;
}) {
  const list = Array.isArray(items) ? items : [items as string];
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#5cc3d7]">
        {label}
      </dt>
      <dd>
        <ul className="mt-2 grid gap-2">
          {list.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-7 text-zinc-300"
            >
              <span
                aria-hidden="true"
                className="mt-3 h-1 w-4 shrink-0 bg-[#8acd5f]"
              />
              {item}
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7 · Objections                                                      */
/* ------------------------------------------------------------------ */

export function ObjectionsBlock({ content }: { content: SectorContent }) {
  const items = content.objections.items.filter(
    (o) => isValidated(o) || (PREVIEW_DRAFTS && isPublishable(o.answer)),
  );
  if (items.length === 0) return null;

  return (
    <Section muted>
      <SectionHead
        eyebrow={content.objections.eyebrow}
        title={content.objections.title}
      />
      <dl className="mt-14 grid gap-5 md:grid-cols-2">
        {items.map((objection) => (
          <div
            key={objection.question}
            className="zh-item zh-reveal rounded-lg border border-white/10 bg-white/[0.04] p-6"
          >
            <dt className="text-base font-black uppercase leading-6 text-white">
              {objection.question}
            </dt>
            <dd className="mt-3 text-sm leading-7 text-zinc-300">
              <Draft
                ready={
                  isValidated(objection) && isPublishable(objection.answer)
                }
                preview={objection.answer}
              >
                {objection.answer}
              </Draft>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 8 · Investissement                                                  */
/* ------------------------------------------------------------------ */

export function InvestmentBlock({
  content,
  driversLimit,
}: {
  content: SectorContent;
  driversLimit?: number;
}) {
  const tiers = content.investment.tiers.filter(
    (t) => isValidated(t) || PREVIEW_DRAFTS,
  );
  const drivers = driversLimit
    ? content.investment.drivers.slice(0, driversLimit)
    : content.investment.drivers;

  return (
    <Section>
      <SectionHead
        eyebrow={content.investment.eyebrow}
        title={content.investment.title}
        lead={content.investment.lead}
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <article
            key={tier.label}
            className="zh-item zh-reveal rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
          >
            <span className="zh-icon flex h-11 w-11 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
              <SectorIcon name={tier.icon} className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-sm font-black uppercase text-white">
              {tier.label}
            </h3>
            <p className={`${PRICE_TEXT} mt-3 text-3xl`}>
              <Draft
                ready={isPublishable(tier.range)}
                preview={<Pending>— $</Pending>}
              >
                {tier.range}
              </Draft>
            </p>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {tier.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.04] p-7">
        <h3 className="text-lg font-black uppercase text-white">
          Ce qui fait varier le montant
        </h3>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {drivers.map((driver) => (
            <li
              key={driver}
              className="flex gap-3 text-sm leading-6 text-zinc-300"
            >
              <span
                aria-hidden="true"
                className="mt-2.5 h-1 w-4 shrink-0 bg-[#8acd5f]"
              />
              {driver}
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-zinc-400">
          {content.investment.note}
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 9 · Équipe et ancrage                                               */
/* ------------------------------------------------------------------ */

export function TeamBlock({ content }: { content: SectorContent }) {
  return (
    <Section muted>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHead
            eyebrow={content.team.eyebrow}
            title={content.team.title}
            lead={content.team.body}
            align="left"
          />
          <dl className="mt-10 grid gap-4">
            {content.team.credentials.map((credential) => (
              <div
                key={credential.label}
                className="grid gap-1 border-t border-white/10 pt-4 sm:grid-cols-[12rem_1fr] sm:gap-4"
              >
                <dt className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400">
                  {credential.label}
                </dt>
                <dd className="text-sm leading-6 text-white">
                  <Draft
                    ready={isPublishable(credential.value)}
                    preview={<Pending />}
                  >
                    {credential.value}
                  </Draft>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="zh-reveal grid gap-4 sm:grid-cols-[0.9fr_1.1fr_0.8fr]">
          {content.team.images.map((image) => (
            <div
              key={image.alt}
              className="relative min-h-80 overflow-hidden rounded-lg border border-white/15"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 10 · FAQ                                                            */
/* ------------------------------------------------------------------ */

export function FaqBlock({ content }: { content: SectorContent }) {
  const items = content.faq.items.filter(
    (f) => isValidated(f) || (PREVIEW_DRAFTS && isPublishable(f.answer)),
  );
  if (items.length === 0) return null;

  return (
    <Section>
      <SectionHead eyebrow={content.faq.eyebrow} title={content.faq.title} />
      <div className="mx-auto mt-14 max-w-3xl">
        {items.map((entry) => (
          <details
            key={entry.question}
            className="zh-item group border-t border-white/10 last:border-b print:open"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-black uppercase leading-6 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]">
              {entry.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-2xl font-normal text-[#5cc3d7] transition group-open:rotate-45 print:hidden"
              >
                +
              </span>
            </summary>
            <p className="pb-6 text-sm leading-7 text-zinc-300">
              <Draft
                ready={isValidated(entry) && isPublishable(entry.answer)}
                preview={entry.answer}
              >
                {entry.answer}
              </Draft>
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 11 · CTA final · 12 · Pied de page                                  */
/* ------------------------------------------------------------------ */

export function FinalCtaBlock({
  content,
  ctaHref,
  sectorId,
}: {
  content: SectorContent;
  ctaHref: string;
  /** Reçu des deux pages ; plus utilisé depuis le retrait de la voie basse pression. */
  locale?: Locale;
  sectorId: string;
}) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden print:hidden">
      <Image
        src={content.finalCta.image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h2 className="max-w-4xl text-3xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
          <GradientPunct text={content.finalCta.title} />
        </h2>
        {content.finalCta.body ? (
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
            {content.finalCta.body}
          </p>
        ) : null}
        {/* Une seule action : le dossier reste accessible par le pied de page. */}
        <div className="mt-9 flex justify-center">
          <PrimaryCta
            href={ctaHref}
            label={content.cta.label}
            sectorId={sectorId}
            position="final"
            size="large"
          />
        </div>
        <p className="mt-6 max-w-md text-sm leading-6 text-zinc-400">
          {content.cta.whatHappensNext}
        </p>
      </div>
    </section>
  );
}

export function SectorFooter({
  content,
  locale,
}: {
  content: SectorContent;
  locale: Locale;
}) {
  return (
    <footer className="border-t border-white/10 bg-[#05070b] py-12">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 text-xs leading-6 text-zinc-500 sm:grid-cols-2 lg:px-10">
        <div>
          <p className="font-black uppercase text-zinc-300">Zéro huit</p>
          {content.team.credentials.map((credential) => (
            <p key={credential.label}>
              <Draft ready={isPublishable(credential.value)}>
                {credential.label} : {credential.value}
              </Draft>
            </p>
          ))}
        </div>
        <div className="sm:text-right">
          <Link
            href={withLocaleHref(locale, "/politique-de-confidentialite")}
            className="underline underline-offset-4 hover:text-zinc-300"
          >
            Politique de confidentialité
          </Link>
          <p className="mt-2 max-w-xs sm:ml-auto">
            Les renseignements transmis par le formulaire servent uniquement à
            préparer et à faire le suivi de votre demande.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Portfolio — le travail, sans commentaire                            */
/* ------------------------------------------------------------------ */

export function PortfolioBlock({
  content,
  locale,
  sectorId,
}: {
  content: SectorContent;
  locale: Locale;
  sectorId: string;
}) {
  const { portfolio } = content;
  if (!portfolio) return null;

  return (
    /* Section claire, comme celle des enjeux : le cyan de marque y est
       assombri d'un cran, illisible tel quel sur fond pâle. Les vignettes,
       elles, restent des images sombres. */
    <section className="relative isolate overflow-hidden border-y border-black/10 bg-[#f4f5f6] py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="zh-reveal mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1f8ba3] sm:text-sm">
            {portfolio.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] text-[#0b0f14] sm:text-6xl">
            <GradientPunct text={portfolio.title} />
          </h2>
          {portfolio.lead ? (
            <p className="mx-auto mt-6 max-w-[45rem] text-base leading-8 text-zinc-600">
              {portfolio.lead}
            </p>
          ) : null}
        </div>

        <div className="mt-14 sm:mt-16">
          <PortfolioGrid portfolio={portfolio} sectorId={sectorId} />
        </div>

        {portfolio.moreCta ? (
          <p className="mt-12 text-center">
            <Link
              href={withLocaleHref(locale, portfolio.moreCta.href)}
              data-analytics-event="portfolio_more_click"
              data-analytics-sector={sectorId}
              className="group inline-flex items-center gap-2 text-sm font-bold text-[#0b0f14] underline decoration-[#1f8ba3] decoration-2 underline-offset-[6px] transition-colors duration-300 hover:decoration-[#5b9c34]"
            >
              {portfolio.moreCta.label}
              <span
                aria-hidden="true"
                className="text-[#5b9c34] transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Approche — la méthode avant le format                               */
/* ------------------------------------------------------------------ */

export function NarrativeBlock({ content }: { content: SectorContent }) {
  return <ApproachShowcase narrative={content.narrative} />;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export function ServicesBlock({
  content,
  sectorId,
}: {
  content: SectorContent;
  sectorId: string;
}) {
  const { services } = content;
  return (
    <section className="relative isolate overflow-hidden border-y border-white/10 bg-[#090f14] py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(92,195,215,0.10),transparent_27%),radial-gradient(circle_at_12%_86%,rgba(138,205,95,0.07),transparent_25%)] opacity-70"
      />
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        {/* Un seul titre, en grand : le carrousel parle de lui-même. */}
        <div className="zh-reveal text-center">
          <h2 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl">
            <GradientPunct text={services.eyebrow} />
          </h2>
        </div>
      </div>

      <div className="mt-12 sm:mt-14 lg:mt-16">
        <ServicesShowcase services={services.items} sectorId={sectorId} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Types d'organisations                                               */
/* ------------------------------------------------------------------ */

export function AudiencesBlock({ content }: { content: SectorContent }) {
  const { audiences } = content;
  return (
    <Section>
      <SectionHead
        eyebrow={audiences.eyebrow}
        title={audiences.title}
        lead={audiences.lead}
      />
      <ul className="mt-12 flex flex-wrap justify-center gap-3">
        {audiences.items.map((item) => (
          <li
            key={item}
            className="zh-item rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-bold leading-6 text-zinc-200"
          >
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Approche — quatre principes                                         */
/* ------------------------------------------------------------------ */

export function ApproachBlock({ content }: { content: SectorContent }) {
  const { approach } = content;
  return (
    <Section muted>
      <SectionHead
        eyebrow={approach.eyebrow}
        title={approach.title}
        lead={approach.lead}
      />

      <ul className="mx-auto mt-10 grid max-w-3xl gap-2.5 text-center">
        {approach.constraints.map((constraint) => (
          <li key={constraint} className="text-base leading-7 text-zinc-400">
            {constraint}
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 max-w-2xl text-center text-lg font-semibold leading-8 text-white">
        {approach.bridge}
      </p>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {approach.principles.map((principle, index) => (
          <article
            key={principle.title}
            className="zh-item zh-reveal rounded-lg border border-white/10 bg-white/[0.04] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span className="zh-icon flex h-12 w-12 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
              <SectorIcon name={principle.icon} />
            </span>
            <h3 className="mt-6 text-lg font-black uppercase text-white">
              {principle.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {principle.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Processus en six étapes                                             */
/* ------------------------------------------------------------------ */

export function ProcessBlock({ content }: { content: SectorContent }) {
  const { process } = content;
  return (
    <Section>
      <div className="zh-reveal mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5cc3d7] sm:text-sm">
          {process.eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-extrabold leading-[1.06] tracking-[-0.045em] text-white sm:text-[2.5rem]">
          {process.titleLine2 ? (
            <span className="block">{process.title}</span>
          ) : null}
          <span className="block">
            <GradientPunct text={process.titleLine2 ?? process.title} />
          </span>
        </h2>
        {process.lead ? (
          <p className="mx-auto mt-6 max-w-[45rem] text-base leading-8 text-zinc-300">
            {process.lead}
          </p>
        ) : null}
      </div>

      <div className="mt-28 sm:mt-36">
        <ProcessTimeline process={process} />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Un tournage, plusieurs contenus                                     */
/* ------------------------------------------------------------------ */

export function MultiplierBlock({ content }: { content: SectorContent }) {
  const { multiplier } = content;
  return (
    <Section muted>
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <SectionHead
            eyebrow={multiplier.eyebrow}
            title={multiplier.title}
            lead={multiplier.lead}
            align="left"
          />
          <p className={`${PRICE_TEXT} mt-8 text-3xl sm:text-4xl`}>
            {multiplier.goal}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {multiplier.outputs.map((output, index) => (
            <li
              key={output}
              className="zh-item zh-reveal flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-6 shrink-0 bg-[#8acd5f]"
              />
              <span className="text-sm font-bold leading-6 text-white">
                {output}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Relance en milieu de page                                           */
/* ------------------------------------------------------------------ */

export function MidCtaBlock({
  content,
  ctaHref,
  sectorId,
}: {
  content: SectorContent;
  ctaHref: string;
  sectorId: string;
}) {
  const { midCta } = content;
  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <H2>{midCta.title}</H2>
        <ul className="mt-10 grid gap-2.5">
          {midCta.questions.map((question) => (
            <li
              key={question}
              className="text-base leading-8 text-zinc-300 sm:text-lg"
            >
              {question}
            </li>
          ))}
        </ul>
        <p className="mt-10 text-base leading-8 text-zinc-400">{midCta.body}</p>
      </div>

      <div className="mx-auto max-w-4xl">
        <ProjectComposer
          services={content.services.items}
          ctaLabel={content.cta.label}
          ctaHref={ctaHref}
          sectorId={sectorId}
          labels={midCta.composer}
        />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Mandats fréquents — offres propres au secteur                       */
/* ------------------------------------------------------------------ */

export function HighlightsBlock({ content }: { content: SectorContent }) {
  const { highlights } = content;
  return (
    <Section muted>
      <SectionHead
        eyebrow={highlights.eyebrow}
        title={highlights.title}
        lead={highlights.lead}
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {highlights.items.map((item, index) => (
          <article
            key={item.title}
            className={`zh-reveal ${GRADIENT_BORDER}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="zh-item flex h-full flex-col rounded-lg bg-[#05070b] p-7">
              <span className="zh-icon flex h-12 w-12 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
                <SectorIcon name={item.icon} />
              </span>
              <h3 className="mt-6 text-xl font-black uppercase leading-tight text-white">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                {item.body}
              </p>
              <ul className="mt-6 grid gap-3 border-t border-white/10 pt-5">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-6 text-zinc-300"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1 w-4 shrink-0 bg-[#8acd5f]"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
