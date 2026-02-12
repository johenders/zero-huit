"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { withLocaleHref } from "@/lib/i18n/shared";
import { useI18n } from "@/lib/i18n/client";

import a30Logo from "../../assets/clients/a30.png";
import braqueLogo from "../../assets/clients/braque.png";
import ccqLogo from "../../assets/clients/ccq.png";
import cegepLogo from "../../assets/clients/cegep.png";
import cisssmoLogo from "../../assets/clients/cisssmo.png";
import cnesstLogo from "../../assets/clients/cnesst.png";
import desjardinsLogo from "../../assets/clients/desjardins.png";
import foodtasticLogo from "../../assets/clients/foodtastic.png";
import hecLogo from "../../assets/clients/hec.png";
import patriotesLogo from "../../assets/clients/patriotes.png";
import phaneufLogo from "../../assets/clients/phaneuf.png";
import regatesLogo from "../../assets/clients/regates.png";
import saqLogo from "../../assets/clients/saq.png";
import skyspaLogo from "../../assets/clients/skyspa.png";
import valleyfieldLogo from "../../assets/clients/valleyfield.png";
import zelLogo from "../../assets/clients/zel.png";
const videoId = "0c63337d4f672f4dd6e39853d1d94301";
const heroVideoSrc = `https://iframe.videodelivery.net/${videoId}?preload=true&quality=1080&autoplay=true&muted=true&loop=true&controls=true`;

const logos = [
  { src: a30Logo, alt: "A30 Express" },
  { src: cisssmoLogo, alt: "CISSSMO" },
  { src: cnesstLogo, alt: "CNESST" },
  { src: ccqLogo, alt: "Centre de services sociaux des Patriotes" },
  { src: desjardinsLogo, alt: "Desjardins" },
  { src: hecLogo, alt: "HEC Montreal" },
  { src: valleyfieldLogo, alt: "Valleyfield" },
  { src: foodtasticLogo, alt: "Foodtastic" },
  { src: saqLogo, alt: "SAQ" },
  { src: zelLogo, alt: "Zel" },
  { src: regatesLogo, alt: "Regates Valleyfield" },
  { src: braqueLogo, alt: "Braque" },
  { src: patriotesLogo, alt: "Patriotes" },
  { src: cegepLogo, alt: "Cegep de Valleyfield" },
  { src: skyspaLogo, alt: "Skyspa" },
  { src: phaneufLogo, alt: "Phaneuf" },
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
  const baseSpeed = direction === "left" ? 22 : 18;
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
          "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      <div ref={trackRef} className="flex w-max items-center gap-6 py-6">
        {itemList.map((logo, index) => (
          <div key={`${logo.alt}-${index}`} className="flex items-center justify-center">
            <div className="relative h-14 w-44 sm:h-16 sm:w-52 lg:h-20 lg:w-64">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain opacity-80 grayscale"
                sizes="224px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientsMarqueeSection() {
  const firstRow = logos.slice(0, 8);
  const secondRow = logos.slice(8);
  const { locale } = useI18n();

  return (
    <section className="relative overflow-hidden bg-black pt-10 pb-0 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-6 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      </div>
      <div className="mt-6 space-y-6">
        <MarqueeRow direction="left" items={firstRow} />
        <MarqueeRow direction="right" items={secondRow} />
      </div>

      <div className="mt-20 bg-white text-black">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
            <div className="order-2 lg:order-1 flex flex-col lg:pr-6">
              <h3 className="text-[2.35rem] font-semibold leading-[1.1] text-black sm:text-[2.95rem]">
                Nous sommes une agence{" "}
                <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text font-bold text-transparent">
                  lean
                </span>
              </h3>

              <div className="mt-6">
                <div className="flex items-start gap-4 rounded-xl border border-emerald-300/60 bg-white px-5 py-4">
                  <span className="self-stretch w-2 rounded-full bg-gradient-to-b from-[#5cc3d7] to-[#8acd5f]" />
                  <div>
                    <p className="inline-block text-sm font-normal italic text-black">
                      Lean management
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                      Modèle de gestion centré sur la création de valeur réelle, visant à réduire
                      la lourdeur et les intermédiaires afin d'offrir des processus plus clairs,
                      efficaces et alignés sur les objectifs d’affaires, sans complexité inutile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                <div className="relative aspect-video w-full">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={heroVideoSrc}
                    title="Zéro huit — Démo"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/15" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 text-center">
            <p className="max-w-3xl text-[1.25rem] leading-[1.35] text-zinc-700">
              Avec notre équipe, on se concentre sur ce qui compte vraiment,{" "}
              <span className="font-semibold text-black">
                votre message
              </span>
              .
            </p>
            <Link
              href={withLocaleHref(locale, "/request")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            >
              Planifier ma consultation gratuite
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
