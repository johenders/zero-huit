"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cloudflareHlsManifestSrc } from "@/lib/cloudflare";

/**
 * Lecteur en façade, avec le son.
 *
 * L'iframe Cloudflare posait un problème : le clic a lieu dans la page, la
 * lecture démarre dans l'iframe, et le geste de l'utilisateur ne traverse pas
 * cette frontière. Safari refusait donc le son et laissait tourner en sourdine.
 *
 * Ici la vidéo est un `<video>` de la page elle-même. L'élément est monté dès
 * le départ, sans source ni octet chargé, et caché sous la façade. Au clic, on
 * appelle `play()` dans le geste lui-même — l'appel échoue faute de source,
 * mais il suffit à lever la restriction sur l'élément. La source arrive
 * ensuite, et la lecture repart avec le son.
 *
 * `children` est la façade : la photo et le bouton de lecture, dessinés par
 * l'appelant, qui n'ont pas la même allure d'un emplacement à l'autre.
 */
export function StreamVideo({
  uid,
  title,
  ariaLabel,
  poster,
  children,
}: {
  uid: string;
  title: string;
  /** Ce que le bouton annonce au lecteur d'écran. */
  ariaLabel: string;
  /** L'image tenue pendant que la vidéo se charge. */
  poster?: string;
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  /* Dernier recours : un navigateur sans HLS natif ni hls.js. */
  const [useIframe, setUseIframe] = useState(false);

  const start = useCallback(() => {
    const video = videoRef.current;
    setStarted(true);
    if (!video) return;
    video.muted = false;
    void video.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!started || useIframe) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    const src = cloudflareHlsManifestSrc(uid);
    let hls: { destroy: () => void } | null = null;
    let cancelled = false;

    const play = () => {
      video.muted = false;
      void video.play().catch(() => {});
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", play, { once: true });
      video.load();
    } else {
      void import("hls.js")
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) {
            setUseIframe(true);
            return;
          }
          const instance = new Hls({ capLevelToPlayerSize: false, startLevel: -1 });
          hls = instance;
          instance.loadSource(src);
          instance.attachMedia(video);
          instance.on(Hls.Events.MANIFEST_PARSED, play);
        })
        .catch(() => {
          if (!cancelled) setUseIframe(true);
        });
    }

    return () => {
      cancelled = true;
      hls?.destroy();
      video.removeEventListener("loadedmetadata", play);
      video.removeAttribute("src");
      video.load();
    };
  }, [started, uid, useIframe]);

  if (useIframe) {
    return (
      <iframe
        src={`https://iframe.videodelivery.net/${uid}?autoplay=true&muted=false&controls=true&preload=metadata`}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        title={title}
        poster={started ? poster : undefined}
        hidden={!started}
        aria-hidden={!started}
        tabIndex={started ? 0 : -1}
        controls
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />
      {started ? null : (
        <button
          type="button"
          onClick={start}
          aria-label={ariaLabel}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#8acd5f]"
        >
          {children}
        </button>
      )}
    </>
  );
}
