"use client";

import { useState } from "react";

const videoId = "0c63337d4f672f4dd6e39853d1d94301";
const heroVideoSrc = `https://iframe.videodelivery.net/${videoId}?autoplay=true&muted=true&loop=true&controls=false&preload=true&quality=1080`;
const modalVideoSrc = `https://iframe.videodelivery.net/${videoId}?autoplay=true&muted=false&loop=false&controls=true&preload=true&quality=1080`;

export function HomeHero() {
  const [isOpen, setIsOpen] = useState(false);
  const headerOffset = 120;

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <iframe
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "100vw",
            height: "100vh",
            minWidth: "177.78vh",
            minHeight: "56.25vw",
          }}
          src={heroVideoSrc}
          title="Video de fond"
          allow="autoplay; fullscreen"
        />
      </div>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center"
        style={{
          minHeight: `calc(100vh - ${headerOffset}px)`,
          marginTop: `${headerOffset}px`,
        }}
      >
          <h1 className="text-6xl font-semibold text-white sm:text-7xl lg:text-8xl">
            Vous m&#233;ritez d&#39;&#234;tre{" "}
            <span className="block bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
              remarqu&#233;.
            </span>
          </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm uppercase tracking-[0.2em] text-zinc-200">
          <span>Vid&#233;o corporative</span>
          <span>Publicit&#233;</span>
          <span>Captation</span>
          <span>Motion design</span>
          <span>Photographie</span>
        </div>
        <button
          className="mt-10 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition hover:bg-white/25"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Lire la video"
        >
          <svg
            aria-hidden
            className="h-6 w-6 translate-x-[1px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7-11-7z" />
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black">
            <button
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer la video"
            >
              <svg
                aria-hidden
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={modalVideoSrc}
                title="Video principale"
                allow="autoplay; fullscreen"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
