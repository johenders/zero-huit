"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CloudflareHlsPlayer } from "@/components/CloudflareHlsPlayer";
import type { Video } from "@/lib/types";
import { cloudflarePreviewIframeSrc, cloudflareThumbnailSrc } from "@/lib/cloudflare";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";

type Props = {
  videos: Video[];
};

function FeaturedVideoCard({
  video,
  onOpen,
  priority = false,
  prewarmPreview = false,
}: {
  video: Video;
  onOpen: (video: Video) => void;
  priority?: boolean;
  prewarmPreview?: boolean;
}) {
  const [hasPreview, setHasPreview] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useI18n();
  const previewStart = Math.max(0, video.thumbnail_time_seconds ?? 0);
  const thumbnailSrc = cloudflareThumbnailSrc(
    video.cloudflare_uid,
    video.thumbnail_time_seconds ?? 1,
    1200,
  );

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!prewarmPreview || hasPreview) return;
    const root = globalThis as typeof globalThis & {
      requestIdleCallback?: (callback: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    type TimeoutHandle = ReturnType<typeof setTimeout>;
    const idle = (cb: () => void) => {
      if (typeof root.requestIdleCallback === "function") {
        return root.requestIdleCallback(cb, { timeout: 1200 });
      }
      return root.setTimeout(cb, 400);
    };
    const cancel = (id: number | TimeoutHandle) => {
      if (typeof id === "number" && typeof root.cancelIdleCallback === "function") {
        root.cancelIdleCallback(id);
        return;
      }
      root.clearTimeout(id as TimeoutHandle);
    };

    const handle = idle(() => setHasPreview(true));
    return () => cancel(handle);
  }, [hasPreview, prewarmPreview]);

  return (
    <button
      key={video.id}
      className="group relative overflow-hidden rounded-2xl bg-black/40 text-left shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
      type="button"
      onClick={() => onOpen(video)}
      onMouseEnter={() => {
        if (hasPreview) return;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
          setHasPreview(true);
        }, 160);
      }}
      onMouseLeave={() => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      }}
      onFocus={() => setHasPreview(true)}
    >
      <div className="relative aspect-video w-full">
        <Image
          src={thumbnailSrc}
          alt={video.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={priority}
          className={`object-cover transition duration-700 ${
            isPreviewReady
              ? "group-hover:opacity-0 group-focus:opacity-0"
              : "opacity-100"
          }`}
        />
        {hasPreview ? (
          <iframe
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isPreviewReady
                ? "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
                : "opacity-0"
            }`}
            src={cloudflarePreviewIframeSrc(video.cloudflare_uid, previewStart)}
            allow="autoplay; fullscreen"
            loading="eager"
            onLoad={() => setIsPreviewReady(true)}
            title={video.title}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
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

  if (videos.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#0c0b0b] py-28 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 text-center">
        <h2 className="text-[2.7rem] font-semibold leading-tight sm:text-[3.4rem]">
          {t("rive.portfolio.title.prefix")}{" "}
          <span className="font-bold italic text-white">
            {t("rive.portfolio.title.highlight")}
          </span>{" "}
          {t("rive.portfolio.title.suffix")}
        </h2>
      </div>
      <div className="relative z-10 mx-auto mt-14 w-full max-w-6xl px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, 6).map((video, index) => (
            <FeaturedVideoCard
              key={video.id}
              video={video}
              onOpen={setActiveVideo}
              priority={index < 3}
              prewarmPreview={index < 6}
            />
          ))}
        </div>
      </div>
      <div className="relative z-10 mx-auto mt-14 w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <p className="text-[1.44rem] leading-7 text-white/80">
            {t("rive.portfolio.body.prefix")}{" "}
            <span className="font-semibold text-white">
              {t("rive.portfolio.body.highlight")}
            </span>{" "}
            {t("rive.portfolio.body.suffix")}
          </p>
          <Link
            href={withLocaleHref(locale, "/portfolio")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
          >
            {t("rive.portfolio.cta")}
          </Link>
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
                {t("rive.portfolio.modal.close")}
              </button>
            </div>
            <div className="aspect-video w-full">
              <CloudflareHlsPlayer
                className="h-full w-full"
                uid={activeVideo.cloudflare_uid}
                autoPlay
                title={activeVideo.title}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
