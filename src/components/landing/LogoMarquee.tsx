"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

import type { SectorLogo } from "@/content/secteurs/types";

/**
 * Carrousel de logos défilant — même comportement que le marquee de l'accueil
 * et des pages secteur (`HeroLogoMarquee` / `ClientsMarqueeSection`) : défilement
 * continu en rAF, accéléré par la vélocité de scroll, avec masque latéral.
 */

/** Nombre minimal de logos dans une boucle pour couvrir un écran large. */
const MIN_ITEMS_PER_LOOP = 12;

export function LogoMarquee({
  logos,
  direction = "left",
}: {
  logos: SectorLogo[];
  direction?: "left" | "right";
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const baseSpeed = direction === "left" ? 22 : 18;

  const itemList = useMemo(() => {
    if (logos.length === 0) return [];
    const loop: SectorLogo[] = [];
    while (loop.length < MIN_ITEMS_PER_LOOP) loop.push(...logos);
    return [...loop, ...loop];
  }, [logos]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateLoopWidth = () => {
      loopWidthRef.current = track.scrollWidth / 2;
    };
    updateLoopWidth();
    const observer = new ResizeObserver(updateLoopWidth);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastScrollY;
      const dt = Math.max(16, now - lastScrollTime);
      velocityRef.current = Math.min(400, Math.abs((dy / dt) * 1000));
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    };

    const tick = (time: number) => {
      const loopWidth = loopWidthRef.current;
      if (loopWidth > 0 && trackRef.current) {
        const lastTime = lastTimeRef.current ?? time;
        const delta = Math.min(0.05, (time - lastTime) / 1000);
        lastTimeRef.current = time;
        const speed = baseSpeed + velocityRef.current * 0.03;
        offsetRef.current += speed * delta * (direction === "left" ? -1 : 1);
        if (direction === "left" && offsetRef.current <= -loopWidth) {
          offsetRef.current += loopWidth;
        }
        if (direction === "right" && offsetRef.current >= 0) {
          offsetRef.current -= loopWidth;
        }
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
        velocityRef.current *= 0.92;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [baseSpeed, direction]);

  if (itemList.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div ref={trackRef} className="flex w-max items-center gap-6 py-2">
        {itemList.map((logo, index) => (
          <div
            key={`${logo.alt}-${index}`}
            aria-hidden={index >= itemList.length / 2}
            className="relative h-12 w-40 shrink-0 sm:h-14 sm:w-48"
          >
            <Image
              src={logo.src}
              alt={index < itemList.length / 2 ? logo.alt : ""}
              fill
              className="object-contain opacity-70 grayscale"
              sizes="192px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
