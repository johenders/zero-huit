"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Les segments encadrés de `**` passent en gras et en blanc pur : c'est la
 * seule mise en forme admise dans un texte de besoin. Le découpage est fait au
 * rendu plutôt que dans le contenu, qui reste une simple chaîne.
 */
function Emphasised({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((segment, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-extrabold text-white">
            {segment}
          </strong>
        ) : (
          <span key={index}>{segment}</span>
        ),
      )}
    </>
  );
}

export type Need = {
  title: string;
  body: string;
  image: StaticImageData;
  imageAlt: string;
};

/**
 * Les besoins du milieu, choisis à la liste.
 *
 * À gauche, les six verbes ; à droite, celui qu'on a retenu, développé. Tout
 * est dans le DOM en permanence : le panneau change de contenu, il ne le
 * reconstruit pas. Sous `lg`, la liste et le panneau s'empilent — le besoin
 * actif reste affiché sous les verbes, à portée du pouce.
 */
/** Durée d'affichage d'un besoin avant de passer au suivant. */
const STEP_MS = 4000;

export function NeedsExplorer({ needs }: { needs: readonly Need[] }) {
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);
  /** Un clic arrête le défilement pour de bon : on ne bouscule pas la lecture. */
  const [takenOver, setTakenOver] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const current = needs[active];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /** Le défilement ne commence qu'une fois la section devant les yeux. */
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /** Il boucle : les six besoins doivent tous pouvoir être vus sans agir. */
  useEffect(() => {
    if (!started || hovered || takenOver || reducedMotion) return;
    const id = setInterval(
      () => setActive((index) => (index + 1) % needs.length),
      STEP_MS,
    );
    return () => clearInterval(id);
  }, [hovered, needs.length, reducedMotion, started, takenOver]);

  const select = (index: number) => {
    setTakenOver(true);
    setActive(index);
  };

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      className="mt-16 grid items-start gap-12 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] lg:items-stretch lg:gap-16"
    >
      <ul className="border-t border-white/12">
        {needs.map((need, index) => {
          const isActive = index === active;
          return (
            <li key={need.title}>
              <button
                type="button"
                onClick={() => select(index)}
                aria-pressed={isActive}
                className={`group flex w-full items-center border-b py-4 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8acd5f] motion-reduce:transition-none ${
                  isActive
                    ? "border-b-[#8acd5f]"
                    : "border-b-white/12 hover:border-b-white/30"
                }`}
              >
                <span
                  className={`text-2xl font-extrabold leading-tight tracking-[-0.03em] transition-colors duration-300 motion-reduce:transition-none sm:text-[1.75rem] ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {need.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/*
        Le texte est posé sur l'image, dans son tiers inférieur : un voile ne
        mord que cette zone, le sujet de la photo reste visible au-dessus.
        Le titre n'est pas répété — la liste de gauche le porte déjà.
      */}
      <div key={current.title} className="zh-soft-swap lg:h-full">
        {/* Au bureau, l'image prend la hauteur de la rangée : elle s'aligne donc
            exactement sur la liste de gauche. Le ratio ne sert qu'en dessous. */}
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#0a0a0a] lg:aspect-auto lg:h-full">
          <Image
            src={current.image}
            alt={current.imageAlt}
            fill
            sizes="(min-width: 1024px) 46rem, 100vw"
            className="object-cover"
          />
          {/* Le texte étant centré, le voile ne peut plus se concentrer en bas :
              il couvre toute l'image, un peu plus dense sous le pied. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,17,0.86)_0%,rgba(17,17,17,0.66)_45%,rgba(17,17,17,0.44)_100%)]" />

          {/* Le texte est la pièce maîtresse : gros corps, filet vert en
              alinéa, ombre portée pour tenir sur n'importe quelle image. */}
          <div className="absolute inset-0 flex items-center p-10 sm:p-14">
            <p className="max-w-2xl border-l-2 border-[#8acd5f] pl-5 text-lg font-medium leading-[1.45] tracking-[-0.015em] text-white/80 drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:pl-7 sm:text-[1.6rem] xl:text-[1.8rem]">
              <Emphasised text={current.body} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
