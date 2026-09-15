"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { StreamVideo } from "@/components/organismes/StreamVideo";

export type ProjectVideo = {
  uid: string;
  caption?: string;
  posterTime?: number;
};

const PAGE_SIZE = 6;
const thumbnail = (video: ProjectVideo) =>
  `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${video.posterTime ?? 2}s&height=720`;

export function ProjectVideoGallery({
  videos,
  organisation,
}: {
  videos: readonly ProjectVideo[];
  organisation: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const headingId = useId();
  const galleryId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h4
        id={headingId}
        className="mb-7 text-xl font-semibold tracking-[-0.025em] text-[#403f3c] sm:mb-9 sm:text-2xl"
      >
        Le projet en vidéo
      </h4>

      <ul
        id={galleryId}
        className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-9"
        onPlayCapture={(event) => {
          // Une seule voix à la fois, même si plusieurs capsules sont ouvertes.
          if (!(event.target instanceof HTMLVideoElement)) return;
          event.currentTarget.querySelectorAll("video").forEach((player) => {
            if (player !== event.target) player.pause();
          });
        }}
      >
        {videos.slice(0, visible).map((video, index) => {
          const label = video.caption ?? `Vidéo ${index + 1}`;
          return (
            <li key={video.uid}>
              <figure>
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#E2DCD0] shadow-[0_3px_16px_-8px_rgba(74,57,36,0.18)] sm:rounded-[1.25rem]">
                  <StreamVideo
                    uid={video.uid}
                    title={`${organisation} — ${label}`}
                    ariaLabel={`Regarder ${label} — ${organisation}`}
                    poster={thumbnail(video)}
                  >
                    <Image
                      src={thumbnail(video)}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF7EF]/95 text-[#57513F] shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-[#FAF7EF] sm:h-16 sm:w-16 motion-reduce:transition-none">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="ml-0.5 h-6 w-6"
                        >
                          <path d="M9 6.5v11a.6.6 0 0 0 .92.5l8.2-5.5a.6.6 0 0 0 0-1l-8.2-5.5A.6.6 0 0 0 9 6.5Z" />
                        </svg>
                      </span>
                    </span>
                  </StreamVideo>
                </div>
                {video.caption ? (
                  <figcaption className="mt-3 px-1 text-sm leading-relaxed text-[#696257]">
                    {video.caption}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          );
        })}
      </ul>

      {visible < videos.length ? (
        <div className="mt-9 flex justify-center sm:mt-12">
          <button
            type="button"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
            aria-controls={galleryId}
            className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#B9B09F]/60 px-6 py-3 text-sm font-medium text-[#57513F] transition-colors hover:border-[#8E9980] hover:bg-[#E5E9DC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65784D] motion-reduce:transition-none"
          >
            Voir plus de vidéos
            <span aria-hidden="true" className="text-lg leading-none">+</span>
          </button>
        </div>
      ) : null}
      <p role="status" className="sr-only">
        {Math.min(visible, videos.length)} vidéos affichées sur {videos.length}
      </p>
    </section>
  );
}
