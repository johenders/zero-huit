"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { SectorPortfolio } from "@/content/secteurs/types";

/**
 * Portfolio : une pièce en vedette, pleine largeur, puis les autres en rangée
 * dessous — la disposition attendue sur un site professionnel.
 *
 * Le lecteur reste en façade : l'iframe Cloudflare n'est créée qu'au clic.
 * Cinq lecteurs chargés d'office bloqueraient le fil principal plusieurs
 * secondes. Une vidéo qui sort de l'écran repasse en vignette, sinon le son
 * continue depuis une carte qu'on ne voit plus.
 */

const posterUrl = (uid: string) =>
  `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=2s&height=720`;

const playerUrl = (uid: string) =>
  `https://iframe.videodelivery.net/${uid}?autoplay=true&muted=false&controls=true&preload=metadata`;

type TileProps = {
  uid: string;
  title?: string;
  index: number;
  sectorId: string;
  featured: boolean;
  isOpen: boolean;
  onPlay: () => void;
  playingRef: React.Ref<HTMLDivElement>;
};

function VideoTile({
  uid,
  title,
  index,
  sectorId,
  featured,
  isOpen,
  onPlay,
  playingRef,
}: TileProps) {
  return (
    <>
      <div
        ref={isOpen ? playingRef : undefined}
        className="relative aspect-video w-full overflow-hidden bg-[#0a0f14]"
      >
        {isOpen ? (
          <iframe
            src={playerUrl(uid)}
            title={title ?? `Vidéo ${index + 1}`}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            data-analytics-event="portfolio_play"
            data-analytics-sector={sectorId}
            aria-label={title ? `Lire : ${title}` : `Lire la vidéo ${index + 1}`}
            className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#5cc3d7]"
          >
            <Image
              src={posterUrl(uid)}
              alt=""
              fill
              unoptimized
              priority={featured}
              sizes={
                featured
                  ? "(min-width: 1024px) 64rem, 100vw"
                  : "(min-width: 1024px) 31rem, (min-width: 640px) 50vw, 100vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
            />
            <span className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/10 motion-reduce:transition-none" />

            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className={`flex items-center justify-center rounded-full border border-white/50 bg-black/30 backdrop-blur-sm transition duration-300 group-hover:border-[#8acd5f] group-hover:bg-black/50 motion-reduce:transition-none ${
                  featured ? "h-16 w-16" : "h-14 w-14"
                }`}
              >
                {/* Triangle de lecture, décalé pour paraître centré. */}
                <span
                  className={`block h-0 w-0 border-y-transparent border-l-white ${
                    featured
                      ? "ml-1 border-y-[10px] border-l-[17px]"
                      : "ml-0.5 border-y-[8px] border-l-[14px]"
                  }`}
                />
              </span>
            </span>
            {title ? (
              <>
                {/* Un voile discret, seulement sous la légende. */}
                <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0))]" />
                <span
                  className={`absolute inset-x-0 bottom-0 block text-left font-semibold tracking-[-0.01em] text-white ${
                    featured ? "p-6 text-base sm:text-lg" : "p-5 text-sm"
                  }`}
                >
                  {title}
                </span>
              </>
            ) : null}
          </button>
        )}
      </div>
    </>
  );
}

export function PortfolioGrid({
  portfolio,
  sectorId,
}: {
  portfolio: SectorPortfolio;
  sectorId: string;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const playingRef = useRef<HTMLDivElement | null>(null);

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

  const [featured, ...rest] = portfolio.items;

  return (
    <div>
      {/* La pièce en vedette, pleine largeur. */}
      <div className="mx-auto w-full max-w-5xl">
        <VideoTile
          uid={featured.uid}
          title={featured.title}
          index={0}
          sectorId={sectorId}
          featured
          isOpen={playing === featured.uid}
          onPlay={() => setPlaying(featured.uid)}
          playingRef={playingRef}
        />
      </div>

      {rest.length > 0 ? (
        /* Deux par rangée : les quatre autres restent lisibles au lieu d'être
           réduites à des vignettes. */
        <ul className="mx-auto mt-0 grid w-full max-w-5xl grid-cols-1 sm:grid-cols-2">
          {rest.map((item, position) => (
            <li key={item.uid}>
              <VideoTile
                uid={item.uid}
                title={item.title}
                index={position + 1}
                sectorId={sectorId}
                featured={false}
                isOpen={playing === item.uid}
                onPlay={() => setPlaying(item.uid)}
                playingRef={playingRef}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
