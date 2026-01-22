"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cloudflarePreviewIframeSrc, cloudflareThumbnailSrc } from "@/lib/cloudflare";
import type { Video } from "@/lib/types";

export type VideoCardProps = {
  video: Video;
  onOpen: (video: Video) => void;
  prewarmPreview?: boolean;
};

export function VideoCard({
  video,
  onOpen,
  prewarmPreview = false,
}: VideoCardProps) {
  const [hasPreview, setHasPreview] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const previewTime = video.thumbnail_time_seconds ?? undefined;
  const previewStart = video.thumbnail_time_seconds ?? 0;
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40 motion-safe:animate-[fadeUp_420ms_ease-out]">
      <button
        type="button"
        className="relative block w-full"
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
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            className={`h-full w-full object-cover opacity-95 transition-opacity ${
              isPreviewReady ? "group-hover:opacity-0" : "group-hover:opacity-95"
            }`}
            src={cloudflareThumbnailSrc(video.cloudflare_uid, previewTime)}
            alt=""
            width={640}
            height={360}
          />
          {hasPreview ? (
            <iframe
              className={`absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-200 ${
                isPreviewReady ? "opacity-0 group-hover:opacity-100" : "opacity-0"
              }`}
              src={cloudflarePreviewIframeSrc(video.cloudflare_uid, previewStart)}
              allow="autoplay; fullscreen"
              loading="eager"
              onLoad={() => {
                setIsPreviewReady(true);
              }}
              title={video.title}
            />
          ) : null}
          {hasPreview && !isPreviewReady ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="block w-[12.5%] shrink-0 aspect-square animate-spin rounded-full bg-[conic-gradient(from_0deg,#34d399,#22d3ee,#3b82f6,#34d399)] [mask:radial-gradient(transparent_60%,#000_61%)]" />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 transition-opacity group-hover:opacity-90" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-left">
            <div className="translate-y-2 text-sm font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
              {video.title}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
