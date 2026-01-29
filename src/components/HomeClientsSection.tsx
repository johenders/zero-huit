"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/client";

import a30Logo from "../../assets/clients/a30.png";
import braqueLogo from "../../assets/clients/braque.png";
import ccqLogo from "../../assets/clients/ccq.png";
import cegepLogo from "../../assets/clients/cegep.png";
import cisssmoLogo from "../../assets/clients/cisssmo.png";
import cnesstLogo from "../../assets/clients/cnesst.png";
import desjardinsLogo from "../../assets/clients/desjardins.png";
import foodtasticLogo from "../../assets/clients/foodtastic.png";
import hecLogo from "../../assets/clients/hec.png";
import patriotesLogo from "../../assets/clients/patriotes.png";
import phaneufLogo from "../../assets/clients/phaneuf.png";
import regatesLogo from "../../assets/clients/regates.png";
import saqLogo from "../../assets/clients/saq.png";
import skyspaLogo from "../../assets/clients/skyspa.png";
import valleyfieldLogo from "../../assets/clients/valleyfield.png";
import zelLogo from "../../assets/clients/zel.png";

const logos = [
  { src: a30Logo, alt: "A30 Express" },
  { src: cisssmoLogo, alt: "CISSSMO" },
  { src: cnesstLogo, alt: "CNESST" },
  { src: ccqLogo, alt: "Centre de services sociaux des Patriotes" },
  { src: desjardinsLogo, alt: "Desjardins" },
  { src: hecLogo, alt: "HEC Montreal" },
  { src: valleyfieldLogo, alt: "Valleyfield" },
  { src: foodtasticLogo, alt: "Foodtastic" },
  { src: saqLogo, alt: "SAQ" },
  { src: zelLogo, alt: "Zel" },
  { src: regatesLogo, alt: "Regates Valleyfield" },
  { src: braqueLogo, alt: "Braque" },
  { src: patriotesLogo, alt: "Patriotes" },
  { src: cegepLogo, alt: "Cegep de Valleyfield" },
  { src: skyspaLogo, alt: "Skyspa" },
  { src: phaneufLogo, alt: "Phaneuf" },
];

export function HomeClientsSection() {
  const { t } = useI18n();
  return (
    <section className="bg-zinc-950 py-20 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 sm:px-6">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_2.5fr] lg:items-center">
          <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl text-center lg:text-left">
            {t("home.clients.title.prefix")}{" "}
            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
              {t("home.clients.title.highlight")}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-12">
            {logos.map((logo) => (
              <div key={logo.alt} className="flex items-center justify-center">
                <div className="relative h-24 w-64 sm:h-28 sm:w-72">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain"
                    sizes="144px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
