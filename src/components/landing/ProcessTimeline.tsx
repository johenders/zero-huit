"use client";

import { useEffect, useRef, useState } from "react";

import { SectorIcon } from "@/components/landing/SectorIcons";
import type { SectorProcess } from "@/content/secteurs/types";

/**
 * Le processus comme un parcours, pas comme une grille.
 *
 * Au bureau, les six étapes s'alignent sur un rail dont la partie parcourue se
 * colore ; l'étape active porte son verbe en géant derrière elle, sa
 * description et une petite figure abstraite. Le parcours se déroule seul à
 * l'entrée dans l'écran, puis s'arrête net dès que le visiteur intervient.
 * Sous `sm`, le rail bascule à la verticale et tout est visible d'un coup :
 * aucune interaction n'est requise au doigt.
 */

const STEP_MS = 4000;

export function ProcessTimeline({ process }: { process: SectorProcess }) {
  const steps = process.steps;
  const [active, setActive] = useState(0);
  /** Une intervention du visiteur arrête le déroulé pour de bon. */
  const [takenOver, setTakenOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /** Le parcours ne démarre qu'une fois la section devant les yeux. */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /** Il avance jusqu'à la dernière étape, puis s'arrête : rien ne boucle. */
  useEffect(() => {
    if (!started || takenOver || reducedMotion) return;
    if (active >= steps.length - 1) return;
    const id = setTimeout(() => setActive((current) => current + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [active, reducedMotion, started, steps.length, takenOver]);

  const select = (index: number) => {
    setTakenOver(true);
    setActive(index);
  };

  const current = steps[active];
  /** Le déroulé est-il encore en train de mener à l'étape suivante ? */
  const running =
    started && !takenOver && !reducedMotion && active < steps.length - 1;

  return (
    <div ref={sectionRef} className="relative">
      {/* Le verbe de l'étape, en géant, très en retrait. */}
      <p
        aria-hidden="true"
        key={current.accentWord}
        /* Centré, mais remonté au-dessus du rail : il accompagne les étapes
           sans se poser exactement derrière elles. */
        className={`zh-fade pointer-events-none absolute inset-x-0 top-[-5.5rem] hidden select-none text-center text-[9rem] font-extrabold uppercase leading-none tracking-[-0.06em] lg:block xl:text-[11rem] ${
          running ? "zh-sweep" : "text-white/[0.035]"
        }`}
        style={
          /* Deux animations : la pose du mot, puis le remplissage sur la
             durée de l'étape. */
          running ? { animationDuration: `700ms, ${STEP_MS}ms` } : undefined
        }
      >
        {current.accentWord}
      </p>

      {/* ---- Rail horizontal ---- */}
      <ol className="relative hidden grid-cols-6 sm:grid">
        {steps.map((step, index) => {
          const isActive = index === active;
          const isDone = index <= active;
          return (
            <li key={step.title} className="min-w-0">
              <button
                type="button"
                onClick={() => select(index)}
                onMouseEnter={() => select(index)}
                onFocus={() => select(index)}
                aria-current={isActive}
                className="group flex w-full flex-col items-center px-2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5cc3d7]"
              >
                <span
                  className={`font-mono text-xs font-bold tabular-nums tracking-[0.2em] transition-colors duration-500 ${
                    isDone ? "text-[#8acd5f]" : "text-zinc-600"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Le rail : deux demi-segments par étape, donc aucun réglage
                    au pixel pour l'aligner sur les pastilles. */}
                {/* Le rail déborde du rembourrage du bouton : sans ça, il
                    manquait 16 px entre deux colonnes et les segments ne se
                    rejoignaient pas. */}
                <span className="relative -mx-2 mt-4 flex h-4 w-[calc(100%+1rem)] items-center justify-center">
                  {index > 0 ? (
                    <span
                      className={`absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 transition-colors duration-500 ${
                        isDone ? "bg-[#5cc3d7]" : "bg-white/12"
                      }`}
                    />
                  ) : null}
                  {index < steps.length - 1 ? (
                    /* Le segment de droite se remplit pendant les 4 secondes
                       qui mènent à l'étape suivante : le trait arrive sur la
                       pastille au moment exact où elle s'allume. */
                    <span className="absolute right-0 top-1/2 h-px w-1/2 -translate-y-1/2 overflow-hidden bg-white/12">
                      <span
                        key={`rail-${active}`}
                        className={`block h-px bg-[#5cc3d7] ${
                          index < active
                            ? "w-full"
                            : isActive && running
                              ? "zh-progress"
                              : "w-0"
                        }`}
                        style={
                          isActive && running
                            ? { animationDuration: `${STEP_MS}ms` }
                            : undefined
                        }
                      />
                    </span>
                  ) : null}
                  <span
                    className={`relative h-4 w-4 rounded-full transition-all duration-500 ${
                      isActive
                        ? "scale-110 bg-[#8acd5f] shadow-[0_0_0_6px_rgba(138,205,95,0.16)]"
                        : isDone
                          ? "bg-[#5cc3d7]"
                          : "bg-white/20"
                    }`}
                  />
                </span>

                <span
                  className={`mt-4 transition-transform duration-500 ${
                    isActive ? "text-[#5cc3d7]" : "text-zinc-600"
                  }`}
                >
                  <SectorIcon
                    name={step.icon}
                    className={`h-5 w-5 [stroke-width:1.25] ${isActive ? "zh-draw" : ""}`}
                  />
                </span>

                <span
                  className={`mt-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-colors duration-500 ${
                    isActive
                      ? "text-white"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ---- L'étape active, sur une seule ligne ---- */}
      <p
        key={current.body}
        className="zh-fade mt-12 hidden border-t border-white/10 pt-10 text-center text-lg leading-8 text-zinc-300 sm:block"
      >
        {current.body}
      </p>

      {/* ---- Rail vertical : tout est lisible sans rien toucher ---- */}
      <ol className="sm:hidden">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="zh-reveal relative flex gap-5 pb-10 last:pb-0"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="relative flex w-4 shrink-0 justify-center">
              <span className="mt-1.5 h-4 w-4 rounded-full bg-[#5cc3d7]" />
              {index < steps.length - 1 ? (
                <span className="absolute left-1/2 top-6 h-full w-px -translate-x-1/2 bg-white/12" />
              ) : null}
            </span>
            <span className="block pb-2">
              <span className="font-mono text-xs font-bold tabular-nums tracking-[0.2em] text-[#8acd5f]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-sm font-bold uppercase tracking-[0.18em] text-white">
                {step.title}
              </span>
              <span className="mt-2 block text-[0.95rem] leading-7 text-zinc-400">
                {step.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
