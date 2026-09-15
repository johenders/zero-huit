"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { SectorPortfolio } from "@/content/secteurs/types";

/**
 * Portfolio en pile de cartes.
 *
 * Chaque carte est collante avec un décalage qui croît d'une carte à l'autre :
 * en défilant, celle du dessus reste en place pendant que la suivante vient se
 * poser par-dessus, et les précédentes restent visibles en tranches. Les marges
 * négatives font se chevaucher les cartes — c'est ce qui garde la section à
 * environ deux écrans et demi au lieu de quatre.
 *
 * Aucun JavaScript de défilement : la pile est du `position: sticky`, et le
 * léger retrait des cartes enfouies passe par `animation-timeline`, déjà
 * utilisé ailleurs dans le projet et doublement protégé (mouvement réduit et
 * absence de prise en charge).
 *
 * Le lecteur reste en façade : l'iframe n'est créée qu'au clic, et une carte
 * qui sort de l'écran repasse en vignette — sinon le son continue depuis une
 * carte qu'on ne voit plus.
 */

const posterUrl = (uid: string) =>
  `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=2s&height=720`;

const playerUrl = (uid: string) =>
  `https://iframe.videodelivery.net/${uid}?autoplay=true&muted=false&controls=true&preload=metadata`;

export function PortfolioStack({
  portfolio,
  sectorId,
}: {
  portfolio: SectorPortfolio;
  sectorId: string;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const playingRef = useRef<HTMLLIElement | null>(null);

  /** Une vidéo qu'on ne voit plus s'arrête. */
  useEffect(() => {
    const node = playingRef.current;
    if (!playing || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.every((entry) => !entry.isIntersecting)) setPlaying(null);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [playing]);

  const total = portfolio.items.length;

  return (
    <ol className="mx-auto w-full max-w-5xl">
      {portfolio.items.map((item, index) => {
        const isOpen = playing === item.uid;
        return (
          <li
            key={item.uid}
            ref={isOpen ? playingRef : undefined}
            /* Le décalage croissant laisse dépasser les cartes du dessous. */
            style={{ top: `calc(7vh + ${index * 12}px)` }}
            className={`sticky ${index > 0 ? "mt-[-22vh] sm:mt-[-24vh]" : ""}`}
          >
            <article className="zh-stack relative h-[52vh] min-h-[17rem] w-full overflow-hidden rounded-2xl bg-[#0a0f14] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:h-[56vh]">
              {isOpen ? (
                <iframe
                  src={playerUrl(item.uid)}
                  title={item.title ?? `Vidéo ${index + 1}`}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(item.uid)}
                  data-analytics-event="portfolio_play"
                  data-analytics-sector={sectorId}
                  aria-label={
                    item.title ? `Lire : ${item.title}` : `Lire la vidéo ${index + 1}`
                  }
                  className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#5cc3d7]"
                >
                  <Image
                    src={posterUrl(item.uid)}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 64rem, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none"
                  />
                  {/* Le voile ne mord que le tiers inférieur : l'image reste la pièce. */}
                  <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.30)_22%,rgba(0,0,0,0.02)_45%)]" />

                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/35 bg-black/25 backdrop-blur-sm transition duration-300 group-hover:border-[#8acd5f] group-hover:bg-black/45 motion-reduce:transition-none">
                      <span className="ml-1 block h-0 w-0 border-y-[10px] border-l-[17px] border-y-transparent border-l-white" />
                    </span>
                  </span>

                  <span className="absolute inset-x-0 bottom-0 flex items-baseline gap-4 p-6 text-left sm:p-8">
                    <span className="font-mono text-xs font-bold tabular-nums tracking-[0.2em] text-[#8acd5f]">
                      {String(index + 1).padStart(2, "0")}
                      <span className="text-white/30">
                        {" / "}
                        {String(total).padStart(2, "0")}
                      </span>
                    </span>
                    {item.title ? (
                      <span className="text-sm font-bold uppercase tracking-[0.18em] text-white sm:text-base">
                        {item.title}
                      </span>
                    ) : null}
                  </span>
                </button>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
