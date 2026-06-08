import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { ClientsLogoMarquee } from "@/components/ClientsMarqueeSection";
import { buildPageMetadata } from "@/lib/seo";
import { normalizeLocale, withLocaleHref, type Locale } from "@/lib/i18n/shared";

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
const cultureVideoSrc = streamPlayerSrc("15076d6da71cd98e4440cec783ae7bea");
const adVideoSrc = streamPlayerSrc("1259a29ee69ff065ba20545845ac0059");
const firstStoryVideoSrc = streamPlayerSrc("3fbb9b06d3d8fade3298d475ffedf514");
const secondStoryVideoSrc = streamPlayerSrc("cac0d156353a96a679f3137396293385");
const thirdStoryVideoSrc = streamPlayerSrc("d6c23b1aeb16803c21e39dc550b03a31");
const fourthStoryVideoSrc = streamPlayerSrc("23404c5dff0c7912b187308fee4290dc");

const pageCopy = {
  fr: {
    meta: {
      title: "Contenu vidéo pour le recrutement | Zéro huit",
      description:
        "Un forfait vidéo pensé pour aider les entreprises à attirer les bons candidats avec 3 mois de contenu prêt à publier.",
    },
    hero: {
      eyebrow: "Forfait recrutement",
      titleLine1: "Recrutez",
      titleLine2: "avec du contenu qui attire",
      lead:
        "Montrez l'équipe, l'ambiance et les vraies raisons de vous choisir. Votre culture devient votre meilleur argument.",
      primaryCta: "Planifier votre campagne",
      secondaryCta: "Voir le forfait",
      videoTitle: "Vidéo de fond recrutement Zéro huit",
    },
    package: {
      label: "Campagne recrutement",
      price: "5 995$",
      note: "+ taxes",
      customNote: "*Forfaits sur mesure disponibles",
      stats: [
        { value: "3 MOIS", label: "de contenu à publier" },
        { value: "1 JOURNÉE", label: "complète de tournage" },
        { value: "24 LIVRABLES", label: "vidéos, stories et photos" },
      ],
    },
    deliverables: {
      eyebrow: "Un tournage. Trois mois de présence.",
      title: "tout pour faire voir votre entreprise.",
      lead:
        "Un forfait clair pour nourrir vos campagnes RH, vos offres d'emploi et vos réseaux sans repartir de zéro chaque semaine.",
      items: [
        {
          title: "1 vidéo corporative",
          body: "Un portrait humain de votre culture, de vos équipes et de ce qui vous distingue.",
        },
        {
          title: "1 publicité de 30 secondes",
          body: "Un message court, direct et pensé pour accrocher les bons candidats.",
        },
        {
          title: "10 stories de 15 secondes",
          body: "Des capsules verticales prêtes pour vos réseaux et vos campagnes de recrutement.",
        },
        {
          title: "12 photos professionnelles",
          body: "Des images solides pour vos offres d'emploi, votre site carrière et vos publications.",
        },
      ],
    },
    examples: {
      eyebrow: "Du contenu qui donne envie",
      title: "faites sentir l'ambiance avant l'entrevue.",
      videos: [
        { label: "Vidéo corporative", title: "Votre équipe en action" },
        { label: "Publicité 30 secondes", title: "Un message qui se retient" },
      ],
      stories: [
        { title: "Le poste", hashtags: "#recrutement #emploi #equipe" },
        { title: "L'ambiance", hashtags: "#culture #entreprise #behindthescenes" },
        { title: "Les avantages", hashtags: "#carrieres #talents #rh" },
        { title: "La journée type", hashtags: "#worklife #metier #humain" },
      ],
    },
    process: {
      eyebrow: "Simple et efficace",
      title: "une journée sur le terrain. du contenu pour des mois.",
      body:
        "On prépare le message avec vous, on tourne ce qui rend votre milieu unique, puis on livre une banque de contenu prête à diffuser.",
      steps: [
        "Direction créative et plan de tournage",
        "Captation vidéo et photo en une journée",
        "Montage des livrables pour les formats clés",
      ],
      imageAlt: "Équipe Zéro huit en tournage",
    },
    cta: {
      title: "Attirez par ce qu'on voit.",
      body:
        "Donnez aux candidats une raison claire de se projeter chez vous avant même la première entrevue.",
      button: "Créer votre campagne de recrutement",
      imageAlt: "Équipe de production vidéo sur un plateau",
    },
  },
  en: {
    meta: {
      title: "Recruitment video content | Zéro huit",
      description:
        "A video package built to help companies attract the right candidates with 3 months of ready-to-post content.",
    },
    hero: {
      eyebrow: "Recruitment package",
      titleLine1: "Recruit",
      titleLine2: "with content that attracts",
      lead:
        "Show the team, the atmosphere and the real reasons to choose you. Your culture becomes your strongest argument.",
      primaryCta: "Plan your campaign",
      secondaryCta: "See the package",
      videoTitle: "Zéro huit recruitment background video",
    },
    package: {
      label: "Recruitment campaign",
      price: "$5,995",
      note: "+ taxes",
      customNote: "*Custom packages available",
      stats: [
        { value: "3 MONTHS", label: "of content to publish" },
        { value: "1 DAY", label: "full production day" },
        { value: "24 ASSETS", label: "videos, stories and photos" },
      ],
    },
    deliverables: {
      eyebrow: "One shoot. Three months of presence.",
      title: "everything to show your company.",
      lead:
        "A clear package to feed your HR campaigns, job posts and social channels without starting from scratch every week.",
      items: [
        {
          title: "1 corporate video",
          body: "A human portrait of your culture, your team and what makes you different.",
        },
        {
          title: "1 x 30-second ad",
          body: "A short, direct message built to catch the right candidates' attention.",
        },
        {
          title: "10 x 15-second stories",
          body: "Vertical cutdowns ready for your social channels and recruitment campaigns.",
        },
        {
          title: "12 professional photos",
          body: "Strong images for your job posts, career page and social content.",
        },
      ],
    },
    examples: {
      eyebrow: "Content that creates interest",
      title: "let candidates feel the atmosphere before the interview.",
      videos: [
        { label: "Corporate video", title: "Your team in action" },
        { label: "30-second ad", title: "A message people remember" },
      ],
      stories: [
        { title: "The role", hashtags: "#recruitment #jobs #team" },
        { title: "The vibe", hashtags: "#culture #company #behindthescenes" },
        { title: "The benefits", hashtags: "#careers #talent #hr" },
        { title: "A day at work", hashtags: "#worklife #craft #people" },
      ],
    },
    process: {
      eyebrow: "Simple and efficient",
      title: "one day on site. content for months.",
      body:
        "We shape the message with you, film what makes your workplace unique, then deliver a content bank ready to publish.",
      steps: [
        "Creative direction and shot plan",
        "Video and photo capture in one day",
        "Editing for the key formats",
      ],
      imageAlt: "Zéro huit crew on set",
    },
    cta: {
      title: "Attract with what people can see.",
      body:
        "Give candidates a clear reason to picture themselves with you before the first interview.",
      button: "Create your recruitment campaign",
      imageAlt: "Video production crew on set",
    },
  },
} as const;

function getRecruitmentPageCopy(locale: Locale) {
  return pageCopy[locale];
}

type IconType =
  | "calendar"
  | "camera"
  | "check"
  | "megaphone"
  | "phone"
  | "spark"
  | "video-camera";

function Icon({
  type,
  className = "h-7 w-7",
}: {
  type: IconType;
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

  if (type === "calendar") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M8 3.5v3" />
        <path d="M16 3.5v3" />
        <path d="M4 10h16" />
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

  if (type === "check") {
    return (
      <svg {...commonProps}>
        <path d="m5 12.5 4.2 4.2L19 6.8" />
      </svg>
    );
  }

  if (type === "megaphone") {
    return (
      <svg {...commonProps}>
        <path d="M4 13.5h3.5l9-4.5v10l-9-4.5H4v-1Z" />
        <path d="M7.5 14.5 9 20h3" />
        <path d="M19 10.2c.9.8 1.4 1.9 1.4 3.1s-.5 2.3-1.4 3.1" />
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

  return (
    <svg {...commonProps}>
      <path d="M4 7.5h10.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4v-9Z" />
      <path d="m16.5 10 4-2.3v8.6l-4-2.3" />
    </svg>
  );
}

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const copy = getRecruitmentPageCopy(locale);

  return buildPageMetadata({
    locale,
    path: "/recrutement",
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function RecrutementPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const copy = getRecruitmentPageCopy(locale);
  const requestHref = withLocaleHref(locale, "/demande");
  const deliverableIcons: IconType[] = ["video-camera", "megaphone", "phone", "camera"];

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
              <span className="block text-white">{copy.hero.titleLine1}</span>
              <span className="mt-3 block max-w-4xl text-3xl font-extrabold leading-none text-white sm:text-5xl lg:text-6xl">
                {copy.hero.titleLine2}
              </span>
            </h1>
            <div className="mt-7 h-1 w-28 bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f]" />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100 sm:text-xl">
              {copy.hero.lead}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={requestHref}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
              >
                {copy.hero.primaryCta}
              </Link>
              <Link
                href="#forfait"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                {copy.hero.secondaryCta}
              </Link>
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
                      type={index === 0 ? "calendar" : index === 1 ? "video-camera" : "spark"}
                      className={index === 2 ? "h-8 w-8" : "h-7 w-7"}
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

      <section id="forfait" className="bg-[#05070b] py-24">
        <ClientsLogoMarquee className="mb-16" />
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase text-[#5cc3d7]">
              {copy.deliverables.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              {copy.deliverables.title.replace(/\.$/, "")}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="mt-5 text-base leading-8 text-zinc-300 sm:text-lg">
              {copy.deliverables.lead}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.deliverables.items.map((item, index) => (
              <article
                key={item.title}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#5cc3d7]/45 text-[#5cc3d7]">
                  <Icon type={deliverableIcons[index]} />
                </div>
                <h3 className="mt-6 text-xl font-black uppercase leading-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080b10] py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase text-[#8acd5f]">
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
                ...copy.examples.videos[0],
                videoSrc: cultureVideoSrc,
              },
              {
                ...copy.examples.videos[1],
                videoSrc: adVideoSrc,
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
                  <div className="absolute bottom-5 left-4 right-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                      {example.label}
                    </p>
                    <h3 className="mt-2 text-sm font-medium leading-snug">
                      {example.title}
                    </h3>
                  </div>
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
            ].map((story) => (
              <article
                key={story.title}
                className="rounded-lg bg-gradient-to-b from-[#5cc3d7] via-white/25 to-[#8acd5f] p-[1px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-black">
                  <iframe
                    className="pointer-events-none h-full w-full"
                    src={story.videoSrc}
                    title={story.title}
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
                          <svg
                            aria-hidden
                            className="h-7 w-7"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 20.5c-.2 0-.4-.1-.6-.2C6.5 17.4 3 14.2 3 10.2 3 7.4 5.1 5.4 7.8 5.4c1.7 0 3.2.8 4.2 2.1 1-1.3 2.5-2.1 4.2-2.1 2.7 0 4.8 2 4.8 4.8 0 4-3.5 7.2-8.4 10.1-.2.1-.4.2-.6.2Z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Comment",
                        icon: (
                          <svg
                            aria-hidden
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v7A3.5 3.5 0 0 1 16.5 16H11l-5.3 4.2A1 1 0 0 1 4 19.4V5.5Z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Share",
                        icon: (
                          <svg
                            aria-hidden
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          >
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
                    <h3 className="text-sm font-medium leading-snug">{story.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/85">
                      {story.hashtags}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#05070b] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase text-[#8acd5f]">
              {copy.process.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-black uppercase leading-tight sm:text-5xl">
              {copy.process.title.replace(/\.$/, "")}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
              {copy.process.body}
            </p>
            <div className="mt-8 grid gap-4">
              {copy.process.steps.map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/45 text-[#5cc3d7]">
                    <Icon type="check" className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold uppercase text-zinc-200">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_0.8fr_1.1fr]">
            {[eventVerticalOne, eventVerticalTwo].map((image, index) => (
              <div
                key={index}
                className="relative min-h-96 overflow-hidden rounded-lg border border-white/15"
              >
                <Image
                  src={image}
                  alt={index === 0 ? copy.process.imageAlt : ""}
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
            href={requestHref}
            className="mt-9 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-7 py-3 text-sm font-black uppercase text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
          >
            {copy.cta.button}
          </Link>
        </div>
      </section>
    </main>
  );
}
