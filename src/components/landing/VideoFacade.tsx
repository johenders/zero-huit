"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { trackEvent, VIDEO_PROGRESS_THRESHOLDS } from "@/lib/analytics";

type Props = {
  uid: string;
  title: string;
  durationSeconds: number;
  posterAlt: string;
  /** Contraintes de production nommées à côté de la vidéo. */
  productionNotes: readonly string[];
  transcript: string;
  hasCaptions: boolean;
  /** `metadata` au-dessus de la ligne de flottaison, `none` en dessous. */
  preload?: "metadata" | "none";
  /** Identifiant d'analytique, pour distinguer les vidéos entre elles. */
  trackingId: string;
};

type StreamPlayer = {
  addEventListener: (type: string, handler: () => void) => void;
  currentTime: number;
  duration: number;
};

declare global {
  interface Window {
    Stream?: (iframe: HTMLIFrameElement) => StreamPlayer;
  }
}

const STREAM_SDK_SRC = "https://embed.cloudflarestream.com/embed/sdk.latest.js";

function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

/**
 * Lecteur en « facade pattern » : aucune iframe tierce n'est chargée tant que
 * l'usager n'a pas cliqué. Un embed chargé d'office bloque le fil principal
 * plus de 1,7 s et dégrade l'INP.
 */
export function VideoFacade({
  uid,
  title,
  durationSeconds,
  posterAlt,
  productionNotes,
  transcript,
  hasCaptions,
  preload = "none",
  trackingId,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const reachedRef = useRef<Set<number>>(new Set());

  const posterSrc = `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=2s&height=720`;

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    trackEvent("video_play", { video_id: trackingId, video_title: title });
  }, [title, trackingId]);

  // Le SDK Cloudflare n'est chargé qu'après le clic : aucun coût au chargement.
  useEffect(() => {
    if (!isPlaying) return;
    let cancelled = false;

    const attach = () => {
      const iframe = iframeRef.current;
      if (cancelled || !iframe || typeof window.Stream !== "function") return;
      try {
        const player = window.Stream(iframe);
        player.addEventListener("timeupdate", () => {
          const total = player.duration || durationSeconds;
          if (!total) return;
          const percent = (player.currentTime / total) * 100;
          for (const threshold of VIDEO_PROGRESS_THRESHOLDS) {
            if (percent >= threshold && !reachedRef.current.has(threshold)) {
              reachedRef.current.add(threshold);
              trackEvent("video_progress", {
                video_id: trackingId,
                video_title: title,
                percent: threshold,
              });
            }
          }
        });
      } catch {
        // Le suivi de progression est optionnel ; la lecture reste fonctionnelle.
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${STREAM_SDK_SRC}"]`,
    );
    if (existing) {
      if (window.Stream) attach();
      else existing.addEventListener("load", attach, { once: true });
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = STREAM_SDK_SRC;
    script.async = true;
    script.addEventListener("load", attach, { once: true });
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [durationSeconds, isPlaying, title, trackingId]);

  const playerSrc = `https://iframe.videodelivery.net/${uid}?autoplay=true&muted=false&loop=false&controls=true&preload=${preload}&defaultTextTrack=fr`;

  return (
    <figure className="m-0">
      {/* aspect-video réserve l'espace : décalage de mise en page nul. */}
      <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black">
        {isPlaying ? (
          <iframe
            ref={iframeRef}
            className="absolute inset-0 h-full w-full"
            src={playerSrc}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]"
            aria-label={`Lire la vidéo : ${title}. Durée ${formatDuration(durationSeconds)}.`}
          >
            <Image
              src={posterSrc}
              alt={posterAlt}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              unoptimized
            />
            {/* Voile à opacité fixe : contraste garanti quelle que soit l'image. */}
            <span className="absolute inset-0 bg-black/45 transition group-hover:bg-black/35" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 transition group-hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1 h-7 w-7 fill-white"
                  aria-hidden="true"
                >
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              </span>
            </span>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white">
              {formatDuration(durationSeconds)}
            </span>
          </button>
        )}
      </div>

      <figcaption className="mt-4">
        <p className="text-sm font-bold uppercase leading-6 text-white">{title}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8acd5f]">
          {formatDuration(durationSeconds)}
          {hasCaptions ? " · Sous-titres français" : null}
        </p>
        <ul className="mt-4 grid gap-2">
          {productionNotes.map((note) => (
            <li key={note} className="flex gap-3 text-sm leading-6 text-zinc-300">
              <span aria-hidden="true" className="mt-2 h-1 w-4 shrink-0 bg-[#5cc3d7]" />
              {note}
            </li>
          ))}
        </ul>
      </figcaption>

      {/* Transcription : dans le DOM (donc indexable et lisible sans lecture). */}
      <details className="mt-4 rounded-lg border border-white/10 bg-white/[0.03]">
        <summary className="cursor-pointer px-5 py-3 text-sm font-bold uppercase text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]">
          Transcription
        </summary>
        <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-zinc-300">
          {transcript.split("\n").map((paragraph) => (
            <p key={paragraph} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </details>
    </figure>
  );
}
