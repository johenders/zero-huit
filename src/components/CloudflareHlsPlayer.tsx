"use client";

import { useEffect, useRef, useState } from "react";
import { cloudflareHlsManifestSrc, cloudflareIframeSrc } from "@/lib/cloudflare";

type Props = {
  uid: string;
  title: string;
  autoPlay?: boolean;
  className?: string;
};

export function CloudflareHlsPlayer({
  uid,
  title,
  autoPlay = false,
  className = "h-full w-full",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let hlsInstance: { destroy: () => void } | null = null;
    const video = videoRef.current;
    const src = cloudflareHlsManifestSrc(uid, 8);

    if (!video) return undefined;
    setUseIframeFallback(false);

    const playWhenReady = () => {
      if (!autoPlay) return;
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.load();
      video.addEventListener("loadedmetadata", playWhenReady, { once: true });
      return () => {
        video.removeEventListener("loadedmetadata", playWhenReady);
        video.removeAttribute("src");
        video.load();
      };
    }

    void import("hls.js")
      .then(({ default: Hls }) => {
        if (!isMounted || !video) return;
        if (!Hls.isSupported()) {
          setUseIframeFallback(true);
          return;
        }

        const hls = new Hls({
          capLevelToPlayerSize: false,
          startLevel: -1,
        });
        hlsInstance = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playWhenReady);
      })
      .catch(() => {
        if (isMounted) setUseIframeFallback(true);
      });

    return () => {
      isMounted = false;
      hlsInstance?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [autoPlay, uid]);

  if (useIframeFallback) {
    return (
      <iframe
        className={className}
        src={cloudflareIframeSrc(uid)}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        title={title}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      playsInline
      preload="auto"
      autoPlay={autoPlay}
      title={title}
    />
  );
}
