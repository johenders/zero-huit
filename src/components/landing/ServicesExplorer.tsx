"use client";

import { useCallback, useRef, useState } from "react";

import { SectorIcon, type SectorIconName } from "@/components/landing/SectorIcons";
import { trackEvent } from "@/lib/analytics";

type Service = {
  icon: SectorIconName;
  title: string;
  body: string;
  examplesLabel: string;
  examples: readonly string[];
};

/**
 * Explorateur de services en onglets.
 *
 * Huit services affichés en cartes, c'est un mur. En onglets, le visiteur
 * choisit ce qui le concerne et lit un seul panneau à la fois.
 *
 * Contraintes respectées :
 *  · Tous les panneaux sont rendus côté serveur et présents dans le DOM.
 *    Ils sont masqués par l'attribut `hidden`, jamais retirés — le contenu
 *    reste indexable et lisible sans JavaScript.
 *  · Navigation au clavier complète (flèches, Origine, Fin) selon le motif
 *    ARIA « tabs ».
 *  · Hauteur minimale réservée : aucun décalage de mise en page au changement
 *    d'onglet.
 */
export function ServicesExplorer({
  services,
  sectorId,
}: {
  services: readonly Service[];
  sectorId: string;
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = useCallback(
    (index: number) => {
      setActive(index);
      trackEvent("service_tab_open", {
        sector: sectorId,
        service: services[index]?.title,
      });
    },
    [sectorId, services],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = services.length - 1;
      let next: number | null = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = index === last ? 0 : index + 1;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = index === 0 ? last : index - 1;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = last;
      }
      if (next === null) return;
      event.preventDefault();
      select(next);
      tabRefs.current[next]?.focus();
    },
    [select, services.length],
  );

  return (
    <div className="mt-14 grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
      <div
        role="tablist"
        aria-label="Nos services"
        aria-orientation="vertical"
        className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap"
      >
        {services.map((service, index) => {
          const isActive = index === active;
          return (
            <button
              key={service.title}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`service-tab-${index}`}
              aria-selected={isActive}
              aria-controls={`service-panel-${index}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-left text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7] lg:rounded-lg lg:px-5 lg:py-3.5 ${
                isActive
                  ? "border-[#5cc3d7]/60 bg-[#5cc3d7]/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              <SectorIcon
                name={service.icon}
                className={`h-5 w-5 shrink-0 ${isActive ? "text-[#5cc3d7]" : "text-zinc-500"}`}
              />
              <span className="leading-5">{service.title}</span>
            </button>
          );
        })}
      </div>

      {/* Hauteur réservée : le panneau ne fait pas sauter la page. */}
      <div className="min-h-[22rem]">
        {services.map((service, index) => (
          <section
            key={service.title}
            role="tabpanel"
            id={`service-panel-${index}`}
            aria-labelledby={`service-tab-${index}`}
            hidden={index !== active}
            tabIndex={0}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
              <SectorIcon name={service.icon} />
            </span>
            <h3 className="mt-6 text-2xl font-black uppercase leading-tight text-white">
              {service.title}
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              {service.body}
            </p>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#8acd5f]">
              {service.examplesLabel}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {service.examples.map((example) => (
                <li
                  key={example}
                  className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm leading-5 text-zinc-300"
                >
                  {example}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
