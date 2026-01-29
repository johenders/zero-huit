import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getUiDictionary } from "@/lib/i18n/server";
import { withLocaleHref } from "@/lib/i18n/shared";

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

export async function AboutPage({ locale }: { locale: "fr" | "en" }) {
  const headerOffset = 120;
  const dictionary = await getUiDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;

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
              {t("about.kicker")}
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {t("about.title")}{" "}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                {t("about.title.highlight")}
              </span>
              .
            </h1>
          </div>
          <div className="max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
            <p>{t("about.body")}</p>
            <Link
              href={withLocaleHref(locale, "/services")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-300"
            >
              {t("about.cta")} <span aria-hidden="true">→</span>
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
                role: t("about.team.jonathan.role"),
                bio: t("about.team.jonathan.bio"),
                image: jo,
              },
              {
                name: "Cédrick Provost",
                role: t("about.team.cedric.role"),
                bio: t("about.team.cedric.bio"),
                image: cedric,
              },
              {
                name: "Xavier Provost",
                role: t("about.team.xavier.role"),
                bio: t("about.team.xavier.bio"),
                image: xav,
              },
              {
                name: "Maxime Auclair",
                role: t("about.team.max.role"),
                bio: t("about.team.max.bio"),
                image: max,
              },
              {
                name: "Jean-Benoit Monnière",
                role: t("about.team.jb.role"),
                bio: t("about.team.jb.bio"),
                image: jb,
              },
              {
                name: "Lev Rapoport",
                role: t("about.team.lev.role"),
                bio: t("about.team.lev.bio"),
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
              <p className="text-sm text-zinc-600">{t("about.team.will.role")}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {t("about.team.will.bio")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function AboutPageDefault() {
  return AboutPage({ locale: "fr" });
}
