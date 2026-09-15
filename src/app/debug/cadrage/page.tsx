"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";

import t1 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4817.jpg";
import t2 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4828.jpg";
import t3 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4524.jpg";
import t4 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4743.jpg";
import t5 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4752.jpg";
import t6 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4768.jpg";
import t7 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4881.jpg";
import t8 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4898.jpg";
import t9 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4959.jpg";
import t10 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5030.jpg";
import t11 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5202.jpg";
import t12 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5225.jpg";
import t13 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5330.jpg";
import t14 from "../../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5354.jpg";
import ppr1 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_7836.jpeg";
import ppr2 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_7945.jpeg";
import ppr3 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8232.jpeg";
import ppr4 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_9217.jpeg";
import ppr5 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8247.jpeg";
import ppr6 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8250.jpeg";
import ppr7 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_9303.jpeg";
import ppr8 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8364.jpeg";
import ppr9 from "../../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_9409.jpeg";

/**
 * Outil de cadrage — page de développement, jamais liée depuis le site.
 *
 * Chaque photo est montrée dans le cadre réel de la galerie. On glisse sur
 * l'image pour déplacer le cadrage, on change de format pour voir l'effet, et
 * la page recrache la liste des valeurs à reporter dans le contenu.
 *
 * Rien n'est enregistré : c'est un banc d'essai, pas un éditeur.
 */

type Shot = { name: string; image: StaticImageData };

const SETS: { label: string; shots: Shot[] }[] = [
  {
    label: "Les Pas pour Rire",
    shots: [
      { name: "IMG_7836", image: ppr1 },
      { name: "IMG_7945", image: ppr2 },
      { name: "IMG_8232", image: ppr3 },
      { name: "IMG_9217", image: ppr4 },
      { name: "IMG_8247", image: ppr5 },
      { name: "IMG_8250", image: ppr6 },
      { name: "IMG_9303", image: ppr7 },
      { name: "IMG_8364", image: ppr8 },
      { name: "IMG_9409", image: ppr9 },
    ],
  },
  {
    label: "Trisomie 21",
    shots: [
      { name: "IMG_4817", image: t1 },
      { name: "IMG_4828", image: t2 },
      { name: "IMG_4524", image: t3 },
      { name: "IMG_4743", image: t4 },
      { name: "IMG_4752", image: t5 },
      { name: "IMG_4768", image: t6 },
      { name: "IMG_4881", image: t7 },
      { name: "IMG_4898", image: t8 },
      { name: "IMG_4959", image: t9 },
      { name: "IMG_5030", image: t10 },
      { name: "IMG_5202", image: t11 },
      { name: "IMG_5225", image: t12 },
      { name: "IMG_5330", image: t13 },
      { name: "IMG_5354", image: t14 },
    ],
  },
];

/** Les cadres réellement utilisés par la galerie, plus deux comparaisons. */
const FRAMES = [
  { label: "Rangée 65 / 35 (galerie)", ratio: "auto", height: "27rem" },
  { label: "Pleine largeur 16:9", ratio: "16 / 9", height: "" },
  { label: "Carré", ratio: "1 / 1", height: "" },
  { label: "Portrait 4:5", ratio: "4 / 5", height: "" },
  { label: "Paysage 3:2", ratio: "3 / 2", height: "" },
];

export default function CadragePage() {
  const [frame, setFrame] = useState(0);
  const [set, setSet] = useState(0);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(
    Object.fromEntries(
      SETS.flatMap((entry) => entry.shots).map((shot) => [
        shot.name,
        { x: 50, y: 50 },
      ]),
    ),
  );
  const dragging = useRef<string | null>(null);

  const setFrom = (
    name: string,
    element: HTMLElement,
    clientX: number,
    clientY: number,
  ) => {
    const rect = element.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.min(
      100,
      Math.max(0, ((clientY - rect.top) / rect.height) * 100),
    );
    setPositions((current) => ({
      ...current,
      [name]: { x: Math.round(x), y: Math.round(y) },
    }));
  };

  const current = FRAMES[frame];
  const shots = SETS[set].shots;
  const output = shots
    .map((shot) => {
      const { x, y } = positions[shot.name];
      return `${shot.name} → focus: "${x}% ${y}%"`;
    })
    .join("\n");

  return (
    <main className="min-h-screen bg-[#F6F4EF] px-6 py-14 text-[#111111]">
      <div className="mx-auto max-w-[74rem]">
        <h1 className="text-3xl font-extrabold tracking-[-0.03em]">
          Outil de cadrage
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#696762]">
          Glisse sur une photo pour placer le point à garder. Le cadre montre le
          format réel de la galerie. Change de format pour comparer. En bas, la
          liste à me renvoyer telle quelle.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {SETS.map((entry, index) => (
            <button
              key={entry.label}
              type="button"
              onClick={() => setSet(index)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                index === set
                  ? "border-[#5b9c34] bg-[#5b9c34] text-white"
                  : "border-black/20 text-[#111111] hover:border-black/50"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FRAMES.map((option, index) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setFrame(index)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                index === frame
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-black/20 text-[#111111] hover:border-black/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot) => {
            const position = positions[shot.name];
            return (
              <li key={shot.name}>
                <div
                  onPointerDown={(event) => {
                    dragging.current = shot.name;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setFrom(
                      shot.name,
                      event.currentTarget,
                      event.clientX,
                      event.clientY,
                    );
                  }}
                  onPointerMove={(event) => {
                    if (dragging.current !== shot.name) return;
                    setFrom(
                      shot.name,
                      event.currentTarget,
                      event.clientX,
                      event.clientY,
                    );
                  }}
                  onPointerUp={() => {
                    dragging.current = null;
                  }}
                  style={{
                    aspectRatio:
                      current.ratio === "auto" ? undefined : current.ratio,
                    height:
                      current.ratio === "auto" ? current.height : undefined,
                  }}
                  className="relative w-full cursor-crosshair overflow-hidden bg-[#DDD9D1] select-none"
                >
                  <Image
                    src={shot.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 24rem, 100vw"
                    style={{ objectPosition: `${position.x}% ${position.y}%` }}
                    className="object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
                </div>

                <p className="mt-2 flex items-baseline justify-between font-mono text-xs text-[#696762]">
                  <span className="font-bold text-[#111111]">{shot.name}</span>
                  <span>
                    {position.x}% {position.y}%
                  </span>
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#696762]">
            À me renvoyer
          </p>
          <textarea
            readOnly
            value={output}
            rows={shots.length + 1}
            className="mt-4 w-full rounded-md border border-black/15 bg-white p-4 font-mono text-sm leading-6 text-[#111111]"
          />
        </div>
      </div>
    </main>
  );
}
