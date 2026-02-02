"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  description: string;
};

const stats: Stat[] = [
  {
    value: 3.4,
    suffix: "x",
    label: "Taux de complétion moyen",
    description:
      "Les campagnes vidéo gardent l'attention plus longtemps quand le message est clair.",
  },
  {
    value: 68,
    suffix: "%",
    label: "Hausse de mémorisation",
    description:
      "Le bon storytelling augmente la rétention et la mémorisation de marque.",
  },
  {
    value: 52,
    suffix: "%",
    label: "Taux de clic moyen",
    description:
      "Le motion capte l'œil et améliore les taux d'interaction sur les pages clés.",
  },
  {
    value: 5.2,
    suffix: "s",
    label: "Gain sur le temps de compréhension",
    description:
      "Une vidéo bien construite explique plus vite qu'un long texte.",
  },
];

function useCountUp(value: number, start: boolean) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, value]);

  return display;
}

function AnimatedStat({ stat, start }: { stat: Stat; start: boolean }) {
  const display = useCountUp(stat.value, start);
  const formatted = useMemo(() => {
    if (stat.value % 1 !== 0) return display.toFixed(1);
    return Math.round(display).toString();
  }, [display, stat.value]);

  return (
    <div className="border-b border-zinc-200 pb-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.1em] text-emerald-600">
            {stat.label}
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">{stat.description}</p>
        </div>
        <div className="text-6xl font-semibold text-zinc-900 sm:text-7xl">
          {formatted}
          {stat.suffix}
        </div>
      </div>
    </div>
  );
}

export function VideoStatsSection() {
  const [start, setStart] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-28 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-600">
          SUCCESS IN NUMBERS
        </p>
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Des r&#233;sultats qui parlent pour la vid&#233;o.
        </h2>
        <p className="mt-4 text-sm text-zinc-600">
          Statistiques marketing (placeholders) &#8212; on ajuste ensemble.
        </p>
      </div>
      <div className="mx-auto mt-12 w-full max-w-none px-[10vw]">
        <div className="grid gap-16 md:grid-cols-2">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} start={start} />
          ))}
        </div>
      </div>
    </section>
  );
}
