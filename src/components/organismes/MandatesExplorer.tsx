"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { StreamVideo } from "@/components/organismes/StreamVideo";
import { type ProjectVideo } from "@/components/organismes/ProjectVideoGallery";

export type Mandate = {
  organisation: string;
  category: string;
  title: string;
  body: string;
  /**
   * La photo de la bannière. Tant qu'aucune image du projet n'est disponible,
   * elle affiche un bloc typographique : mieux vaut pas d'image qu'une image
   * de plateau qui laisserait croire qu'elle vient de ce mandat.
   */
  image?: StaticImageData;
  imageAlt?: string;
  /** Le récit du dossier, un paragraphe par entrée. */
  story?: readonly string[];
  /** Aligne les paragraphes deux par deux, dans leur ordre de lecture. */
  storyLayout?: "grid";
  /**
   * Le chiffre du mandat, sous le titre. Seul le nombre est en très grand ;
   * l'unité reste petite à côté, sinon un mot long déborde de la colonne.
   */
  figure?: { value: string; unit?: string; caption: string };
  /** Identifiant Cloudflare. Absent, l'emplacement s'affiche comme à venir. */
  videoUid?: string;
  /**
   * Quand un mandat porte plusieurs vidéos, chacune avec sa légende. Prend le
   * pas sur `videoUid` et `videoCaption`, qui restent la forme courte du cas
   * le plus fréquent : une seule vidéo.
   */
  videos?: readonly ProjectVideo[];
  /** Une galerie aérée, à trois colonnes sur ordinateur, pour les séries longues. */
  videoLayout?: "gallery";
  /** L'image de couverture du lecteur : une vraie photo du projet. */
  videoPoster?: StaticImageData;
  /** La ligne sous la vidéo. */
  videoCaption?: string;
  /**
   * `focus` est la valeur `object-position` de la photo : elle dit quelle
   * partie garder quand le cadre rogne. « center top » pour un sujet en haut,
   * « center » par défaut.
   */
  photos?: readonly Photo[];
  /** Réduit la largeur du reportage tout en le gardant centré. */
  photoLayout?: "compact";
  /**
   * Sans photos, l'emplacement du reportage reste visible en gris : il annonce
   * ce qui s'en vient. Ce drapeau le retire complètement pour un mandat qui
   * n'aura pas de reportage photo.
   */
  hidePhotoPlaceholder?: boolean;
  /**
   * Le pendant du précédent, pour le cadre vidéo : un mandat qui repose sur
   * ses photos n'a pas à traîner un lecteur vide au milieu de son dossier.
   */
  hideVideoPlaceholder?: boolean;
};

/** Symbole de lecture. En SVG plutôt qu'en bordures CSS, qui ne s'affichaient pas. */
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

/**
 * Les fragments encadrés d'astérisques passent en italique — les titres de
 * campagne, par exemple. Le découpage se fait au rendu ; le contenu reste une
 * simple chaîne.
 */
function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((segment, index) =>
        index % 2 === 1 ? (
          <em key={index} className="italic">
            {segment}
          </em>
        ) : (
          <span key={index}>{segment}</span>
        ),
      )}
    </>
  );
}

/**
 * Le rôle d'une photo dans le reportage :
 *   · `full`     — pleine largeur, en ratio naturel, donc jamais rognée ;
 *   · `duo`      — côte à côte, par deux ou trois, en ratio naturel ;
 *   · `portrait` — dans la bande de portraits, en 4:5 ;
 *   · `hero`     — pleine largeur en 16:9, pour un reportage en paysage ;
 *   · `wide`     — dans une bande de 16:9, trois par rangée ;
 *   · `viewer`   — absente de la page, accessible seulement en plein écran.
 *
 * `hero` et `wide` forment la paire des reportages tournés en paysage :
 * `full` et `portrait` rognent en 3:2 et en 4:5, ce qui couperait du 16:9.
 */
export type Photo = {
  image: StaticImageData;
  alt: string;
  role?: "full" | "duo" | "portrait" | "hero" | "wide" | "viewer";
  /** `object-position` : la partie à garder quand le cadre rogne. */
  focus?: string;
};

/** Blocs de photos montrés avant d'avoir à cliquer sur « voir plus ». */
const VISIBLE_BLOCKS = 2;

/**
 * Vignette tirée de la vidéo, quand aucune photo de couverture n'est fournie.
 *
 * `posterTime` dit à quelle seconde la prendre. Les deux premières secondes
 * tombent souvent sur un carton de titre ou un fondu : chaque vidéo peut donc
 * désigner un instant qui la représente mieux.
 */
const posterUrl = (uid: string, posterTime = 2) =>
  `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=${posterTime}s&height=1080`;

/**
 * Les vidéos d'un mandat, sous une forme unique : la liste si elle est
 * fournie, sinon la vidéo seule, sinon rien.
 */
function videosOf(mandate: Mandate) {
  if (mandate.videos && mandate.videos.length > 0) return mandate.videos;
  if (!mandate.videoUid) return [];
  return [
    {
      uid: mandate.videoUid,
      caption: (mandate.videoCaption ??
        `${mandate.organisation} — ${mandate.category}`) as string | undefined,
      posterTime: undefined as number | undefined,
    },
  ];
}

/**
 * La composition suit l'ordre du contenu : les pleines largeurs restent
 * seules, les portraits consécutifs se regroupent en une bande, et les photos
 * réservées à la visionneuse ne prennent aucune place dans la page.
 */
/**
 * Le nombre de colonnes d'une bande suit le nombre de photos : on choisit le
 * diviseur qui remplit les rangées sans laisser de trou au bout.
 */
const BAND_COLUMNS: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

function bandColumns(count: number) {
  const best = [5, 4, 6, 3].find((columns) => count % columns === 0) ?? 5;
  return BAND_COLUMNS[best];
}

/**
 * Les bandes en 16:9 respirent moins que les portraits : trois par rangée, ou
 * quatre quand le compte tombe juste et que trois laisserait un trou.
 */
function wideColumns(count: number) {
  const best = [3, 4].find((columns) => count % columns === 0) ?? 3;
  return BAND_COLUMNS[best];
}

type Block =
  | { type: "full"; index: number }
  | { type: "hero"; index: number }
  | { type: "duo"; indexes: number[] }
  | { type: "band"; indexes: number[] }
  | { type: "wide"; indexes: number[] };

/* Un rang de duos tient sur deux colonnes, sauf s'il en compte trois ou
   quatre : chacun garde alors sa propre colonne plutôt que de retomber sur une
   deuxième rangée dépareillée. */
function duoColumns(count: number) {
  if (count === 4) return "grid-cols-2 sm:grid-cols-4";
  if (count === 3) return "sm:grid-cols-3";
  return "sm:grid-cols-2";
}

function duoSizes(count: number) {
  if (count === 4) return "(min-width: 640px) 18rem, 50vw";
  if (count === 3) return "(min-width: 640px) 24rem, 100vw";
  return "(min-width: 640px) 36rem, 100vw";
}

function buildBlocks(photos: readonly Photo[]) {
  const blocks: Block[] = [];
  photos.forEach((photo, index) => {
    const role = photo.role ?? "portrait";
    if (role === "viewer") return;
    if (role === "full" || role === "hero") {
      blocks.push({ type: role, index });
      return;
    }
    const type = role === "duo" ? "duo" : role === "wide" ? "wide" : "band";
    const last = blocks[blocks.length - 1];
    if (last && last.type === type) last.indexes.push(index);
    else blocks.push({ type, indexes: [index] });
  });
  return blocks;
}

/**
 * Reportage photo : des rangées de largeurs inégales, alignées et de hauteur
 * constante. Le survol agrandit à peine, assombrit et annonce « Agrandir » ; le
 * clic ouvre la visionneuse, où les flèches naviguent, un compteur situe et
 * Échap ferme.
 */
function PhotoStory({
  photos,
  organisation,
  preview = false,
  featured = false,
}: {
  photos: readonly Photo[];
  organisation: string;
  preview?: boolean;
  featured?: boolean;
}) {
  const [opened, setOpened] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const total = photos.length;
  const blocks = buildBlocks(photos);
  const previewIndexes = photos
    .map((photo, index) => ({ photo, index }))
    .filter(({ index }) => !featured || index !== 0)
    .sort((a, b) =>
      Number(b.photo.image.height > b.photo.image.width) -
      Number(a.photo.image.height > a.photo.image.width),
    )
    .slice(0, 8)
    .map(({ index }) => index);

  /* Au repos, le reportage s'arrête après deux blocs : assez pour donner le
     ton, pas assez pour noyer la page. Le reste est à un clic. */
  const shown = expanded ? blocks : blocks.slice(0, VISIBLE_BLOCKS);
  const hiddenCount = blocks
    .slice(shown.length)
    .reduce(
      (count, block) =>
        count +
        (block.type === "full" || block.type === "hero"
          ? 1
          : block.indexes.length),
      0,
    );

  const go = useCallback(
    (next: number) =>
      setOpened((current) =>
        current === null ? null : (next + total) % total,
      ),
    [total],
  );

  useEffect(() => {
    if (opened === null) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpened(null);
      if (event.key === "ArrowRight") go(opened + 1);
      if (event.key === "ArrowLeft") go(opened - 1);
      if (event.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [go, opened]);

  /** Glissement horizontal dans la visionneuse. */
  const touchX = useRef<number | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchX.current === null || opened === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? opened + 1 : opened - 1);
  };

  const tile = (index: number, ratio: string, sizes: string, naturalRatio = false) => {
    const photo = photos[index];
    return (
      <button
        key={photo.image.src}
        type="button"
        onClick={() => setOpened(index)}
        aria-label={`Agrandir la photographie ${index + 1} sur ${total}`}
        style={naturalRatio ? { aspectRatio: photo.image.width / photo.image.height } : undefined}
        className={`group relative block w-full cursor-zoom-in overflow-hidden bg-[#DDD9D1] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#8acd5f] ${ratio}`}
      >
        <Image
          src={photo.image}
          alt={photo.alt}
          fill
          loading={index === 0 ? undefined : "lazy"}
          sizes={sizes}
          style={{ objectPosition: photo.focus ?? "center" }}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
        />
        <span className="absolute inset-0 bg-[#111111]/0 transition-colors duration-500 group-hover:bg-[#111111]/25 motion-reduce:transition-none" />
        <span className="absolute bottom-4 left-4 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none">
          Agrandir
        </span>
      </button>
    );
  };

  return (
    <>
      {preview ? (
        <div className="space-y-3">
          {featured ? tile(0, "aspect-video", "(min-width: 1024px) 46rem, 100vw") : null}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {previewIndexes.map((index) =>
              tile(index, "aspect-[4/5]", "(min-width: 1024px) 180px, (min-width: 640px) 23vw, 46vw"),
            )}
          </div>
        </div>
      ) : (
      <div className="space-y-3 sm:space-y-4">
        {shown.map((block, blockIndex) =>
          block.type === "full" ? (
            <div
              key={`full-${block.index}`}
              className="zh-reveal"
              style={{ animationDelay: `${blockIndex * 90}ms` }}
            >
              {/* Ratio naturel 3:2 : ces deux paysages ne sont pas rognés. */}
              {tile(
                block.index,
                "aspect-[3/2]",
                "(min-width: 640px) 74rem, 100vw",
              )}
            </div>
          ) : block.type === "hero" ? (
            <div
              key={`hero-${block.index}`}
              className="zh-reveal"
              style={{ animationDelay: `${blockIndex * 90}ms` }}
            >
              {/* 16:9 pleine largeur : le ratio de tournage, aucun rognage. */}
              {tile(
                block.index,
                "aspect-video",
                "(min-width: 640px) 74rem, 100vw",
              )}
            </div>
          ) : block.type === "wide" ? (
            <div
              key={`wide-${block.indexes[0]}`}
              className={`zh-reveal grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${wideColumns(
                block.indexes.length,
              )}`}
              style={{ animationDelay: `${blockIndex * 90}ms` }}
            >
              {block.indexes.map((index) =>
                tile(index, "aspect-video", "(min-width: 1024px) 24rem, 50vw"),
              )}
            </div>
          ) : block.type === "duo" ? (
            <div
              key={`duo-${block.indexes[0]}`}
              className={`zh-reveal grid gap-3 sm:gap-4 ${duoColumns(block.indexes.length)}`}
              style={{ animationDelay: `${blockIndex * 90}ms` }}
            >
              {block.indexes.map((index) =>
                tile(index, "", duoSizes(block.indexes.length), true),
              )}
            </div>
          ) : (
            <div
              key={`band-${block.indexes[0]}`}
              className={`zh-reveal grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${bandColumns(
                block.indexes.length,
              )}`}
              style={{ animationDelay: `${blockIndex * 90}ms` }}
            >
              {block.indexes.map((index) =>
                tile(index, "aspect-[4/5]", "(min-width: 1024px) 14rem, 50vw"),
              )}
            </div>
          ),
        )}
      </div>

      )}

      {preview ? (
        <button
          type="button"
          onClick={() => setOpened(0)}
          className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-[#111111] underline decoration-black/25 underline-offset-4 hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
        >
          Voir les {total} photos <span aria-hidden="true">↗</span>
        </button>
      ) : hiddenCount > 0 || expanded ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-black/20 px-7 py-3 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#111111] transition hover:border-black/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8acd5f] motion-reduce:transition-none"
          >
            {expanded ? "Voir moins" : `Voir plus (${hiddenCount})`}
            <span
              aria-hidden="true"
              className={`transition-transform duration-300 motion-reduce:transition-none ${
                expanded ? "rotate-180" : "group-hover:translate-y-0.5"
              }`}
            >
              ↓
            </span>
          </button>
        </div>
      ) : null}

      {opened !== null ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photographie ${opened + 1} sur ${total} — ${organisation}`}
          onClick={() => setOpened(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-50 flex flex-col bg-[#111111]/96 p-4 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs tabular-nums text-white/60">
              <span className="text-white">
                {String(opened + 1).padStart(2, "0")}
              </span>
              <span className="mx-1.5">/</span>
              {String(total).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={() => setOpened(null)}
              aria-label="Fermer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-xl text-white transition hover:border-white motion-reduce:transition-none"
            >
              ×
            </button>
          </div>

          <div className="relative mt-4 min-h-0 flex-1">
            <Image
              src={photos[opened].image}
              alt={photos[opened].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="mt-4 flex justify-center gap-4">
            {(["précédente", "suivante"] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  go(opened + (direction === "suivante" ? 1 : -1));
                }}
                aria-label={`Photographie ${direction}`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-lg text-white transition hover:border-white motion-reduce:transition-none"
              >
                {direction === "suivante" ? "→" : "←"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Un seul média principal, avec des commandes discrètes pour les séries. */
function MandateVideos({ videos, organisation }: {
  videos: readonly ProjectVideo[];
  organisation: string;
}) {
  const [activeVideo, setActiveVideo] = useState(0);
  const video = videos[activeVideo];
  const label = video.caption ?? `Vidéo ${activeVideo + 1}`;

  return (
    <div className="min-w-0">
      <h4 className="sr-only">Vidéos du projet</h4>
      <figure>
        <div className="relative aspect-video overflow-hidden bg-[#111111]">
          <StreamVideo
            key={video.uid}
            uid={video.uid}
            title={`${organisation} — ${label}`}
            ariaLabel={`Lire ${label} — ${organisation}`}
            poster={posterUrl(video.uid, video.posterTime)}
          >
            <Image
              src={posterUrl(video.uid, video.posterTime)}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 44rem, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#111111] transition-transform group-hover:scale-105 motion-reduce:transition-none">
                <PlayMark className="ml-1 h-8 w-8" />
              </span>
            </span>
          </StreamVideo>
        </div>
        <figcaption className="mt-3 flex min-h-11 items-center justify-between gap-4 text-sm text-[#55534f]">
          <span>{video.caption ?? "Le projet en vidéo"}</span>
          {videos.length > 1 ? (
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" aria-label="Vidéo précédente" disabled={activeVideo === 0} onClick={() => setActiveVideo((index) => index - 1)} className="flex h-11 w-11 items-center justify-center text-lg text-[#111111] hover:text-[#1f8ba3] disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-[#111111]">←</button>
              <select
                aria-label={`Choisir une vidéo — ${organisation}`}
                value={activeVideo}
                onChange={(event) => setActiveVideo(Number(event.target.value))}
                className="h-11 w-20 cursor-pointer bg-transparent text-center font-mono text-xs text-[#55534f] focus-visible:outline-2 focus-visible:outline-[#111111]"
              >
                {videos.map((item, index) => <option key={item.uid} value={index}>{index + 1} / {videos.length}{item.caption ? ` — ${item.caption}` : ""}</option>)}
              </select>
              <button type="button" aria-label="Vidéo suivante" disabled={activeVideo === videos.length - 1} onClick={() => setActiveVideo((index) => index + 1)} className="flex h-11 w-11 items-center justify-center text-lg text-[#111111] hover:text-[#1f8ba3] disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-[#111111]">→</button>
            </div>
          ) : null}
        </figcaption>
      </figure>
    </div>
  );
}

/** Le texte et le média principal se lisent côte à côte, sans contenu replié. */
export function MandatesExplorer({ mandates }: { mandates: readonly Mandate[] }) {
  const [active, setActive] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const current = mandates[active];
  const videos = videosOf(current);
  const photos = current.photos?.length ? current.photos : null;

  const select = (index: number) => {
    setActive(index);
    const target = window.matchMedia("(max-width: 1023px)").matches
      ? mediaRef.current
      : navigationRef.current;
    if (target) {
      target.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  };

  return (
    <div className="mt-10 sm:mt-12">
      <nav ref={navigationRef} aria-label="Choisir un projet" className="mb-7 scroll-mt-40 border-b border-black/15">
        <ul className="flex gap-6 overflow-x-auto [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:gap-8 [&::-webkit-scrollbar]:hidden">
          {mandates.map((mandate, index) => {
            const isActive = index === active;
            return (
              <li key={mandate.organisation} className="w-40 shrink-0 lg:w-auto">
                <button
                  type="button"
                  onClick={() => select(index)}
                  aria-pressed={isActive}
                  aria-controls="mandat-dossier"
                  className={`group relative block w-full border-b-[3px] pt-2 pb-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1f8ba3] ${isActive ? "border-[#8acd5f] text-[#111111]" : "border-transparent text-[#696762] hover:border-black/20 hover:text-[#111111]"}`}
                >
                  <span className="block min-h-[2lh] text-sm font-bold leading-snug">{mandate.organisation}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div ref={mediaRef} id="mandat-dossier" className="min-w-0 scroll-mt-28">
        <p role="status" className="sr-only">{current.organisation} : {videos.length} vidéos et {photos?.length ?? 0} photos.</p>
        <div key={current.organisation}>
          <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.6fr] lg:gap-14">
            <div className="lg:sticky lg:top-44">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#1f8ba3]">{current.category}</p>
              <h3 className="mt-4 text-2xl font-bold leading-[1.15] tracking-[-0.035em] text-[#111111] sm:text-[2rem]">{current.title}</h3>
              <div className="mt-6 space-y-4 text-base leading-[1.8] text-[#55534f]">
                <p><Emphasis text={current.body} /></p>
                {current.story?.map((paragraph) => <p key={paragraph}><Emphasis text={paragraph} /></p>)}
              </div>
              {current.figure ? (
                <p className="mt-6 text-base leading-relaxed text-[#55534f]"><span className="mr-3 text-3xl font-extrabold text-[#111111]">{current.figure.value} {current.figure.unit}</span>{current.figure.caption}</p>
              ) : null}
            </div>
            <div className="min-w-0">
              {videos.length > 0 ? <MandateVideos videos={videos} organisation={current.organisation} /> : null}
              {photos ? (
                <div className={videos.length ? "mt-5" : ""}>
                  <h4 className="sr-only">Photographies du projet</h4>
                  <PhotoStory photos={photos} organisation={current.organisation} preview featured={!videos.length} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
