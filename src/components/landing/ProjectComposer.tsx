"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SectorIcon, type SectorIconName } from "@/components/landing/SectorIcons";
import { trackEvent } from "@/lib/analytics";

type Service = {
  icon: SectorIconName;
  title: string;
  examples: readonly string[];
};

/**
 * « Composez votre projet ».
 *
 * Le visiteur coche ce qui le concerne ; la page lui renvoie la liste des
 * livrables correspondants et transporte sa sélection jusqu'au formulaire.
 *
 * Ce n'est pas un gadget : la métrique de cette page est le nombre de
 * demandes QUALIFIÉES. Un prospect qui arrive au formulaire avec ses besoins
 * déjà nommés vaut beaucoup plus qu'un clic anonyme.
 *
 * Aucune valeur inventée : les livrables affichés sont exactement ceux
 * déclarés dans le contenu des services.
 */
export function ProjectComposer({
  services,
  ctaLabel,
  ctaHref,
  sectorId,
  labels,
}: {
  services: readonly Service[];
  ctaLabel: string;
  ctaHref: string;
  sectorId: string;
  labels: {
    prompt: string;
    empty: string;
    summaryTitle: string;
    deliverables: string;
    reset: string;
  };
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (title: string) => {
    setSelected((current) => {
      const next = current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title];
      trackEvent("composer_toggle", {
        sector: sectorId,
        service: title,
        selected_count: next.length,
      });
      return next;
    });
  };

  const deliverables = useMemo(() => {
    const merged = services
      .filter((service) => selected.includes(service.title))
      .flatMap((service) => service.examples);
    return [...new Set(merged)];
  }, [selected, services]);

  const href = useMemo(() => {
    if (selected.length === 0) return ctaHref;
    const params = new URLSearchParams({ besoins: selected.join(" · ") });
    return `${ctaHref}${ctaHref.includes("?") ? "&" : "?"}${params.toString()}`;
  }, [ctaHref, selected]);

  return (
    <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.04] p-7 text-left sm:p-9">
      <p className="text-sm font-black uppercase leading-6 text-white">{labels.prompt}</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {services.map((service) => {
          const isOn = selected.includes(service.title);
          return (
            <button
              key={service.title}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(service.title)}
              className={`flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7] ${
                isOn
                  ? "border-[#8acd5f]/60 bg-[#8acd5f]/15 text-white"
                  : "border-white/12 bg-black/25 text-zinc-400 hover:border-white/30 hover:text-white"
              }`}
            >
              <SectorIcon
                name={service.icon}
                className={`h-4 w-4 shrink-0 ${isOn ? "text-[#8acd5f]" : "text-zinc-500"}`}
              />
              {service.title}
              <span aria-hidden="true" className={isOn ? "text-[#8acd5f]" : "text-zinc-600"}>
                {isOn ? "−" : "+"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Zone de réponse : hauteur réservée, annoncée aux lecteurs d'écran. */}
      <div
        aria-live="polite"
        className="mt-8 min-h-[9rem] border-t border-white/10 pt-7"
      >
        {selected.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-500">{labels.empty}</p>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8acd5f]">
              {labels.summaryTitle}
            </p>
            <p className="mt-3 text-base font-bold leading-7 text-white">
              {selected.join(" · ")}
            </p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              {labels.deliverables} ({deliverables.length})
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {deliverables.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-xs leading-5 text-zinc-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-white/10 pt-7">
        <Link
          href={href}
          data-analytics-event="cta_primary_click"
          data-analytics-sector={sectorId}
          data-analytics-position="composer"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-7 py-3.5 text-sm font-black uppercase text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5cc3d7]"
        >
          {ctaLabel}
        </Link>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-sm font-semibold text-zinc-400 underline underline-offset-4 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5cc3d7]"
          >
            {labels.reset}
          </button>
        ) : null}
      </div>
    </div>
  );
}
