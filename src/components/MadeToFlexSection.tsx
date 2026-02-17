"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/client";

import btsOne from "../../assets/bts/DSCF2233.jpg";
import btsTwo from "../../assets/bts/DSCF7468.jpg";
import btsThree from "../../assets/bts/IMG_7132.jpg";

const cards = [
  {
    image: btsOne,
    titleKey: "rive.flex.card1.title",
    descriptionKey: "rive.flex.card1.description",
    panelClass: "bg-[#5cc3d7]",
    altKey: "rive.flex.card1.alt",
  },
  {
    image: btsTwo,
    titleKey: "rive.flex.card2.title",
    descriptionKey: "rive.flex.card2.description",
    panelClass: "bg-[#39c193]",
    altKey: "rive.flex.card2.alt",
  },
  {
    image: btsThree,
    titleKey: "rive.flex.card3.title",
    descriptionKey: "rive.flex.card3.description",
    panelClass: "bg-[#8acd5f]",
    altKey: "rive.flex.card3.alt",
  },
] as const;

export function MadeToFlexSection() {
  const { t } = useI18n();

  return (
    <section className="relative z-10 bg-[#0f1f1b] py-24 text-white">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h3 className="text-center text-[2.5rem] font-semibold leading-tight text-white sm:text-[3.1rem] lg:text-[4rem]">
          {t("rive.flex.title.line1")}
          <br />
          <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-extrabold text-transparent">
            {t("rive.flex.title.line2")}
          </span>
        </h3>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.titleKey}
              tabIndex={0}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={card.image}
                  alt={t(card.altKey)}
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
                    <span className="font-normal">{t("rive.flex.card.prefix")} </span>
                    <span className="font-bold italic">{t(card.titleKey)}</span>
                  </h4>
                  <span className="ml-4 text-2xl">
                    ⌃
                  </span>
                </div>
                <p className="px-6 pb-5 text-sm leading-6 text-white/95 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-300 md:group-hover:max-h-28 md:group-hover:opacity-100 md:group-focus-within:max-h-28 md:group-focus-within:opacity-100">
                  {t(card.descriptionKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
