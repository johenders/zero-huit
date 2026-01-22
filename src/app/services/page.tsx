import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import bg from "../../../assets/bg/bg_services.jpg";
import planification from "../../../assets/services/planification.jpg";
import postProduction from "../../../assets/services/post_production.jpg";
import production from "../../../assets/services/production.jpg";

export const metadata: Metadata = {
  title: "Services — Zéro huit",
  description:
    "Solution vidéo complète: planification, production, post-production, montage, motion design et colorisation.",
  openGraph: {
    title: "Services — Zéro huit",
    description:
      "Solution vidéo complète: planification, production, post-production, montage, motion design et colorisation.",
  },
  twitter: {
    title: "Services — Zéro huit",
    description:
      "Solution vidéo complète: planification, production, post-production, montage, motion design et colorisation.",
  },
};

export default function ServicesPage() {
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
              SERVICES
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Nous offrons une solution vidéo{" "}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                complète.
              </span>
            </h1>
          </div>
          <div className="max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
            <p>
              Un projet vidéo peut être un processus complexe et les étapes de
              production ne sont pas toujours les mêmes d'une agence à une autre.
              Zéro huit cherche à devenir la référence pour la production vidéo
              et pour ce, nous croyons qu'il est important de créer des vidéos de
              qualité, mais aussi de le faire de façon simple et efficace.
            </p>
            <Link
              href="/portfolio"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-300"
            >
              Nos projets <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-zinc-900">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold text-zinc-800 sm:text-4xl">
              Planification
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600">
              Une production vidéo, ça commence toujours par une bonne
              planification. Nous évaluons d'abord les objectifs et la clientèle
              visée par le message que vous souhaitez passer. Puis, en
              travaillant de pair avec votre équipe, nous développons un concept
              original adapté à votre budget et nous déterminons les ressources
              nécessaires à la réalisation de ce projet.
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-3 text-sm text-zinc-500 sm:grid-cols-2">
              {[
                "Analyse des objectifs",
                "Découpage technique",
                "Séance de brainstorm",
                "Planification",
                "Écriture de scénario",
                "Repérage et casting",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-zinc-500">+</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
            <Image
              src={planification}
              alt="Planification"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-zinc-900 py-20 text-zinc-100">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
            <Image
              src={production}
              alt="Production"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Production
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-200">
              Silence plateau ! C'est maintenant l'heure du tournage. Toute
              l'équipe est réunie sur place afin de produire une vidéo de
              qualité qui présentera votre entreprise ou organisme sous son
              meilleur jour. Nous allons toujours avoir besoin d'un réalisateur
              et d'un directeur de la photographie afin de respecter la
              direction artistique, mais dépendamment du type de projet, nous
              aurons également sur place: de l'éclairage, un drone, un perchiste,
              des assistants, une maquilleuse, des acteurs et plus encore. Oui
              oui, tout ça afin de vous faire vivre une vraie expérience de
              plateau! Ça peut être saisissant au début, mais quand vient le
              temps de raconter votre histoire, il ne faut pas couper les coins
              ronds. 3, 2, 1 ACTION !!
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-3 text-sm text-zinc-300 sm:grid-cols-2">
              {[
                "Publicité",
                "Captation",
                "Vidéo corporative",
                "Images aériennes",
                "Événement",
                "Photographie",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-zinc-200">+</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-zinc-900">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold text-zinc-800 sm:text-4xl">
              Post-production
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600">
              Dernière étape. C'est le temps de s'isoler plusieurs heures afin
              d'habiller les images captées. Nous assemblons et découpons le
              tout, nous mixons le son, nous ajoutons de la musique, nous
              intégrons des titres, parfois du Motion design, nous balançons les
              couleurs, nous stylisons la colorisation et exportons votre vidéo
              dans un format adéquat pour son utilisation. Voilà! Vous avez
              maintenant un l'outil de communication la plus efficace et
              percutant dans votre arsenal Marketing; une vidéo soigneusement
              conçue et méticuleusement produite.
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-3 text-sm text-zinc-500 sm:grid-cols-2">
              {[
                "Montage vidéo",
                "Colorisation",
                "Montage sonore",
                "Motion design",
                "VFX",
                "Animation 2D et 3D",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-zinc-500">+</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
            <Image
              src={postProduction}
              alt="Post-production"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
