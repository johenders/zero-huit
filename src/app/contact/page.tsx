import Image from "next/image";
import { getUiDictionary } from "@/lib/i18n/server";
import { normalizeLocale, withLocaleHref } from "@/lib/i18n/shared";
import { headers } from "next/headers";
import { buildPageMetadata } from "@/lib/seo";

import batisse from "../../../assets/batisse.jpg";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  return buildPageMetadata({
    locale,
    path: "/contact",
    title: "Contact — Zéro huit",
    description:
      "Parlez-nous de votre projet vidéo. Coordonnées à Beauharnois et formulaire de demande de soumission.",
  });
}

export default async function ContactPage() {
  const headerOffset = 120;
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  const t = (key: string) => dictionary[key] ?? key;

  return (
    <section
      className="relative overflow-hidden bg-zinc-950 text-zinc-100"
      style={{ marginTop: `-${headerOffset}px`, paddingTop: `${headerOffset}px` }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="relative mx-auto grid min-h-[80vh] max-w-7xl items-stretch gap-10 px-6 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative overflow-hidden rounded-2xl bg-black/40">
          <Image
            src={batisse}
            alt={t("contact.image.alt")}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="flex flex-col justify-center gap-10">
          <div>
            <span className="text-xs font-semibold tracking-[0.45em] text-zinc-400">
              {t("contact.kicker")}
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {t("contact.title")}
            </h1>
            <p className="mt-4 text-sm text-zinc-300 sm:text-base">
              {t("contact.subtitle")}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              {t("contact.info.title")}
            </h2>
            <p className="mt-6 text-base leading-7 text-zinc-300">
              {t("contact.info.address")}
            </p>
            <p className="mt-3 text-base text-zinc-300">
              <a href="tel:14503951777" className="font-semibold text-white">
                (450) 395-1777
              </a>
            </p>
            <p className="mt-2 text-base text-zinc-300">
              <a href="mailto:info@zerohuit.ca" className="font-semibold text-white">
                info@zerohuit.ca
              </a>
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">
              {t("contact.card.title")}
            </h3>
            <p className="mt-3 text-sm text-zinc-300">
              {t("contact.card.body")}
            </p>
            <a
              href={withLocaleHref(locale, "/request")}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            >
              {t("contact.card.cta")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
