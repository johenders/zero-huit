import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getUiDictionary } from "@/lib/i18n/server";
import { normalizeLocale, withLocaleHref } from "@/lib/i18n/shared";
import { headers } from "next/headers";

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

export default async function ServicesPage() {
  const headerOffset = 120;
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
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
              {t("services.kicker")}
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {t("services.title")}{" "}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                {t("services.title.highlight")}
              </span>
            </h1>
          </div>
          <div className="max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
            <p>{t("services.body")}</p>
            <Link
              href={withLocaleHref(locale, "/portfolio")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-300"
            >
              {t("services.cta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 text-zinc-900">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold text-zinc-800 sm:text-4xl">
              {t("services.plan.title")}
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600">
              {t("services.plan.body")}
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-3 text-sm text-zinc-500 sm:grid-cols-2">
              {[
                t("services.plan.item1"),
                t("services.plan.item2"),
                t("services.plan.item3"),
                t("services.plan.item4"),
                t("services.plan.item5"),
                t("services.plan.item6"),
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
              {t("services.prod.title")}
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-200">
              {t("services.prod.body")}
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-3 text-sm text-zinc-300 sm:grid-cols-2">
              {[
                t("services.prod.item1"),
                t("services.prod.item2"),
                t("services.prod.item3"),
                t("services.prod.item4"),
                t("services.prod.item5"),
                t("services.prod.item6"),
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
              {t("services.post.title")}
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600">
              {t("services.post.body")}
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-3 text-sm text-zinc-500 sm:grid-cols-2">
              {[
                t("services.post.item1"),
                t("services.post.item2"),
                t("services.post.item3"),
                t("services.post.item4"),
                t("services.post.item5"),
                t("services.post.item6"),
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
