import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Production vidéo Montréal : choisir le bon partenaire — Zéro huit",
  description:
    "Guide pour choisir une agence de production vidéo à Montréal: stratégie, équipe, style visuel et accompagnement complet.",
  openGraph: {
    title: "Production vidéo Montréal : choisir le bon partenaire — Zéro huit",
    description:
      "Guide pour choisir une agence de production vidéo à Montréal: stratégie, équipe, style visuel et accompagnement complet.",
  },
  twitter: {
    title: "Production vidéo Montréal : choisir le bon partenaire — Zéro huit",
    description:
      "Guide pour choisir une agence de production vidéo à Montréal: stratégie, équipe, style visuel et accompagnement complet.",
  },
};

export default function ArticleMontrealProductionPage() {
  return (
    <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(92,195,215,0.18),_transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <span className="text-xs font-semibold tracking-[0.4em] text-white/60">
            ARTICLE
          </span>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Production vidéo Montréal : choisir le bon partenaire
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">
            Montréal regorge de créateurs. Mais pour une production vidéo efficace, il faut
            plus qu'une caméra: une équipe qui comprend vos objectifs, un style cohérent et une
            méthode éprouvée pour livrer à temps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-6 pb-24 pt-10 text-sm leading-7 text-white/70 sm:text-base">
        <div>
          <h2 className="text-2xl font-semibold text-white">Ce qu'une bonne agence apporte</h2>
          <p className="mt-4">
            Un partenaire en production vidéo à Montréal doit vous guider de l'idéation à la
            diffusion: stratégie de contenu, direction artistique, gestion de tournage et
            post-production. La valeur réelle se trouve dans la capacité à raconter votre histoire
            de façon claire et mémorable.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "Une stratégie avant la caméra",
              text: "Clarifier le message, définir l'audience et bâtir un plan de diffusion.",
            },
            {
              title: "Une équipe solide",
              text: "Réalisateur, direction photo, son, montage et gestion de projet alignés.",
            },
            {
              title: "Un style visuel cohérent",
              text: "Couleurs, rythme, narration et identité qui reflètent votre marque.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-white/70">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-8">
          <h3 className="text-xl font-semibold text-white">Un partenaire local, un impact direct</h3>
          <p className="mt-3">
            Travailler avec une équipe locale signifie une meilleure connaissance du territoire,
            des lieux de tournage et des réalités de votre audience. C'est un avantage pour créer
            des vidéos pertinentes et authentiques.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5cc3d7]"
          >
            Parler d'un projet à Montréal <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
