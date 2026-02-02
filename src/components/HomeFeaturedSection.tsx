"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudflarePreviewIframeSrc, cloudflareThumbnailSrc } from "@/lib/cloudflare";
import type { Video } from "@/lib/types";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";

type Props = {
  featuredVideos: Video[];
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

export function HomeFeaturedSection({ featuredVideos }: Props) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const { locale, t } = useI18n();

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

  return (
    <section className="bg-white py-20 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
        <p className="text-left text-xs font-bold uppercase tracking-[0.4em] text-[#8acd5f]">
          {t("home.featured.kicker")}
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
              <span className="block">{t("home.featured.title.line1")}</span>
              <span className="block">
                {t("home.featured.title.line2")}{" "}
                <span className="font-normal italic text-zinc-700">
                  {t("home.featured.title.lean")}
                </span>
              </span>
            </h2>
            <Link
              href={withLocaleHref(locale, "/about")}
              className="mt-6 inline-flex items-center gap-2 self-start rounded-full py-1 pr-3 pl-0 text-left text-sm font-semibold tracking-[0.05em] text-zinc-900 transition hover:text-[#8acd5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8acd5f]/60"
            >
              {t("home.featured.cta")}
              <span aria-hidden className="text-lg">
                &#8594;
              </span>
            </Link>
          </div>
          <div className="space-y-4 text-sm leading-7 text-zinc-600">
            <p>{t("home.featured.body.1")}</p>
            <p>{t("home.featured.body.2")}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 w-full max-w-none px-[10vw]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVideos.slice(0, 6).map((video, index) => (
            <FeaturedVideoCard
              key={video.id}
              video={video}
              onOpen={setActiveVideo}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-6xl justify-center px-6">
        <a
          href={withLocaleHref(locale, "/portfolio")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-semibold tracking-[0.05em] text-white transition hover:-translate-y-0.5"
        >
          {t("home.featured.cta.projects")}
        </a>
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
                {t("home.featured.modal.close")}
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
