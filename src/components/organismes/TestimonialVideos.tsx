"use client";

import Image from "next/image";

import { StreamVideo } from "@/components/organismes/StreamVideo";

export type Testimonial = {
  /** L'organisme qui parle. */
  organisation: string;
  /** La personne et son rôle, quand ils sont connus. */
  attribution?: string;
  /** Identifiant Cloudflare. Absent, l'emplacement s'affiche comme à venir. */
  videoUid?: string;
  /** Un extrait court de ce que la personne dit dans la vidéo. */
  quote?: string;
};

/**
 * Témoignages en vidéo.
 *
 * Lecteur en façade : la vignette vient de Cloudflare et rien n'est chargé
 * avant le clic. Sans identifiant, l'emplacement se montre tel qu'il est — on
 * affiche la place, jamais une parole qu'on n'a pas.
 */

/** Symbole de lecture, en SVG : le triangle en bordures CSS ne s'affichait pas. */
function PlayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M9 6.5v11a.6.6 0 0 0 .92.5l8.2-5.5a.6.6 0 0 0 0-1l-8.2-5.5A.6.6 0 0 0 9 6.5Z" />
    </svg>
  );
}

const posterUrl = (uid: string) =>
  `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=2s&height=720`;

export function TestimonialVideos({
  testimonials,
}: {
  testimonials: readonly Testimonial[];
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-0">
      {testimonials.map((testimonial, index) => {
        return (
          <li
            key={testimonial.organisation}
            className="sm:row-span-4 sm:grid sm:grid-rows-subgrid sm:gap-y-0"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#DDD9D1]">
              {testimonial.videoUid ? (
                <StreamVideo
                  uid={testimonial.videoUid}
                  title={`Témoignage — ${testimonial.organisation}`}
                  ariaLabel={`Lire le témoignage de ${testimonial.organisation}`}
                  poster={posterUrl(testimonial.videoUid)}
                >
                  <Image
                    src={posterUrl(testimonial.videoUid)}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 640px) 24rem, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <span className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/10 motion-reduce:transition-none" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-black/30 backdrop-blur-sm transition duration-300 group-hover:border-[#8acd5f] motion-reduce:transition-none">
                      <PlayMark className="ml-0.5 h-6 w-6 text-white" />
                    </span>
                  </span>
                </StreamVideo>
              ) : (
                /* Emplacement en attente de la vidéo. */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#111111]/25"
                  >
                    <PlayMark className="ml-0.5 h-6 w-6 text-[#111111]/25" />
                  </span>
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#111111]/40">
                    Témoignage {index + 1} — à venir
                  </span>
                </div>
              )}
            </div>

            {/* La citation porte la parole ; le nom vient l'attribuer. */}
            {testimonial.quote ? (
              /* Les guillemets sont dans le fil du texte, ouvrants et
                 fermants : plus gros que la citation, mais alignés sur elle,
                 donc rien ne déborde de la colonne. */
              <blockquote className="mt-5">
                <p className="text-center text-base font-semibold italic leading-[1.5] tracking-[-0.015em] text-[#111111] sm:text-[1.05rem]">
                  <span
                    aria-hidden="true"
                    className="mr-1 align-[-0.14em] text-[1.7em] leading-none text-[#8acd5f]"
                  >
                    &laquo;
                  </span>
                  {testimonial.quote}
                  <span
                    aria-hidden="true"
                    className="ml-1 align-[-0.14em] text-[1.7em] leading-none text-[#8acd5f]"
                  >
                    &raquo;
                  </span>
                </p>
              </blockquote>
            ) : (
              <p className="mt-5 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#111111]/35">
                Citation — à venir
              </p>
            )}

            <p className="mt-4 text-center text-sm font-extrabold tracking-[-0.01em] text-[#111111]">
              {testimonial.organisation}
            </p>
            {testimonial.attribution ? (
              <p className="mt-1 text-center text-sm text-[#696762]">
                {testimonial.attribution}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
