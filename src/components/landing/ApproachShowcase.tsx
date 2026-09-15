"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { SectorNarrative } from "@/content/secteurs/types";

/**
 * L'approche, montrée plutôt qu'énumérée.
 *
 * Au bureau : un message éditorial à gauche, un grand visuel à droite qui
 * change avec l'étape survolée ou choisie. Aucun défilement automatique —
 * c'est le visiteur qui avance. Sous `lg`, l'interaction disparaît : les trois
 * visuels s'empilent, chacun avec sa légende, ce qui donne la même histoire
 * sans rien exiger du doigt.
 */

const TRANSITION_MS = 700;
/** Rotation automatique : lente, et suspendue dès que le visiteur intervient. */
const AUTOPLAY_MS = 5000;

/** Ponctuation de marque : un fragment exact de la phrase passe en dégradé. */
function Accented({ text, accent }: { text: string; accent: string }) {
  const at = text.indexOf(accent);
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
        {accent}
      </span>
      {text.slice(at + accent.length)}
    </>
  );
}

export function ApproachShowcase({ narrative }: { narrative: SectorNarrative }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const steps = narrative.principles;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /**
   * Le contenu ne doit pas changer tout seul sous les yeux de quelqu'un qui a
   * demandé moins de mouvement — ni pendant qu'on parcourt les étapes soi-même.
   */
  useEffect(() => {
    if (reducedMotion || paused || steps.length < 2) return;
    const id = setInterval(
      () => setActive((current) => (current + 1) % steps.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [paused, reducedMotion, steps.length]);

  return (
    /* Un noir légèrement différent : la rupture se voit avant d'être lue. */
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#080d12] py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div
          className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* ---- Message : aligné à gauche, court ---- */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#5cc3d7] sm:text-sm">
              {narrative.eyebrow}
            </p>

            <h2 className="mt-6 text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl">
              <span className="block">{narrative.titleLine1}</span>
              <span className="block">
                <Accented text={narrative.titleLine2} accent={narrative.titleAccent} />
              </span>
            </h2>

            <p className="mt-7 max-w-md text-base leading-8 text-zinc-400">{narrative.lead}</p>

            {/* Navigation éditoriale : ni carte, ni bouton dessiné. */}
            <div className="mt-10 hidden lg:block">
              {steps.map((step, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={step.label}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    aria-current={isActive}
                    className={`flex w-full items-baseline gap-5 border-t py-5 text-left transition-colors duration-300 motion-reduce:transition-none ${
                      isActive
                        ? "border-[#8acd5f]/40"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold tabular-nums tracking-[0.2em] transition-colors duration-300 motion-reduce:transition-none ${
                        isActive ? "text-[#8acd5f]" : "text-zinc-600"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span
                        className={`block text-[0.7rem] font-bold uppercase tracking-[0.24em] transition-colors duration-300 motion-reduce:transition-none ${
                          isActive ? "text-white" : "text-zinc-500"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span
                        className={`mt-1.5 block text-lg font-extrabold tracking-[-0.02em] transition-colors duration-300 motion-reduce:transition-none ${
                          isActive ? "text-white" : "text-zinc-500"
                        }`}
                      >
                        {step.title}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- Visuel : dominant, cinématographique ---- */}
          <div className="relative">
            <div className="space-y-10 lg:relative lg:aspect-[16/10] lg:space-y-0">
              {steps.map((step, index) => (
                <figure
                  key={step.label}
                  className={`relative m-0 ${
                    index > 0 ? "border-t border-white/10 pt-10 lg:border-t-0 lg:pt-0" : ""
                  } lg:absolute lg:inset-0 lg:transition-opacity lg:duration-700 motion-reduce:lg:transition-none ${
                    index === active ? "lg:opacity-100" : "lg:opacity-0"
                  }`}
                  style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden lg:h-full lg:aspect-auto">
                    <Image
                      src={step.image}
                      alt={step.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover"
                    />
                    {/* Voile : cohérence avec le noir du site, lisibilité du texte. */}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,11,0.28)_0%,rgba(3,7,11,0.12)_45%,rgba(3,7,11,0.82)_100%)]" />

                    <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      {/* Vrai titre de niveau 3 : chaque étape est une
                          sous-partie du H2 de la section. Les mêmes classes
                          qu'avant, donc rien ne bouge à l'écran. */}
                      <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-white">
                        <span className="text-[#8acd5f]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mx-2 text-white/40">/</span>
                        {step.label}
                      </h3>
                      <p className="mt-2.5 text-lg font-semibold leading-7 tracking-[-0.02em] text-white sm:text-xl">
                        {step.caption}
                      </p>
                    </figcaption>
                  </div>

                  {/* En pile, chaque visuel porte sa propre description. */}
                  <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400 lg:hidden">
                    {step.body}
                  </p>
                </figure>
              ))}

              {/* Le chemin : un trait vert qui s'allonge d'une étape à l'autre. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 hidden h-px bg-white/15 lg:block"
              >
                <div
                  className="h-px bg-[#8acd5f] transition-[width] ease-out motion-reduce:transition-none"
                  style={{
                    width: `${((active + 1) / steps.length) * 100}%`,
                    transitionDuration: `${TRANSITION_MS}ms`,
                  }}
                />
              </div>
            </div>

            {/* Au bureau, une seule description : celle de l'étape en cours. */}
            <p
              key={steps[active].label}
              className="zh-fade mt-8 hidden max-w-xl text-base leading-8 text-zinc-400 lg:block"
            >
              {steps[active].body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
