"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

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
import btsOne from "../../assets/bts/DSCF2233.jpg";
import btsTwo from "../../assets/bts/DSCF7468.jpg";
import btsThree from "../../assets/bts/IMG_7132.jpg";

const videoId = "0c63337d4f672f4dd6e39853d1d94301";
const heroVideoBaseSrc = `https://iframe.videodelivery.net/${videoId}?preload=true&quality=1080`;

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
  const [isMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const heroVideoSrc = `${heroVideoBaseSrc}&autoplay=true&muted=${
    isMuted ? "true" : "false"
  }&loop=${isPlaying ? "false" : "true"}&controls=${isPlaying ? "true" : "false"}`;

  return (
    <section className="relative overflow-hidden bg-black pt-20 pb-0 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-6 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      </div>
      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Ils nous ont fait{" "}
          <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
            confiance
          </span>
          .
        </h2>
      </div>
      <div className="mt-10 space-y-6">
        <MarqueeRow direction="left" items={firstRow} />
        <MarqueeRow direction="right" items={secondRow} />
      </div>

      <div className="relative z-10 mx-auto mt-20 grid w-full max-w-none items-center gap-12 px-[6vw] lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-200">
            TEXTE RANDOM
          </p>
          <h3 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Lorem ipsum dolor sit amet consectetur.
          </h3>
          <p className="mt-6 text-base leading-7 text-zinc-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris.
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
          </p>
          <button
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
            type="button"
          >
            Demande de soumission
          </button>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
          <div className="relative aspect-video w-full">
            <iframe
              key={heroVideoSrc}
              className="absolute inset-0 h-full w-full"
              src={heroVideoSrc}
              title="Zéro huit — Démo"
              allow="autoplay; fullscreen"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            {!isPlaying ? (
              <button
                className="absolute inset-0 flex items-center justify-center"
                type="button"
                aria-label="Lire la vidéo"
                onClick={() => {
                  setIsPlaying(true);
                }}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition hover:scale-105">
                  <svg
                    aria-hidden
                    className="h-6 w-6 translate-x-[1px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7-11-7z" />
                  </svg>
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-24 bg-[#0f1f1b] py-20 text-white">
        <div className="mx-auto w-full max-w-none px-[9vw]">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">
              MADE TO FLEX
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
              Supertalentueux. Super rapide. Hyper r&#233;actif. Une &#233;quipe faite pour suivre
              votre rythme.
            </h3>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            {
              image: btsOne,
              title: "créatifs",
              description:
                "Un accès direct à des talents seniors et une direction artistique claire pour chaque projet.",
              panelClass: "bg-[#5cc3d7] text-[#0f1f1b]",
            },
            {
              image: btsTwo,
              title: "rapide",
              description:
                "Une méthode agile pour livrer vite, sans compromis sur la qualit&#233; ou la coh&#233;rence.",
              panelClass: "bg-[#39c193] text-[#0f1f1b]",
            },
            {
              image: btsThree,
              title: "flexible",
              description:
                "On s'adapte à votre cadence, vos besoins et votre calendrier de production.",
              panelClass: "bg-[#8acd5f] text-[#0f1f1b]",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-3xl bg-white"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-0 flex items-end">
                <div
                  className={`flex h-[25%] w-full flex-col justify-start px-6 py-5 transition-transform duration-700 ease-in-out ${card.panelClass} translate-y-[30%] group-hover:translate-y-0`}
                >
                  <h4 className="text-3xl text-black/90">
                    <span className="font-normal">On est </span>
                    <span className="font-bold italic">{card.title}</span>
                  </h4>
                  <p className="mt-3 max-h-0 overflow-hidden text-base opacity-0 transition-all duration-300 group-hover:max-h-28 group-hover:opacity-100">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
