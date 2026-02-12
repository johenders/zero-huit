"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

import a30Logo from "../../assets/clients/a30.png";
import braqueLogo from "../../assets/clients/braque.png";
import cisssmoLogo from "../../assets/clients/cisssmo.png";
import cnesstLogo from "../../assets/clients/cnesst.png";
import foodtasticLogo from "../../assets/clients/foodtastic.png";
import saqLogo from "../../assets/clients/saq.png";
import valleyfieldLogo from "../../assets/clients/valleyfield.png";
import zelLogo from "../../assets/clients/zel.png";

const logos = [
  { src: foodtasticLogo, alt: "Foodtastic" },
  { src: a30Logo, alt: "A30 Express" },
  { src: cisssmoLogo, alt: "CISSSMO" },
  { src: cnesstLogo, alt: "CNESST" },
  { src: saqLogo, alt: "SAQ" },
  { src: zelLogo, alt: "Zel" },
  { src: valleyfieldLogo, alt: "Valleyfield" },
  { src: braqueLogo, alt: "Braque" },
];

type MarqueeRowProps = {
  direction: "left" | "right";
  items: typeof logos;
};

function MarqueeRow({ direction, items }: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const baseSpeed = direction === "left" ? 18 : 16;
  const itemList = useMemo(() => [...items, ...items], [items]);

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
        const boost = velocityRef.current * 0.03;
        const speed = baseSpeed + boost;
        const deltaPx = speed * delta * (direction === "left" ? -1 : 1);
        offsetRef.current += deltaPx;
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
      <div ref={trackRef} className="flex w-max items-center gap-1 py-6">
        {itemList.map((logo, index) => (
          <div key={`${logo.alt}-${index}`} className="flex items-center justify-center">
            <div className="relative h-18 w-64 sm:h-20 sm:w-72 lg:h-20 lg:w-80">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain opacity-70 grayscale"
                sizes="144px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroLogoMarquee() {
  const firstRow = logos.slice(0, 4);
  const secondRow = logos.slice(4);

  return (
    <div className="mt-10 w-full max-w-5xl space-y-2">
      <MarqueeRow direction="left" items={firstRow} />
      <MarqueeRow direction="right" items={secondRow} />
    </div>
  );
}
