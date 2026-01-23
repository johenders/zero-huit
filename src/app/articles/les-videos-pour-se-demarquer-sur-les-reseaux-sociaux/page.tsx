import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Se démarquer sur les réseaux sociaux avec la vidéo — Zéro huit",
  description:
    "Pourquoi la vidéo est l'outil le plus performant sur les réseaux sociaux et comment l'adapter pour votre audience à Montréal.",
  openGraph: {
    title: "Se démarquer sur les réseaux sociaux avec la vidéo — Zéro huit",
    description:
      "Pourquoi la vidéo est l'outil le plus performant sur les réseaux sociaux et comment l'adapter pour votre audience à Montréal.",
  },
  twitter: {
    title: "Se démarquer sur les réseaux sociaux avec la vidéo — Zéro huit",
    description:
      "Pourquoi la vidéo est l'outil le plus performant sur les réseaux sociaux et comment l'adapter pour votre audience à Montréal.",
  },
};

export default function ArticleSocialVideoPage() {
  return (
    <div className="bg-zinc-900 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <span className="text-xs font-semibold tracking-[0.4em] text-white/60">
            ARTICLE
          </span>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Comment les vidéos vous aident à vous démarquer sur les réseaux sociaux
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">
            Les plateformes sociales favorisent la vidéo. Pour une entreprise à Montréal, c'est un
            levier puissant pour capter l'attention et créer de la proximité. Voici comment maximiser
            l'impact de votre contenu.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 pb-24 pt-10 text-sm leading-7 text-white/75 sm:text-base lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">La vidéo capte l'attention plus vite</h2>
            <p className="mt-4">
              Sur les réseaux sociaux, les premières secondes sont cruciales. Un hook visuel fort,
              un message clair et des sous-titres permettent d'arrêter le défilement et de conserver
              l'attention, même sans le son.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Formats qui performent</h3>
            <ul className="mt-3 space-y-2">
              <li>Capsules courtes verticales (15-45 secondes).</li>
              <li>Démonstrations produit et coulisses d'équipe.</li>
              <li>Témoignages clients filmés avec authenticité.</li>
              <li>Contenus éducatifs et FAQ filmées.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Adaptez votre message</h3>
            <p className="mt-3">
              Un tournage bien planifié peut générer plusieurs déclinaisons: reels, stories,
              annonces payantes, vidéos LinkedIn. Cela augmente la portée sans multiplier les coûts.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl font-semibold text-white">Bonnes pratiques locales</h3>
          <p className="mt-3 text-white/70">
            Miser sur un récit ancré à Montréal renforce la proximité: lieux reconnaissables,
            accents locaux et références culturelles. C'est un avantage pour créer de la confiance
            et humaniser votre marque.
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/60 p-5 text-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              Astuce
            </div>
            <p className="mt-3 text-white/70">
              Planifiez vos vidéos en séries. Une série de 5 capsules courtes sur un même thème
              améliore la répétition du message et favorise l'engagement.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8acd5f]"
          >
            Lancer une série vidéo <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
