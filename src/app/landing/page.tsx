import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { HomeClientsSection } from "@/components/HomeClientsSection";
import { LandingFeaturedGrid } from "@/components/LandingFeaturedGrid";
import { normalizeLocale, withLocaleHref } from "@/lib/i18n/shared";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Taxonomy, Video } from "@/lib/types";
import { headers } from "next/headers";

import heroBg from "../../../assets/bg/bg_a_propos.jpg";
import batisse from "../../../assets/batisse.jpg";
import production from "../../../assets/services/production.jpg";
import postProduction from "../../../assets/services/post_production.jpg";

export const metadata: Metadata = {
  title: "Landing \u2014 Zéro huit",
  description:
    "Production vidéo haut de gamme sur la Rive-Sud. Demandez une soumission ou découvrez nos projets.",
  openGraph: {
    title: "Zéro huit \u2014 Production vidéo sur la Rive-Sud",
    description:
      "Découvrez une équipe lean et créative. Demandez une soumission ou explorez notre portfolio.",
  },
  twitter: {
    title: "Zéro huit \u2014 Production vidéo sur la Rive-Sud",
    description:
      "Découvrez une équipe lean et créative. Demandez une soumission ou explorez notre portfolio.",
  },
};

export const dynamic = "force-dynamic";

const proofPoints = [
  {
    title: "Direction créative",
    description: "Une narration claire, un style visuel assumé et une exécution soignée.",
  },
  {
    title: "Équipe lean",
    description: "Les bons talents, au bon moment, pour un projet fluide et efficace.",
  },
  {
    title: "Production locale",
    description: "Basés sur la Rive-Sud, avec une logistique simple et des tournages rapides.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Brief & stratégie",
    description:
      "On cerne vos objectifs, vos publics et la promesse à raconter pour définir le concept.",
  },
  {
    step: "02",
    title: "Tournage & direction",
    description:
      "On met en place une équipe agile et une direction artistique alignée sur votre marque.",
  },
  {
    step: "03",
    title: "Post-production",
    description:
      "Montage, motion design, colorisation et livrables prêts à performer partout.",
  },
];

const portfolioItems = [
  {
    title: "Publicité & marque",
    subtitle: "Campagnes percutantes",
    image: production,
  },
  {
    title: "Vidéo corporative",
    subtitle: "Crédibilité et confiance",
    image: postProduction,
  },
  {
    title: "Événement & captation",
    subtitle: "Moments qui vivent longtemps",
    image: batisse,
  },
];

export default async function LandingPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const headerOffset = 120;
  let featuredVideos: Video[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = getSupabasePublicServerClient();
    const [{ data: videos, error: videosError }, { data: taxonomies, error: taxonomiesError }] =
      await Promise.all([
        supabase
          .from("videos")
          .select(
            "id,title,cloudflare_uid,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,created_at",
          )
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("taxonomies").select("id,kind,label"),
      ]);

    if (!videosError && !taxonomiesError) {
      const ids = (videos ?? []).map((video) => video.id);
      let videoTaxonomies: { video_id: string; taxonomy_id: string }[] = [];
      if (ids.length > 0) {
        const { data: videoTaxonomyRows } = await supabase
          .from("video_taxonomies")
          .select("video_id,taxonomy_id")
          .in("video_id", ids);
        videoTaxonomies = (videoTaxonomyRows ??
          []) as { video_id: string; taxonomy_id: string }[];
      }

      const taxonomyById = new Map<string, Taxonomy>();
      for (const t of (taxonomies ?? []) as Taxonomy[]) taxonomyById.set(t.id, t);

      const taxonomyIdsByVideoId = new Map<string, string[]>();
      for (const row of videoTaxonomies) {
        const list = taxonomyIdsByVideoId.get(row.video_id) ?? [];
        list.push(row.taxonomy_id);
        taxonomyIdsByVideoId.set(row.video_id, list);
      }

      const hydratedVideos: Video[] = ((videos ?? []) as Omit<
        Video,
        "taxonomies"
      >[]).map((video) => ({
        ...video,
        taxonomies: (taxonomyIdsByVideoId.get(video.id) ?? [])
          .map((id) => taxonomyById.get(id))
          .filter(Boolean) as Taxonomy[],
      }));

      featuredVideos = hydratedVideos
        .filter((video) => !video.cloudflare_uid.startsWith("pending:"))
        .slice(0, 8);
    }
  }

  return (
    <div className="text-zinc-100">
      <section
        className="relative min-h-[85vh] w-full overflow-hidden"
        style={{ marginTop: `-${headerOffset}px`, paddingTop: `${headerOffset}px` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg.src})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col gap-12 px-6 py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-300">
              Production vid&#233;o Rive-Sud
            </span>
            <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Faites rayonner votre marque avec une histoire qui marque
              <span className="block bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                vraiment.
              </span>
            </h1>
            <p className="mt-6 text-base leading-7 text-zinc-200 sm:text-lg">
              Z&#233;ro huit con&#231;oit des productions vid&#233;o haut de gamme pour les entreprises
              et organismes de la Rive-Sud de Montr&#233;al. Une &#233;quipe senior, un processus
              fluide et des livrables pens&#233;s pour convertir.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={withLocaleHref(locale, "/request")}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
              >
                Demande de soumission
              </Link>
              <Link
                href={withLocaleHref(locale, "/portfolio")}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:text-emerald-200"
              >
                Explorer le portfolio
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
              <span>R&#233;ponse rapide</span>
              <span>Approche sur mesure</span>
              <span>Livrables clairs</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-white">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-zinc-950/60 py-20">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-400">
              Pourquoi Z&#233;ro huit
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
              Une production solide, un ton juste, des r&#233;sultats mesurables.
            </h2>
            <p className="mt-6 text-base leading-7 text-zinc-300">
              De la strat&#233;gie &#224; la diffusion, chaque d&#233;tail est pens&#233; pour aligner
              votre message, votre image et vos objectifs de conversion.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                "Concepts validés rapidement",
                "Équipe de tournage agile",
                "Direction artistique experte",
                "Livrables multi-formats",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-zinc-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <Image
              src={batisse}
              alt="Tournage Zéro huit"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-200">
                Projets de marque
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Des productions qui mettent votre savoir-faire en sc&#232;ne.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFeaturedGrid videos={featuredVideos} />

      <section className="bg-zinc-900 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-400">
                Processus
              </span>
              <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                Un parcours simple, du brief &#224; la livraison.
              </h2>
            </div>
            <Link
              href={withLocaleHref(locale, "/request")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
            >
              D&#233;marrez votre projet <span aria-hidden="true">&#8594;</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {processSteps.map((step) => (
              <div key={step.step} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                  {step.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black/90 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-400">
                Portfolio
              </span>
              <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                Des histoires qui font avancer les marques.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                Chaque projet est con&#231;u pour soutenir vos objectifs marketing, RH ou
                institutionnels avec une signature visuelle coh&#233;rente.
              </p>
            </div>
            <Link
              href={withLocaleHref(locale, "/portfolio")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
            >
              Voir tous les projets <span aria-hidden="true">&#8594;</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <div key={item.title} className="group relative overflow-hidden rounded-3xl border border-white/10">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-300">
                    {item.subtitle}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeClientsSection />

      <section className="relative bg-zinc-950 py-20">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-400">
            D&#233;marrer maintenant
          </span>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Parlons de votre prochaine vid&#233;o.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-300">
            Partagez vos objectifs et votre &#233;ch&#233;ancier. Nous reviendrons vers vous
            avec une proposition claire et adapt&#233;e &#224; votre budget.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={withLocaleHref(locale, "/request")}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            >
              Remplir le formulaire
            </Link>
            <Link
              href={withLocaleHref(locale, "/portfolio")}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:text-emerald-200"
            >
              Explorer nos r&#233;alisations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
