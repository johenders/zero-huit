"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SectorService } from "@/content/secteurs/types";

/**
 * Vitrine des services : une carte au centre, en grand, ses voisines de part et
 * d'autre. Le défilement est libre — molette, trackpad, glisser, tactile — et la
 * piste boucle sans fin.
 *
 * La boucle : la liste est rendue trois fois et on démarre sur la copie du
 * milieu. Dès qu'on s'éloigne trop du centre, la position est recalée d'une
 * largeur de copie, sans animation. Le saut est invisible puisque le contenu
 * est identique, et le geste n'est jamais interrompu.
 *
 * SEO : seule la copie du milieu porte les `h3` et la liste d'applications. Les
 * deux autres répètent le texte en `p` et sont `aria-hidden` — le plan de
 * titres de la page reste de huit services, pas vingt-quatre, et les lecteurs
 * d'écran n'entendent rien en triple.
 */

/** Lissage de la molette : part de la distance restante avalée par image. */
const WHEEL_EASING = 0.14;
/** Copies de la liste : une avant, une après. */
const COPIES = 3;

export function ServicesShowcase({
  services,
  sectorId,
}: {
  services: readonly SectorService[];
  sectorId: string;
}) {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const slideRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const wheelTargetRef = useRef(0);
  const wheelFrameRef = useRef(0);
  const count = services.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /** Largeur d'une copie : l'écart entre une carte et son homologue suivante. */
  const copyWidth = useCallback(() => {
    const first = slideRefs.current[0];
    const second = slideRefs.current[count];
    if (!first || !second) return 0;
    return second.offsetLeft - first.offsetLeft;
  }, [count]);

  /** Recale la piste sur la copie du milieu, sans animation ni interruption. */
  const recenter = useCallback(() => {
    const track = trackRef.current;
    const width = copyWidth();
    if (!track || width <= 0) return;
    const drift = track.scrollLeft - width;
    if (Math.abs(drift) < width / 2) return;
    const shift = drift > 0 ? -width : width;
    track.scrollLeft += shift;
    wheelTargetRef.current += shift;
  }, [copyWidth]);

  /**
   * La carte active est celle dont le centre est le plus près du centre de la
   * piste — et non la plus visible : plusieurs sont visibles à 100 % en même
   * temps et un `IntersectionObserver` ne saurait pas les départager.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      recenter();

      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setActive(bestIndex % count);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    /* On démarre sur la copie du milieu : il y a donc toujours de la matière
       des deux côtés, dans un sens comme dans l'autre. */
    const start = () => {
      const width = copyWidth();
      if (width <= 0) return;
      track.scrollLeft = width;
      wheelTargetRef.current = width;
      update();
    };

    start();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", start);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", start);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [copyWidth, count, recenter]);

  /** Va vers l'occurrence la plus proche du service demandé. */
  const goTo = useCallback(
    (logical: number) => {
      const track = trackRef.current;
      if (!track) return;

      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let bestDelta = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide || index % count !== logical) return;
        const rect = slide.getBoundingClientRect();
        const delta = rect.left + rect.width / 2 - trackCenter;
        if (Math.abs(delta) < bestDistance) {
          bestDistance = Math.abs(delta);
          bestDelta = delta;
        }
      });

      if (bestDistance === Number.POSITIVE_INFINITY) return;
      const left = track.scrollLeft + bestDelta;
      wheelTargetRef.current = left;
      track.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [count, reducedMotion],
  );

  /**
   * La molette fait défiler la piste horizontalement, en douceur : chaque cran
   * pousse une cible, et une boucle d'animation avale une part de la distance
   * restante à chaque image. Appliquer le delta brut donnait des à-coups de
   * cent pixels.
   *
   * L'écouteur est posé à la main plutôt que par `onWheel` : React attache ses
   * écouteurs de molette en mode passif, où `preventDefault` est sans effet.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const step = () => {
      const distance = wheelTargetRef.current - track.scrollLeft;
      if (Math.abs(distance) < 0.5) {
        track.scrollLeft = wheelTargetRef.current;
        wheelFrameRef.current = 0;
        return;
      }
      track.scrollLeft += distance * WHEEL_EASING;
      wheelFrameRef.current = requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;

      /* La piste boucle : elle n'a ni début ni fin à rendre à la page. */
      event.preventDefault();
      if (reducedMotion) {
        track.scrollLeft += delta;
        return;
      }
      /* La cible repart du réel si la boucle dormait : sinon un ancien reliquat
         ferait sauter la piste. */
      const base = wheelFrameRef.current ? wheelTargetRef.current : track.scrollLeft;
      wheelTargetRef.current = base + delta;
      if (!wheelFrameRef.current) wheelFrameRef.current = requestAnimationFrame(step);
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      track.removeEventListener("wheel", onWheel);
      if (wheelFrameRef.current) cancelAnimationFrame(wheelFrameRef.current);
    };
  }, [reducedMotion]);

  /** Glisser à la souris : le bureau n'a pas le geste tactile. */
  const drag = useRef<{ startX: number; startLeft: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    if (wheelFrameRef.current) {
      cancelAnimationFrame(wheelFrameRef.current);
      wheelFrameRef.current = 0;
    }
    drag.current = { startX: event.clientX, startLeft: track.scrollLeft };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!drag.current || !track) return;
    const delta = event.clientX - drag.current.startX;
    track.scrollLeft = drag.current.startLeft - delta;
    wheelTargetRef.current = track.scrollLeft;
  };
  const endDrag = () => {
    drag.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo((active + 1) % count);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo((active - 1 + count) % count);
    }
  };

  const loop = Array.from({ length: COPIES * count }, (_, index) => ({
    service: services[index % count],
    logical: index % count,
    /** Seule la copie du milieu porte le texte indexable. */
    canonical: Math.floor(index / count) === 1,
    key: index,
  }));

  return (
    <div>
      <ul
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Nos services"
        className="zh-no-scrollbar mx-auto flex w-full max-w-5xl items-center gap-4 overflow-x-auto overscroll-x-contain px-[15vw] py-4 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]/40 sm:gap-6 sm:px-[28vw] lg:px-[calc(50%-10.5rem)]"
      >
        {loop.map(({ service, logical, canonical, key }) => {
          const isActive = logical === active;
          const Title = canonical ? "h3" : "p";
          return (
            <li
              key={key}
              ref={(node) => {
                slideRefs.current[key] = node;
              }}
              aria-hidden={canonical ? undefined : true}
              className="w-[74vw] shrink-0 sm:w-[46vw] lg:w-[21rem]"
            >
              <article
                onClick={() => !isActive && goTo(logical)}
                className={`relative aspect-[9/16] overflow-hidden ${
                  reducedMotion
                    ? ""
                    : "transition-all duration-[600ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
                } ${
                  isActive
                    ? "scale-100 opacity-100 grayscale-0"
                    : "scale-[0.92] cursor-pointer opacity-45 grayscale-[0.65]"
                }`}
              >
                <Image
                  src={service.image}
                  alt={canonical ? service.imageAlt : ""}
                  fill
                  sizes="(min-width: 1024px) 336px, 74vw"
                  priority={key === count}
                  loading={key === count ? undefined : "lazy"}
                  className="object-cover"
                />
                {/* Le voile ne couvre que la zone du texte : le haut de l'image
                    reste lumineux et le sujet demeure visible. */}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.86)_26%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.18)_68%,rgba(0,0,0,0.02)_88%)]" />

                {/* Aperçu : les voisines ne portent que leur identité. */}
                <div
                  className={`absolute left-0 top-0 flex items-center gap-2.5 p-4 transition-opacity duration-500 ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                  aria-hidden="true"
                >
                  <span className="font-mono text-xs font-bold tabular-nums tracking-[0.2em] text-[#8acd5f]">
                    {String(logical + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-white">
                    {service.navLabel}
                  </span>
                </div>

                <div
                  className={`absolute inset-x-0 bottom-0 p-5 sm:p-6 ${
                    reducedMotion ? "" : "transition-all duration-500 ease-out"
                  } ${isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                >
                  <p className="font-mono text-xs font-bold tabular-nums tracking-[0.22em] text-[#8acd5f]">
                    {String(logical + 1).padStart(2, "0")}
                  </p>

                  <Title className="mt-2.5 max-w-[16rem] text-[1.5rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-white">
                    {service.category}
                  </Title>

                  <p className="mt-3 text-[0.9rem] leading-[1.6] text-zinc-100">
                    {service.body}
                  </p>

                  {/* Les applications ne sont pas affichées, mais restent dans
                      le DOM pour le référencement et les lecteurs d'écran. */}
                  {canonical ? (
                    <ul className="sr-only">
                      {service.examples.map((example) => (
                        <li key={example}>{example}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* ---- Navigation ---- */}
      <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-6 px-6 lg:px-10">
        <div className="flex items-center justify-between gap-6">
          <p className="font-mono text-xs tabular-nums text-zinc-500">
            <span className="text-white">{String(active + 1).padStart(2, "0")}</span>
            <span className="mx-1.5 text-zinc-700">/</span>
            {String(count).padStart(2, "0")}
          </p>

          <div className="flex items-center gap-2.5" aria-hidden="true">
            {services.map((service, index) => (
              <span
                key={service.title}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === active ? "w-6 bg-[#5cc3d7]" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo((active - 1 + count) % count)}
              aria-label="Service précédent"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo((active + 1) % count)}
              aria-label="Service suivant"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5cc3d7]"
            >
              →
            </button>
          </div>
        </div>

        <ul className="zh-no-scrollbar -mx-1 flex gap-6 overflow-x-auto px-1">
          {services.map((service, index) => (
            <li key={service.navLabel}>
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === active}
                data-analytics-event="service_nav_click"
                data-analytics-sector={sectorId}
                className={`whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5cc3d7] ${
                  index === active ? "text-[#5cc3d7]" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {service.navLabel}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
