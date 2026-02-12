import Image from "next/image";

import btsTwo from "../../assets/bts/DSCF7468.jpg";
import btsThree from "../../assets/bts/IMG_7132.jpg";

export function MadeToFlexSection() {
  return (
    <section className="relative z-10 mt-24 bg-[#0f1f1b] text-white">
      <div className="relative h-[80vh] w-full">
        <div className="absolute inset-0 grid gap-0 lg:grid-cols-3">
          {[
            {
              image: "/assets/bts/DSCF2233.jpg",
              title: "créatif",
              description:
                "Une direction artistique solide pour créer des contenus justes, pertinents et pensés pour vos enjeux de communication.",
              panelClass: "bg-[#5cc3d7] text-white",
            },
            {
              image: btsTwo,
              title: "rapide",
              description:
                "Des processus efficaces et une équipe agile pour livrer rapidement, sans compromettre la qualité ni la stratégie.",
              panelClass: "bg-[#39c193] text-white",
            },
            {
              image: btsThree,
              title: "flexible",
              description:
                "Une structure légère qui s’adapte à vos réalités, vos échéanciers et l’évolution constante de vos projets.",
              panelClass: "bg-[#8acd5f] text-white",
            },
          ].map((card) => (
            <div key={card.title} className="group relative overflow-hidden">
              <div className="relative h-full w-full">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/12" />
              </div>
              <div className="absolute inset-0 flex items-end">
                <div
                  className={`relative z-10 flex h-[10%] w-full flex-col justify-start px-6 py-5 transition-all duration-500 ease-in-out ${card.panelClass} overflow-hidden group-hover:h-[24%]`}
                >
                  <h4 className="text-2xl text-white sm:text-3xl">
                    <span className="font-normal">On est </span>
                    <span className="font-bold italic">{card.title}</span>
                  </h4>
                  <p className="mt-3 max-h-0 overflow-hidden text-sm leading-6 text-white/90 opacity-0 transition-all duration-300 group-hover:max-h-28 group-hover:opacity-100">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/90 via-black/55 to-transparent" />

        <div className="absolute inset-x-0 top-10 px-[9vw] text-left">
          <h3 className="mt-4 text-[2.5rem] font-semibold leading-tight text-white sm:text-[3.1rem] lg:text-[4rem]">
            Pens&#233; pour suivre l&#8217;&#233;lan de
            <br />
            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-extrabold text-transparent text-[1.2em]">
              vos projets
            </span>
          </h3>
        </div>
      </div>
    </section>
  );
}
