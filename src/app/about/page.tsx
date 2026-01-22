import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import bg from "../../../assets/bg/bg_a_propos.jpg";
import cedric from "../../../assets/team/ced.jpeg";
import jb from "../../../assets/team/jb.jpg";
import jo from "../../../assets/team/jo.jpeg";
import lev from "../../../assets/team/lev.jpg";
import max from "../../../assets/team/max.jpeg";
import will from "../../../assets/team/will.jpeg";
import xav from "../../../assets/team/xav.jpeg";

export const metadata: Metadata = {
  title: "À propos — Zéro huit",
  description:
    "Coalition de créatifs passionnés issue de Création Webson et Beavr. Mission: démocratiser la production vidéo haut de gamme.",
  openGraph: {
    title: "À propos — Zéro huit",
    description:
      "Coalition de créatifs passionnés issue de Création Webson et Beavr. Mission: démocratiser la production vidéo haut de gamme.",
  },
  twitter: {
    title: "À propos — Zéro huit",
    description:
      "Coalition de créatifs passionnés issue de Création Webson et Beavr. Mission: démocratiser la production vidéo haut de gamme.",
  },
};

export default function AboutPage() {
  const headerOffset = 120;

  return (
    <div>
      <section
        className="relative min-h-[70vh] w-full overflow-hidden"
        style={{ marginTop: `-${headerOffset}px`, paddingTop: `${headerOffset}px` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${bg.src})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/55" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center gap-10 px-6 py-20 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.45em] text-zinc-300">
              À PROPOS
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Nous sommes une coalition de créatifs{" "}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                passionnés
              </span>
              .
            </h1>
          </div>
          <div className="max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
            <p>
              Zéro huit est d'abord le résultat d'une fusion entre deux piliers de
              la production vidéo sur la Rive-Sud de Montréal, Création Webson et
              Beavr. S'y sont ensuite joints plusieurs créatifs passionnés en
              quête d'avancement. Notre mission est de démocratiser la production
              de vidéo haut de gamme; c'est pourquoi nous offrons à notre équipe
              les meilleurs outils sur le marché ainsi que l'espace nécessaire
              afin d'alimenter leur inspiration.
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-300"
            >
              Nos services <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-white py-20 text-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Jonathan Henderson",
                role: "Co-fondateur / Producteur",
                bio: "Vieux sage, mais pas trop. Tech geek. Acheteur compulsif. Buveur de café professionnel.",
                image: jo,
              },
              {
                name: "Cédrick Provost",
                role: "Co-fondateur / Réalisateur",
                bio: "Gear addict et Guru addict. A le “hmm.. on peut faire mieux” facile. Magicien à temps partiel. En crocs à temps plein.",
                image: cedric,
              },
              {
                name: "Xavier Provost",
                role: "Directeur de la photographie",
                bio: "Movie geek. Jamais besoin d'un Easy rig. Chasseur de poster. Trip un peu trop sur le F1.4 et le Vitamin Water.",
                image: xav,
              },
              {
                name: "Maxime Auclair",
                role: "Caméraman / Monteur",
                bio: "Plus sage que l vieux sage. Plus cinéphile que l Movie geek. Son rest face est imprévisible, mais sa créativité est toujours A1.",
                image: max,
              },
              {
                name: "Jean-Benoit Monnière",
                role: "Directeur des finances et opérations",
                bio: "Toqué des stats. Il voit mal les couleurs, mais voit très bien les chiffres. Athlète déterminé. Strava et ChatGPT sont de loin ses meilleurs amis.",
                image: jb,
              },
              {
                name: "Lev Rapoport",
                role: "Producteur",
                bio: "Caféinomane au coeur tendre, Samouraï cueilleur de fleurs et futur propriétaire de voitures exotiques. Il sait parler aux gens, mais le fait mieux en anglais.",
                image: lev,
              },
            ].map((member) => (
              <div key={member.name} className="max-w-sm">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                  <Image
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-zinc-600">{member.role}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{member.bio}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="max-w-sm">
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                <Image
                  src={will}
                  alt="William Cardinal"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-6 text-lg font-semibold">William Cardinal</h3>
              <p className="text-sm text-zinc-600">Monteur / Effets spéciaux</p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Fix it in post. N'aime pas les réflexions. Champion du lancé de
                saumon. Trépied humain. Meilleur ami de Larry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
