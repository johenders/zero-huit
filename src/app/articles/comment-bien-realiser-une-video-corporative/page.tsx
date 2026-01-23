import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment bien réaliser une vidéo corporative — Zéro huit",
  description:
    "Guide pratique pour réussir une vidéo corporative: message, narration, production vidéo à Montréal, et diffusion sur les bons canaux.",
  openGraph: {
    title: "Comment bien réaliser une vidéo corporative — Zéro huit",
    description:
      "Guide pratique pour réussir une vidéo corporative: message, narration, production vidéo à Montréal, et diffusion sur les bons canaux.",
  },
  twitter: {
    title: "Comment bien réaliser une vidéo corporative — Zéro huit",
    description:
      "Guide pratique pour réussir une vidéo corporative: message, narration, production vidéo à Montréal, et diffusion sur les bons canaux.",
  },
};

export default function ArticleCorporateVideoPage() {
  return (
    <div className="bg-white text-zinc-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(138,205,95,0.25),_transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <span className="text-xs font-semibold tracking-[0.4em] text-zinc-500">
            ARTICLE
          </span>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Comment bien réaliser une vidéo corporative
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600">
            Une vidéo corporative efficace n'est pas qu'un beau montage: c'est un outil stratégique.
            Voici les étapes clés pour structurer votre message, assurer une production vidéo soignée
            à Montréal, et livrer un contenu qui convainc.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-12 px-6 pb-24 pt-10 text-sm leading-7 text-zinc-600 sm:text-base">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">1. Clarifiez le message</h2>
            <p className="mt-4">
              Avant même de penser au tournage, identifiez l'objectif: présenter une équipe,
              expliquer une offre, recruter ou rassurer vos clients. Un message clair permet
              de garder un rythme dynamique et d'éviter les informations superflues.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Questions à se poser</h3>
            <ul className="mt-4 space-y-2">
              <li>Quel est le public principal?</li>
              <li>Quel problème résolvez-vous?</li>
              <li>Quel ton reflète votre marque?</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">2. Travaillez la narration</h2>
          <p className="mt-4">
            Une structure simple fonctionne bien: contexte, enjeux, solution, preuves et appel à
            l'action. En production vidéo à Montréal, les entreprises gagnent à intégrer des images
            d'ambiance locales et des témoignages authentiques pour renforcer la crédibilité.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-zinc-900">3. Préparez le tournage</h3>
            <p className="mt-3">
              Un plan de tournage détaillé, des porte-parole coachés et des lieux bien choisis
              réduisent les imprévus. Cela se traduit par une équipe plus agile et une journée
              plus productive.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">4. Pensez à la diffusion</h2>
            <p className="mt-4">
              Votre vidéo corporative doit vivre sur plusieurs canaux: site web, LinkedIn,
              présentations internes, campagnes publicitaires. Prévoyez dès le départ des formats
              courts et des sous-titres pour maximiser la portée.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8">
          <h3 className="text-xl font-semibold text-zinc-900">Besoin d'un plan clair?</h3>
          <p className="mt-3">
            Nous vous aidons à structurer le message, définir la narration et livrer une vidéo
            corporative cohérente qui répond à vos objectifs d'affaires.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
          >
            Demander une consultation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
