import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Combien coûte une production vidéo — Zéro huit",
  description:
    "Comprendre les facteurs qui influencent le prix d'une production vidéo à Montréal et sur la Rive-Sud: durée, équipe, logistique et post-production.",
  openGraph: {
    title: "Combien coûte une production vidéo — Zéro huit",
    description:
      "Comprendre les facteurs qui influencent le prix d'une production vidéo à Montréal et sur la Rive-Sud: durée, équipe, logistique et post-production.",
  },
  twitter: {
    title: "Combien coûte une production vidéo — Zéro huit",
    description:
      "Comprendre les facteurs qui influencent le prix d'une production vidéo à Montréal et sur la Rive-Sud: durée, équipe, logistique et post-production.",
  },
};

export default function ArticlePricingPage() {
  return (
    <div className="bg-zinc-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(92,195,215,0.2),_transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <span className="text-xs font-semibold tracking-[0.4em] text-white/60">
            ARTICLE
          </span>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Combien coûte une production vidéo ?
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75">
            Le budget d'une production vidéo dépend de plusieurs variables: la durée du tournage,
            l'ampleur de l'équipe, la complexité du concept et la post-production. Voici comment
            démystifier ces éléments pour mieux planifier votre projet à Montréal ou sur la Rive-Sud.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 pb-24 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 text-sm leading-7 text-white/70 sm:text-base">
          <div>
            <h2 className="text-2xl font-semibold text-white">Les facteurs qui influencent le prix</h2>
            <p className="mt-4">
              En production vidéo à Montréal, le coût évolue surtout selon la pré-production
              (idéation, scénarisation, planification), la journée de tournage (équipe, matériel,
              lieux) et la post-production (montage, motion design, mix audio, étalonnage).
              Plus le récit est ambitieux, plus la coordination et le temps de traitement augmentent.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Ce qui peut faire varier le budget</h3>
            <ul className="mt-3 space-y-2">
              <li>Nombre de journées de tournage et de lieux.</li>
              <li>Équipe technique: réalisateur, DOP, assistant, son, éclairage.</li>
              <li>Besoin d'acteurs, de casting ou de droits musicaux.</li>
              <li>Style visuel: interviews, documentaire, publicitaire ou hybride.</li>
              <li>Livrables: formats web, versions courtes, sous-titrage, adaptations.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Comment optimiser votre investissement</h3>
            <p className="mt-3">
              Définissez un objectif clair et un public précis. Un message concentré réduit
              les allers-retours, accélère le montage et assure un meilleur retour sur investissement.
              Une stratégie de contenu permet aussi de décliner un tournage unique en plusieurs capsules.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-white/75">
          <h3 className="text-xl font-semibold text-white">Checklist rapide avant de demander un devis</h3>
          <ul className="mt-4 space-y-3">
            <li>Objectif principal de la vidéo (recrutement, vente, notoriété).</li>
            <li>Durée finale souhaitée et formats nécessaires.</li>
            <li>Échéancier réaliste et dates de tournage possibles.</li>
            <li>Ressources internes disponibles (porte-parole, lieux, contenu).</li>
          </ul>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8acd5f]"
          >
            Parlons de votre budget <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
