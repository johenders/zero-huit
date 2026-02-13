import Image from "next/image";

import btsOne from "../../assets/bts/DSCF2233.jpg";
import btsTwo from "../../assets/bts/DSCF7468.jpg";
import btsThree from "../../assets/bts/IMG_7132.jpg";

const cards = [
  {
    image: btsOne,
    title: "créatif",
    description:
      "Une direction artistique solide pour créer des contenus justes, pertinents et pensés pour vos enjeux de communication.",
    panelClass: "bg-[#5cc3d7]",
    alt: "Équipe en tournage sur le terrain",
  },
  {
    image: btsTwo,
    title: "rapide",
    description:
      "Des processus efficaces et une équipe agile pour livrer rapidement, sans compromettre la qualité ni la stratégie.",
    panelClass: "bg-[#39c193]",
    alt: "Équipe en réunion autour d'une table",
  },
  {
    image: btsThree,
    title: "flexible",
    description:
      "Une structure légère qui s’adapte à vos réalités, vos échéanciers et l’évolution constante de vos projets.",
    panelClass: "bg-[#8acd5f]",
    alt: "Discussion client en environnement de travail",
  },
] as const;

export function MadeToFlexSection() {
  return (
    <section className="relative z-10 bg-[#0f1f1b] py-24 text-white">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h3 className="text-center text-[2.5rem] font-semibold leading-tight text-white sm:text-[3.1rem] lg:text-[4rem]">
          Pens&#233; pour suivre l&#8217;&#233;lan de
          <br />
          <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-extrabold text-transparent">
            vos projets
          </span>
        </h3>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              tabIndex={0}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
              </div>

              <div
                className={`absolute inset-x-0 bottom-0 overflow-hidden text-white ${card.panelClass} transition-[height] duration-500 ease-out md:h-[5.5rem] md:group-hover:h-44 md:group-focus-within:h-44`}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <h4 className="text-2xl sm:text-3xl">
                    <span className="font-normal">On est </span>
                    <span className="font-bold italic">{card.title}</span>
                  </h4>
                  <span className="ml-4 text-2xl">
                    ⌃
                  </span>
                </div>
                <p className="px-6 pb-5 text-sm leading-6 text-white/95 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-300 md:group-hover:max-h-28 md:group-hover:opacity-100 md:group-focus-within:max-h-28 md:group-focus-within:opacity-100">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
