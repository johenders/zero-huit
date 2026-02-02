"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Video } from "@/lib/types";
import { cloudflarePreviewIframeSrc, cloudflareThumbnailSrc } from "@/lib/cloudflare";
import { useI18n } from "@/lib/i18n/client";

type Props = {
  videos: Video[];
};

function FeaturedVideoCard({
  video,
  onOpen,
  priority = false,
}: {
  video: Video;
  onOpen: (video: Video) => void;
  priority?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useI18n();
  const previewStart = video.thumbnail_time_seconds ?? 0;

  return (
    <button
      key={video.id}
      className="group relative overflow-hidden rounded-2xl bg-zinc-100 text-left shadow-lg"
      type="button"
      onClick={() => onOpen(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="relative aspect-video w-full">
        <Image
          src={cloudflareThumbnailSrc(
            video.cloudflare_uid,
            video.thumbnail_time_seconds ?? 1,
            1200,
          )}
          alt={video.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          className={`object-cover transition duration-700 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />
        {isHovered ? (
          <iframe
            className="absolute inset-0 h-full w-full pointer-events-none"
            src={cloudflarePreviewIframeSrc(video.cloudflare_uid, previewStart)}
            allow="autoplay; fullscreen"
            title={video.title}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-6 bottom-6 text-center text-white">
          <div className="text-xs uppercase tracking-[0.3em] text-white/80">
            {video.taxonomies.find((taxonomy) => taxonomy.kind === "type")?.label ??
              t("home.featured.fallback")}
          </div>
          <div className="mt-2 text-lg font-semibold">{video.title}</div>
        </div>
      </div>
    </button>
  );
}

export function LeanFeaturedGrid({ videos }: Props) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    const urls = ["https://videodelivery.net", "https://iframe.videodelivery.net"];
    const head = document.head;
    const links: HTMLLinkElement[] = [];
    for (const href of urls) {
      for (const rel of ["preconnect", "dns-prefetch"]) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        if (rel === "preconnect") link.crossOrigin = "anonymous";
        head.appendChild(link);
        links.push(link);
      }
    }
    return () => {
      for (const link of links) link.remove();
    };
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-20 text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-rose-400/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 text-center sm:py-12">
        <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
          <span className="whitespace-nowrap">
            Nous sommes une agence{" "}
            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
              lean
            </span>
          </span>
        </h2>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
      <div className="relative z-10 mx-auto mt-8 w-full max-w-none px-[10vw]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((video, index) => (
            <FeaturedVideoCard
              key={video.id}
              video={video}
              onOpen={setActiveVideo}
              priority={index < 3}
            />
          ))}
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
