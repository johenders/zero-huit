import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { buildPageMetadata } from "@/lib/seo";
import { getUiDictionary } from "@/lib/i18n/server";
import { normalizeLocale, withLocaleHref } from "@/lib/i18n/shared";
import { ClientsLogoMarquee } from "@/components/ClientsMarqueeSection";
import { EventDemoButton } from "./EventDemoButton";

import ctaImage from "../../../assets/events/cta.jpeg";
import eventHorizontalOne from "../../../assets/events/horizontal_1.jpg";
import eventHorizontalTwo from "../../../assets/events/horizontal_2.jpeg";
import eventVerticalOne from "../../../assets/events/verctical_1.jpeg";
import eventVerticalTwo from "../../../assets/events/verctical_2.jpeg";

const heroVideoId = "bf985a0f979573410fd3491d55e96722";

function streamPlayerSrc(
  videoId: string,
  {
    autoplay = true,
    muted = true,
    loop = true,
    controls = false,
    preload = "metadata",
  }: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    preload?: "metadata" | "auto";
  } = {},
) {
  const params = new URLSearchParams({
    autoplay: String(autoplay),
    muted: String(muted),
    loop: String(loop),
    controls: String(controls),
    preload,
    quality: "1080",
  });
  return `https://iframe.videodelivery.net/${videoId}?${params.toString()}`;
}

const heroVideoSrc = streamPlayerSrc(heroVideoId, { preload: "auto" });
const heroDemoVideoSrc = streamPlayerSrc(heroVideoId, {
  muted: false,
  loop: false,
  controls: true,
  preload: "auto",
});
const recapExampleVideoSrc = streamPlayerSrc("15076d6da71cd98e4440cec783ae7bea");
const shortExampleVideoSrc = streamPlayerSrc("1259a29ee69ff065ba20545845ac0059");
const firstStoryVideoSrc = streamPlayerSrc("3fbb9b06d3d8fade3298d475ffedf514");
const secondStoryVideoSrc = streamPlayerSrc("cac0d156353a96a679f3137396293385");
const thirdStoryVideoSrc = streamPlayerSrc("d6c23b1aeb16803c21e39dc550b03a31");
const fourthStoryVideoSrc = streamPlayerSrc("23404c5dff0c7912b187308fee4290dc");

const pageCopy = {
  fr: {
    meta: {
      title: "Recap événementiel | Zéro huit",
      description:
        "Un forfait recap événementiel simple pour revivre les meilleurs moments et faire rayonner votre événement.",
    },
    hero: {
      eyebrow: "Service événementiel",
      titleLine1: "Recap",
      titleLine2: "de votre événement",
      lead: "Revivez les meilleurs moments.",
      primaryCta: "Réservez votre date",
      demoCta: "Visionner notre démo",
      demoTitle: "Démo recap événementiel",
      closeDemo: "Fermer la démo",
      videoTitle: "Vidéo de fond événementielle Zéro huit",
    },
    package: {
      label: "Forfait recap",
      price: "2 195$",
      note: "+ taxes",
      customNote: "*Forfaits sur mesure disponibles",
      stats: [
        { value: "TOURNAGE", label: "jusqu'à une demi-journée" },
        { value: "MONTAGE RECAP", label: "60 à 90 secondes" },
        { value: "SHORT", label: "15 à 30 secondes" },
      ],
    },
    examples: {
      eyebrow: "Parce que chaque moment compte",
      title: "on était là.",
	      mainLabel: "Recap complet",
	      mainDuration: "90 secondes",
	      shortLabel: "Déclinaisons",
	      shortDuration: "30 secondes",
	      videos: {
	        mainTitle: "Jeux du Commerce",
	        shortTitle: "Régates de Valleyfield",
	      },
	      stories: [
        { title: "David Guetta au Beachclub", hashtags: "#davidguetta #recap #beachclub" },
        { title: "Fondation Anna-Laberge", hashtags: "#golf #tournoi #robertthibert" },
        { title: "Cégep de Valleyfield", hashtags: "#ceremonie #finissants #diplome" },
        { title: "Au Vieux", hashtags: "#brasseriefestive #party" },
      ],
    },
    option: {
      eyebrow: "En option",
      title: "Ajoutez un photographe",
      price: "795$",
      note: "+ taxes",
      body: "50 photos retouchées pour compléter votre recap et alimenter vos réseaux.",
      imageAlt: "Tournage avec micro et équipe vidéo",
    },
    cta: {
      title: "Revivez le moment.",
      body: "Réservez dès maintenant.",
      button: "Réservez votre date ou obtenez une soumission",
      imageAlt: "Équipe Zéro huit en tournage",
    },
  },
  en: {
    meta: {
      title: "Event recap video | Zéro huit",
      description:
        "A simple event recap package to capture the best moments and extend the reach of your event.",
    },
	    hero: {
	      eyebrow: "Event service",
	      titleLine1: "Recap",
	      titleLine2: "of your event",
	      lead: "Relive the best moments.",
	      primaryCta: "Reserve your date",
	      demoCta: "Watch our demo",
	      demoTitle: "Event recap demo",
      closeDemo: "Close demo",
      videoTitle: "Zéro huit event background video",
    },
	    package: {
	      label: "Recap package",
	      price: "$2,195",
	      note: "+ taxes",
	      customNote: "*Custom packages available",
	      stats: [
	        { value: "SHOOT", label: "up to a half-day" },
	        { value: "RECAP EDIT", label: "60 to 90 seconds" },
	        { value: "SHORT", label: "15 to 30 seconds" },
	      ],
	    },
	    examples: {
	      eyebrow: "Because every moment matters",
	      title: "we were there.",
	      mainLabel: "Full recap",
	      mainDuration: "90 seconds",
	      shortLabel: "Cutdowns",
	      shortDuration: "30 seconds",
	      videos: {
	        mainTitle: "Jeux du Commerce",
	        shortTitle: "Valleyfield Regattas",
	      },
	      stories: [
	        { title: "David Guetta at Beachclub", hashtags: "#davidguetta #recap #beachclub" },
	        { title: "Anna-Laberge Foundation", hashtags: "#golf #tournament #robertthibert" },
	        { title: "Valleyfield College", hashtags: "#prom #graduates2025 #diploma" },
	        { title: "Au Vieux", hashtags: "#festivepub #party" },
	      ],
	    },
    option: {
      eyebrow: "Optional add-on",
      title: "Add a photographer",
      price: "$795",
      note: "+ taxes",
	      body: "50 retouched photos to complete your recap and feed your social channels.",
	      imageAlt: "Shoot with microphone and video crew",
	    },
	    cta: {
	      title: "Relive the moment.",
	      body: "Reserve now.",
	      button: "Reserve your date or request a quote",
	      imageAlt: "Zéro huit crew on set",
	    },
  },
} as const;

function buildEventPageCopy(dictionary: Record<string, string>) {
  const fr = pageCopy.fr;
  const t = (key: string, fallback: string) => dictionary[key] ?? fallback;

  return {
    meta: {
      title: t("events.meta.title", fr.meta.title),
      description: t("events.meta.description", fr.meta.description),
    },
    hero: {
      eyebrow: t("events.hero.eyebrow", fr.hero.eyebrow),
      titleLine1: t("events.hero.title.line1", fr.hero.titleLine1),
      titleLine2: t("events.hero.title.line2", fr.hero.titleLine2),
      lead: t("events.hero.lead", fr.hero.lead),
      primaryCta: t("events.hero.cta.primary", fr.hero.primaryCta),
      demoCta: t("events.hero.cta.demo", fr.hero.demoCta),
      demoTitle: t("events.hero.demo.title", fr.hero.demoTitle),
      closeDemo: t("events.hero.demo.close", fr.hero.closeDemo),
      videoTitle: t("events.hero.video.title", fr.hero.videoTitle),
    },
    package: {
      label: t("events.package.label", fr.package.label),
      price: t("events.package.price", fr.package.price),
      note: t("events.package.note", fr.package.note),
      customNote: t("events.package.customNote", fr.package.customNote),
      stats: [
        {
          value: t("events.package.stat1.value", fr.package.stats[0].value),
          label: t("events.package.stat1.label", fr.package.stats[0].label),
        },
        {
          value: t("events.package.stat2.value", fr.package.stats[1].value),
          label: t("events.package.stat2.label", fr.package.stats[1].label),
        },
        {
          value: t("events.package.stat3.value", fr.package.stats[2].value),
          label: t("events.package.stat3.label", fr.package.stats[2].label),
        },
      ],
    },
    examples: {
      eyebrow: t("events.examples.eyebrow", fr.examples.eyebrow),
      title: t("events.examples.title", fr.examples.title),
      mainLabel: t("events.examples.mainLabel", fr.examples.mainLabel),
      shortLabel: t("events.examples.shortLabel", fr.examples.shortLabel),
      videos: {
        mainTitle: t("events.examples.video.mainTitle", fr.examples.videos.mainTitle),
        shortTitle: t("events.examples.video.shortTitle", fr.examples.videos.shortTitle),
      },
      stories: [
        {
          title: t("events.examples.story1.title", fr.examples.stories[0].title),
          hashtags: t("events.examples.story1.hashtags", fr.examples.stories[0].hashtags),
        },
        {
          title: t("events.examples.story2.title", fr.examples.stories[1].title),
          hashtags: t("events.examples.story2.hashtags", fr.examples.stories[1].hashtags),
        },
        {
          title: t("events.examples.story3.title", fr.examples.stories[2].title),
          hashtags: t("events.examples.story3.hashtags", fr.examples.stories[2].hashtags),
        },
        {
          title: t("events.examples.story4.title", fr.examples.stories[3].title),
          hashtags: t("events.examples.story4.hashtags", fr.examples.stories[3].hashtags),
        },
      ],
    },
    option: {
      eyebrow: t("events.option.eyebrow", fr.option.eyebrow),
      title: t("events.option.title", fr.option.title),
      price: t("events.option.price", fr.option.price),
      note: t("events.option.note", fr.option.note),
      body: t("events.option.body", fr.option.body),
      imageAlt: t("events.option.imageAlt", fr.option.imageAlt),
    },
    cta: {
      title: t("events.cta.title", fr.cta.title),
      body: t("events.cta.body", fr.cta.body),
      button: t("events.cta.button", fr.cta.button),
      imageAlt: t("events.cta.imageAlt", fr.cta.imageAlt),
    },
  };
}

function Icon({
  type,
  className = "h-7 w-7",
}: {
  type: "clock" | "play" | "share" | "spark" | "camera" | "video-camera" | "phone";
  className?: string;
}) {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "clock") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5v5l3.2 1.8" />
      </svg>
    );
  }

  if (type === "share") {
    return (
      <svg {...commonProps}>
        <path d="M7.5 13.5 16 18.2" />
        <path d="M16 5.8 7.5 10.5" />
        <circle cx="5.5" cy="12" r="2.3" />
        <circle cx="18.5" cy="4.5" r="2.3" />
        <circle cx="18.5" cy="19.5" r="2.3" />
      </svg>
    );
  }

  if (type === "video-camera") {
    return (
      <svg {...commonProps}>
        <path d="M4 7.5h10.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4v-9Z" />
        <path d="m16.5 10 4-2.3v8.6l-4-2.3" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg {...commonProps}>
        <rect x="7" y="3" width="10" height="18" rx="2.4" />
        <path d="M10.5 6h3" />
        <path d="M12 17.5h.01" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.5 14.1 9l5.4 2.1-5.4 2.1L12 18.5l-2.1-5.3-5.4-2.1L9.9 9 12 3.5Z" />
        <path d="m18 15 1 2.4 2.5 1-2.5 1-1 2.4-1-2.4-2.5-1 2.5-1 1-2.4Z" />
      </svg>
    );
  }

  if (type === "camera") {
    return (
      <svg {...commonProps}>
        <path d="M4 8.5h3.2l1.5-2h6.6l1.5 2H20v10H4v-10Z" />
        <circle cx="12" cy="13.5" r="3.2" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="m9.5 7.5 7 4.5-7 4.5v-9Z" />
    </svg>
  );
}

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  const copy = buildEventPageCopy(dictionary);

  return buildPageMetadata({
    locale,
    path: "/evenements",
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function EvenementsPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const dictionary = await getUiDictionary(locale);
  const copy = buildEventPageCopy(dictionary);

  return (
    <main className="font-['Montserrat'] bg-[#05070b] text-white">
      <section className="relative min-h-[88vh] overflow-hidden">
        <div className="absolute inset-0">
          <iframe
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "100vw",
              height: "100vh",
              minWidth: "177.78vh",
              minHeight: "56.25vw",
            }}
            src={heroVideoSrc}
            title={copy.hero.videoTitle}
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.24)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl flex-col justify-center gap-12 px-6 pb-16 pt-32 lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:px-10">
          <div className="max-w-4xl">
            <p className="pl-2 text-sm font-bold uppercase text-white sm:text-base">
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-6xl font-black uppercase leading-[0.86] sm:text-7xl lg:text-8xl xl:text-[8.4rem]">
              <span className="block text-white">
                {copy.hero.titleLine1}
              </span>
              <span className="mt-3 block text-3xl font-extrabold leading-none text-white sm:text-5xl lg:text-6xl">
                {copy.hero.titleLine2}
              </span>
            </h1>
            <div className="mt-7 h-1 w-28 bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f]" />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100 sm:text-xl">
              {copy.hero.lead}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={withLocaleHref(locale, "/evenements/demande")}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
              >
                {copy.hero.primaryCta}
              </Link>
              <EventDemoButton
                buttonLabel={copy.hero.demoCta}
                closeLabel={copy.hero.closeDemo}
                modalTitle={copy.hero.demoTitle}
                videoSrc={heroDemoVideoSrc}
              />
            </div>
          </div>

          <aside className="rounded-lg border border-white/15 bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7">
            <div className="text-sm font-bold uppercase text-zinc-200">
              {copy.package.label}
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="bg-gradient-to-r from-[#26b7df] to-[#8acd5f] bg-clip-text text-6xl font-black leading-none text-transparent sm:text-7xl">
                {copy.package.price}
              </div>
              <div className="pb-2 text-sm text-zinc-300">{copy.package.note}</div>
            </div>
            <div className="mt-8 grid gap-4">
              {copy.package.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 border-t border-white/10 pt-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
                    <Icon
                      type={index === 0 ? "video-camera" : index === 1 ? "play" : "phone"}
                      className={index === 1 ? "h-9 w-9" : "h-7 w-7"}
                    />
                  </div>
                  <div>
                    <div className="text-2xl font-black uppercase leading-none">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase text-zinc-300">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-white/10 pt-4 text-xs font-medium text-zinc-300">
              {copy.package.customNote}
            </p>
          </aside>
        </div>
      </section>

		      <section id="formats" className="bg-[#05070b] py-24">
		        <ClientsLogoMarquee className="mb-16" />
		        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
		          <div className="mx-auto max-w-3xl text-center">
	            <p className="text-sm font-bold uppercase text-[#5cc3d7]">
	              {copy.examples.eyebrow}
            </p>
	            <h2 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
	              {copy.examples.title.replace(/\.$/, "")}
	              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
	                .
	              </span>
	            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
	            {[
	              {
	                label: copy.examples.mainLabel,
	                title: copy.examples.videos.mainTitle,
	                videoSrc: recapExampleVideoSrc,
	              },
	              {
	                label: copy.examples.shortLabel,
	                title: copy.examples.videos.shortTitle,
	                videoSrc: shortExampleVideoSrc,
	              },
            ].map((example) => (
              <article
                key={example.label}
                className="rounded-lg bg-gradient-to-b from-[#5cc3d7] via-white/25 to-[#8acd5f] p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
	              >
		                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
		                  <iframe
		                    className="h-full w-full"
		                    src={example.videoSrc}
		                    title={example.label}
		                    loading="lazy"
		                    allow="autoplay; fullscreen; picture-in-picture"
		                    allowFullScreen
		                  />
		                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
		                  <h3 className="absolute bottom-5 left-4 right-4 text-sm font-medium leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
		                    {example.title}
		                  </h3>
		                </div>
	              </article>
	            ))}
	          </div>
	
	          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
	            {[
	              { ...copy.examples.stories[0], videoSrc: firstStoryVideoSrc },
	              { ...copy.examples.stories[1], videoSrc: secondStoryVideoSrc },
	              { ...copy.examples.stories[2], videoSrc: thirdStoryVideoSrc },
	              { ...copy.examples.stories[3], videoSrc: fourthStoryVideoSrc },
	            ].map((photo) => (
	              <article
	                key={photo.title}
	                className="rounded-lg bg-gradient-to-b from-[#5cc3d7] via-white/25 to-[#8acd5f] p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
	              >
	                <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-black">
	                  <iframe
	                    className="pointer-events-none h-full w-full"
	                    src={photo.videoSrc}
	                    title={photo.title}
	                    loading="lazy"
	                    allow="autoplay; fullscreen; picture-in-picture"
	                  />
                  <div className="absolute inset-x-3 top-3 z-10 h-1 overflow-hidden rounded-full bg-white/25">
                    <div className="h-full w-2/3 rounded-full bg-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />
                  <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                    {[
                      {
                        label: "Like",
                        icon: (
                          <svg aria-hidden className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 20.5c-.2 0-.4-.1-.6-.2C6.5 17.4 3 14.2 3 10.2 3 7.4 5.1 5.4 7.8 5.4c1.7 0 3.2.8 4.2 2.1 1-1.3 2.5-2.1 4.2-2.1 2.7 0 4.8 2 4.8 4.8 0 4-3.5 7.2-8.4 10.1-.2.1-.4.2-.6.2Z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Comment",
                        icon: (
                          <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v7A3.5 3.5 0 0 1 16.5 16H11l-5.3 4.2A1 1 0 0 1 4 19.4V5.5Z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Share",
                        icon: (
                          <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2 11 13" />
                            <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                          </svg>
                        ),
                      },
                    ].map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-white/15"
                        aria-label={action.label}
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                  <div className="absolute bottom-5 left-4 right-14 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                    <h3 className="text-sm font-medium leading-snug">{photo.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/85">{photo.hashtags}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080b10] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase text-[#8acd5f]">
              {copy.option.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-black uppercase leading-tight sm:text-5xl">
              {copy.option.title}
            </h2>
            <div className="mt-6 flex items-end gap-3">
              <div className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-5xl font-black leading-none text-transparent">
                {copy.option.price}
              </div>
              <div className="pb-1 text-sm text-zinc-400">{copy.option.note}</div>
            </div>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
              {copy.option.body}
            </p>
          </div>

	          <div className="grid gap-4 sm:grid-cols-[0.8fr_0.8fr_1.1fr]">
	            {[eventVerticalOne, eventVerticalTwo].map((image, index) => (
	              <div
	                key={index}
	                className="relative min-h-96 overflow-hidden rounded-lg border border-white/15"
              >
                <Image
                  src={image}
                  alt={index === 0 ? copy.option.imageAlt : ""}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
	            ))}
	            <div className="grid gap-4">
	              {[eventHorizontalOne, eventHorizontalTwo].map((image, index) => (
                <div
                  key={index}
                  className="relative min-h-44 overflow-hidden rounded-lg border border-white/15"
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-[75vh] overflow-hidden">
        <Image
          src={ctaImage}
          alt={copy.cta.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[75vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
	          <h2 className="max-w-4xl text-3xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
	            {copy.cta.title.replace(/\.$/, "")}
	            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
	              .
	            </span>
	          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
            {copy.cta.body}
          </p>
          <Link
            href={withLocaleHref(locale, "/evenements/demande")}
            className="mt-9 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-7 py-3 text-sm font-black uppercase text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
          >
            {copy.cta.button}
          </Link>
        </div>
      </section>
    </main>
  );
}
