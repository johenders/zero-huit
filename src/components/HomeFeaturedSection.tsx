"use client";

import { useState } from "react";
import Link from "next/link";
import { cloudflareThumbnailSrc } from "@/lib/cloudflare";
import type { Video } from "@/lib/types";

type Props = {
  featuredVideos: Video[];
};

export function HomeFeaturedSection({ featuredVideos }: Props) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <section className="bg-white py-20 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="text-left text-xs font-bold uppercase tracking-[0.4em] text-[#8acd5f]">
          Z&#201;RO QUOI?
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
              <span className="block">Nous sommes</span>
              <span className="block">
                une agence{" "}
                <span className="font-normal italic text-zinc-700">lean</span>
              </span>
            </h2>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900"
            >
              Notre &#233;quipe
              <span aria-hidden className="text-lg">
                &#8594;
              </span>
            </Link>
          </div>
          <div className="space-y-4 text-sm leading-7 text-zinc-600">
            <p>
              Z&#233;ro huit offre un service de production vid&#233;o haut de gamme
              pour les entreprises et organismes de la Rive-Sud de Montr&#233;al.
            </p>
            <p>
              Pourquoi <span className="italic">lean</span>? Le terme{" "}
              <span className="italic">lean</span> est associ&#233; &#224; des principes
              et des m&#233;thodes visant &#224; optimiser les processus, &#224; &#233;liminer
              les gaspillages et &#224; am&#233;liorer l&#39;efficacit&#233;. Ici, on fait
              r&#233;f&#233;rence &#224; une petite &#233;quipe polyvalente qui maximise la
              cr&#233;ation de projet &#224; l&#39;interne.
            </p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVideos.map((video) => {
            const typeLabel =
              video.taxonomies.find((taxonomy) => taxonomy.kind === "type")?.label ??
              "Vid&#233;o";
            return (
              <button
                key={video.id}
                className="group relative overflow-hidden rounded-2xl bg-zinc-100 text-left shadow-lg"
                type="button"
                onClick={() => setActiveVideo(video)}
              >
                <div className="relative aspect-[4/5] w-full">
                  <img
                    src={cloudflareThumbnailSrc(
                      video.cloudflare_uid,
                      video.thumbnail_time_seconds ?? 1,
                      1200,
                    )}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-6 bottom-6 text-center text-white">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/80">
                      {typeLabel}
                    </div>
                    <div className="mt-2 text-lg font-semibold">{video.title}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-10 flex justify-center">
          <a
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5"
          >
            Tous nos projets
          </a>
        </div>
      </div>
      {activeVideo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 bg-zinc-950 px-4 py-3">
              <div className="truncate text-sm font-medium text-white">
                {activeVideo.title}
              </div>
              <button
                className="rounded-md px-2 py-1 text-sm text-zinc-200 hover:bg-white/10"
                onClick={() => setActiveVideo(null)}
                type="button"
              >
                Fermer
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://iframe.videodelivery.net/${activeVideo.cloudflare_uid}?autoplay=true&muted=false&loop=false&controls=true&preload=true&quality=1080`}
                allow="autoplay; fullscreen"
                allowFullScreen
                title={activeVideo.title}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
