import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { ClientsLogoMarquee } from "@/components/ClientsMarqueeSection";
import { buildPageMetadata } from "@/lib/seo";
import { normalizeLocale, withLocaleHref, type Locale } from "@/lib/i18n/shared";

import municipalMarketImage from "../../../assets/municipal/3508449025.jpg";
import municipalTerraceImage from "../../../assets/municipal/3517173771.jpg";
import municipalPaddleImage from "../../../assets/municipal/3534840079.jpg";
import municipalWinterImage from "../../../assets/municipal/3717117727.jpg";
import municipalHeroImage from "../../../assets/municipal/3947068668.jpg";
import municipalCtaImage from "../../../assets/municipal/3947069030.jpg";
import municipalSignsImage from "../../../assets/municipal/4099455827.jpg";
import municipalPeopleImage from "../../../assets/municipal/4099456026.jpg";

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

const municipalExampleVideoSrcs = [
  streamPlayerSrc("abd378a26e715f2dfef06ee6bfe36429", {
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
  }),
  streamPlayerSrc("c313de5c752ced9187431c236dcbf5ed", {
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
  }),
  streamPlayerSrc("9320943d9c307bd0b293f5b3f4066fad", {
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
  }),
];

const pageCopy = {
  fr: {
    meta: {
      title: "Production photo et vidéo municipale | Zéro huit",
      description:
        "Création de contenu photo, vidéo et promotionnel pour municipalités, organismes publics et projets communautaires.",
    },
    hero: {
      eyebrow: "Municipalités & organismes publics",
      titleLine1: "Notre caméra",
      titleLine2: "au service de vos idées",
      lead: "Créons du contenu qui reflète la force de votre communauté.",
      body:
        "Vidéo, photo et contenu promotionnel conçus spécialement pour les municipalités et organismes publics.",
      primaryCta: "Planifier une consultation gratuite",
      secondaryCta: "Voir notre approche",
      imageAlt: "Vue aérienne d'un territoire municipal au bord de l'eau",
    },
    proof: {
      label: "Approche municipale",
      body:
        "Un cadre clair pour transformer vos messages, vos lieux et vos projets en contenu utile, humain et prêt à diffuser.",
      stats: [
        { value: "01", label: "Consultation gratuite" },
        { value: "02", label: "Stratégie de contenu" },
        { value: "03", label: "Production terrain" },
      ],
    },
    expertise: {
      eyebrow: "Pourquoi travailler avec nous",
      title: "Une expertise développée auprès des municipalités.",
      body:
        "Au fil des années, nous avons développé une approche adaptée aux réalités municipales : communication citoyenne, valorisation du territoire, événements, tourisme, culture et projets communautaires.",
      label: "Ce qui nous distingue",
      items: [
        "Séance de brainstorming et consultation gratuite",
        "Accompagnement stratégique du début à la fin",
        "Production photo et vidéo haut de gamme",
        "Tarification accessible et adaptée aux réalités municipales",
        "Une équipe humaine, flexible et efficace",
      ],
    },
    importance: {
      eyebrow: "Pourquoi le contenu est important",
      title: "Votre image influence la perception de votre communauté.",
      lead:
        "Chaque municipalité a une histoire, une personnalité et des citoyens à représenter.",
      body:
        "Parce qu'aujourd'hui, votre présence visuelle est souvent le premier contact avec votre communauté.",
      items: [
        "Mieux transmettre vos messages",
        "Créer un sentiment d'appartenance",
        "Valoriser vos projets et événements",
        "Attirer touristes, familles et entreprises",
        "Refléter fidèlement la qualité de votre milieu de vie",
      ],
      imageAlt: "Moment de vie communautaire dans un espace public municipal",
    },
    examples: {
      eyebrow: "Exemples municipaux",
      title: "Des vidéos pensées pour informer, recruter et rassurer.",
      lead:
        "Chaque mandat part d'un objectif précis. On transforme ensuite ce message en contenu clair, utile et facile à diffuser.",
      objectiveLabel: "Objectif",
      items: [
        {
          city: "Salaberry-de-Valleyfield",
          title: "Entretien des patinoires",
          objective:
            "Montrer que l'entretien des patinoires requiert parfois la fermeture temporaire des installations.",
        },
        {
          city: "Salaberry-de-Valleyfield",
          title: "Recrutement étudiant",
          objective:
            "Promouvoir le recrutement d'étudiants pour les emplois d'été.",
        },
        {
          city: "Beauharnois",
          title: "Services de pompiers",
          objective:
            "Démystifier les services de pompiers de la ville avec des témoignages percutants.",
        },
      ],
    },
    process: {
      eyebrow: "Notre processus",
      title: "Une collaboration simple et efficace.",
      steps: [
        {
          title: "Brainstorming",
          body: "Discussion sur vos objectifs, votre réalité et le message à transmettre.",
        },
        {
          title: "Planification",
          body: "Création du concept, préparation du tournage et organisation de la production.",
        },
        {
          title: "Production",
          body: "Captation photo et vidéo professionnelle sur le terrain.",
        },
        {
          title: "Montage",
          body: "Montage dynamique, adaptation aux plateformes et livraison finale.",
        },
      ],
    },
    contentTypes: {
      eyebrow: "Types de contenu",
      title: "Des contenus adaptés à vos besoins.",
      items: [
        "Vidéos promotionnelles",
        "Capsules citoyennes",
        "Couverture d'événements",
        "Contenu touristique",
        "Recrutement et employeur",
        "Photos corporatives",
        "Médias sociaux",
        "Témoignages et projets municipaux",
      ],
    },
    human: {
      eyebrow: "Confiance & humain",
      title: "Votre partenaire créatif.",
      body:
        "Nous croyons qu'un bon contenu commence par une bonne compréhension des gens derrière le projet.",
      goal:
        "Notre objectif est simple : vous aider à communiquer clairement, humainement et avec impact.",
      button: "Planifier une consultation gratuite",
      imageAlt: "Employé municipal qui prépare de la signalisation",
    },
  },
  en: {
    meta: {
      title: "Municipal photo and video production | Zéro huit",
      description:
        "Photo, video and promotional content creation for municipalities, public organizations and community projects.",
    },
    hero: {
      eyebrow: "Municipalities & public organizations",
      titleLine1: "Our camera",
      titleLine2: "serving your ideas",
      lead: "Let's create content that reflects the strength of your community.",
      body:
        "Video, photo and promotional content designed specifically for municipalities and public organizations.",
      primaryCta: "Plan a free consultation",
      secondaryCta: "See our approach",
      imageAlt: "Aerial view of a waterfront municipal territory",
    },
    proof: {
      label: "Municipal approach",
      body:
        "A clear framework to turn your messages, places and projects into useful, human content ready to publish.",
      stats: [
        { value: "01", label: "Free consultation" },
        { value: "02", label: "Content strategy" },
        { value: "03", label: "Field production" },
      ],
    },
    expertise: {
      eyebrow: "Why work with us",
      title: "Expertise developed with municipalities.",
      body:
        "Over the years, we have developed an approach adapted to municipal realities: citizen communication, territory promotion, events, tourism, culture and community projects.",
      label: "What sets us apart",
      items: [
        "Free brainstorming session and consultation",
        "Strategic support from start to finish",
        "High-end photo and video production",
        "Accessible pricing adapted to municipal realities",
        "A human, flexible and efficient team",
      ],
    },
    importance: {
      eyebrow: "Why content matters",
      title: "Your image shapes how people perceive your community.",
      lead:
        "Every municipality has a story, a personality and citizens to represent.",
      body:
        "Today, your visual presence is often the first point of contact with your community.",
      items: [
        "Communicate your messages more clearly",
        "Create a stronger sense of belonging",
        "Showcase projects and events",
        "Attract tourists, families and businesses",
        "Reflect the quality of your living environment",
      ],
      imageAlt: "Community moment in a municipal public space",
    },
    examples: {
      eyebrow: "Municipal examples",
      title: "Videos built to inform, recruit and build trust.",
      lead:
        "Every mandate starts with a clear objective. We turn that message into useful content that is easy to publish.",
      objectiveLabel: "Objective",
      items: [
        {
          city: "Salaberry-de-Valleyfield",
          title: "Ice rink maintenance",
          objective:
            "Show that rink maintenance sometimes requires temporary facility closures.",
        },
        {
          city: "Salaberry-de-Valleyfield",
          title: "Student recruitment",
          objective: "Promote student recruitment for summer jobs.",
        },
        {
          city: "Beauharnois",
          title: "Fire services",
          objective:
            "Demystify the city's fire services through impactful testimonials.",
        },
      ],
    },
    process: {
      eyebrow: "Our process",
      title: "A simple and efficient collaboration.",
      steps: [
        {
          title: "Brainstorming",
          body: "A conversation about your goals, reality and the message to communicate.",
        },
        {
          title: "Planning",
          body: "Concept creation, shoot preparation and production organization.",
        },
        {
          title: "Production",
          body: "Professional photo and video capture on location.",
        },
        {
          title: "Editing",
          body: "Dynamic editing, platform adaptation and final delivery.",
        },
      ],
    },
    contentTypes: {
      eyebrow: "Content types",
      title: "Content adapted to your needs.",
      items: [
        "Promotional videos",
        "Citizen capsules",
        "Event coverage",
        "Tourism content",
        "Recruitment and employer brand",
        "Corporate photos",
        "Social media",
        "Testimonials and municipal projects",
      ],
    },
    human: {
      eyebrow: "Trust & people",
      title: "More than production: a creative partner.",
      body:
        "We believe strong content starts with a clear understanding of the people behind the project.",
      goal:
        "Our goal is simple: help you communicate clearly, humanly and with impact.",
      button: "Plan a free consultation",
      imageAlt: "Municipal employee preparing traffic signage",
    },
  },
} as const;

function getMunicipalPageCopy(locale: Locale) {
  return pageCopy[locale];
}

type IconType =
  | "building"
  | "camera"
  | "check"
  | "community"
  | "map"
  | "megaphone"
  | "spark"
  | "strategy"
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

  if (type === "building") {
    return (
      <svg {...commonProps}>
        <path d="M5 21V6.5L12 3l7 3.5V21" />
        <path d="M8 10h2" />
        <path d="M14 10h2" />
        <path d="M8 14h2" />
        <path d="M14 14h2" />
        <path d="M10 21v-4h4v4" />
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

  if (type === "community") {
    return (
      <svg {...commonProps}>
        <circle cx="8" cy="8.5" r="2.5" />
        <circle cx="16" cy="8.5" r="2.5" />
        <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
        <path d="M11.5 19a4.5 4.5 0 0 1 9 0" />
      </svg>
    );
  }

  if (type === "map") {
    return (
      <svg {...commonProps}>
        <path d="m9 18-5 2.5V6.5L9 4l6 2.5 5-2.5v14l-5 2.5L9 18Z" />
        <path d="M9 4v14" />
        <path d="M15 6.5v14" />
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

  if (type === "spark") {
    return (
      <svg {...commonProps}>
        <path d="M12 3.5 14.1 9l5.4 2.1-5.4 2.1L12 18.5l-2.1-5.3-5.4-2.1L9.9 9 12 3.5Z" />
        <path d="m18 15 1 2.4 2.5 1-2.5 1-1 2.4-1-2.4-2.5-1 2.5-1 1-2.4Z" />
      </svg>
    );
  }

  if (type === "strategy") {
    return (
      <svg {...commonProps}>
        <path d="M5 6h14" />
        <path d="M5 12h9" />
        <path d="M5 18h5" />
        <path d="m15 17 2 2 4-5" />
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
  const copy = getMunicipalPageCopy(locale);

  return buildPageMetadata({
    locale,
    path: "/municipal",
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

export default async function MunicipalPage() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));
  const copy = getMunicipalPageCopy(locale);
  const requestHref = withLocaleHref(locale, "/demande");
  const contentIcons: IconType[] = [
    "video-camera",
    "megaphone",
    "camera",
    "map",
    "community",
    "building",
    "spark",
    "strategy",
  ];

  return (
    <main className="font-['Montserrat'] bg-[#05070b] text-white">
      <section className="relative min-h-[88vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={municipalHeroImage}
            alt={copy.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.68)_46%,rgba(0,0,0,0.54)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b]/70 via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] w-full max-w-7xl flex-col justify-center gap-12 px-6 pb-16 pt-32 lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:px-10">
          <div className="max-w-5xl">
            <p className="pl-2 text-sm font-bold uppercase text-white sm:text-base">
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
              <span className="block text-white">{copy.hero.titleLine1}</span>
              <span className="mt-3 block max-w-5xl text-3xl font-extrabold leading-none text-white sm:text-5xl lg:text-6xl">
                {copy.hero.titleLine2}
              </span>
            </h1>
            <div className="mt-7 h-1 w-28 bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f]" />
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-zinc-100 sm:text-xl">
              {copy.hero.lead}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              {copy.hero.body}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={requestHref}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
              >
                {copy.hero.primaryCta}
              </Link>
              <Link
                href="#approche"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                {copy.hero.secondaryCta}
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-white/15 bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#5cc3d7]/50 text-[#5cc3d7]">
              <Icon type="building" />
            </div>
            <div className="mt-6 text-sm font-bold uppercase text-zinc-200">
              {copy.proof.label}
            </div>
            <p className="mt-4 text-sm leading-7 text-zinc-300">{copy.proof.body}</p>
            <div className="mt-7 grid gap-4">
              {copy.proof.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 border-t border-white/10 pt-4"
                >
                  <div className="bg-gradient-to-r from-[#26b7df] to-[#8acd5f] bg-clip-text text-3xl font-black leading-none text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold uppercase leading-5 text-zinc-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="approche" className="bg-[#05070b] py-24">
        <ClientsLogoMarquee className="mb-16" />
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase text-[#5cc3d7]">
              {copy.expertise.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              {copy.expertise.title.replace(/\.$/, "")}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              {copy.expertise.body}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-8">
            <p className="text-sm font-bold uppercase text-[#8acd5f]">
              {copy.expertise.label}
            </p>
            <div className="mt-7 grid gap-4">
              {copy.expertise.items.map((item) => (
                <div key={item} className="flex gap-4 border-t border-white/10 pt-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/45 text-[#5cc3d7]">
                    <Icon type="check" className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold uppercase leading-6 text-zinc-200">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080b10] py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
          <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
            <div className="relative min-h-[34rem] overflow-hidden rounded-lg border border-white/15">
              <Image
                src={municipalTerraceImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="grid gap-4">
              <div className="relative min-h-64 overflow-hidden rounded-lg border border-white/15">
                <Image
                  src={municipalMarketImage}
                  alt={copy.importance.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="relative min-h-64 overflow-hidden rounded-lg border border-white/15">
                <Image
                  src={municipalPaddleImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase text-[#8acd5f]">
              {copy.importance.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              {copy.importance.title.replace(/\.$/, "")}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-200 sm:text-lg">
              {copy.importance.lead}
            </p>
            <div className="mt-8 grid gap-4">
              {copy.importance.items.map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/45 text-[#5cc3d7]">
                    <Icon type="check" className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold uppercase text-zinc-200">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-xl text-base leading-8 text-zinc-400">
              {copy.importance.body}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080b10] py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-[#5cc3d7]">
                {copy.examples.eyebrow}
              </p>
              <h2 className="mt-5 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                {copy.examples.title.replace(/\.$/, "")}
                <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                  .
                </span>
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg lg:justify-self-end">
              {copy.examples.lead}
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {copy.examples.items.map((example, index) => (
              <article
                key={`${example.city}-${example.title}`}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
              >
                <div className="relative aspect-video bg-black">
                  <iframe
                    className="h-full w-full"
                    src={municipalExampleVideoSrcs[index]}
                    title={`${example.city} - ${example.title}`}
                    loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8acd5f]">
                    {example.city}
                  </p>
                  <h3 className="mt-3 text-xl font-black uppercase leading-tight text-white">
                    {example.title}
                  </h3>
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5cc3d7]">
                      {copy.examples.objectiveLabel}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">
                      {example.objective}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#05070b] py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase text-[#5cc3d7]">
              {copy.process.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              {copy.process.title.replace(/\.$/, "")}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                .
              </span>
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.process.steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
              >
                <div className="bg-gradient-to-r from-[#26b7df] to-[#8acd5f] bg-clip-text text-5xl font-black leading-none text-transparent">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-6 text-xl font-black uppercase leading-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080b10] py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-[#8acd5f]">
                {copy.contentTypes.eyebrow}
              </p>
              <h2 className="mt-5 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                {copy.contentTypes.title.replace(/\.$/, "")}
                <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                  .
                </span>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {copy.contentTypes.items.map((item, index) => (
                <article
                  key={item}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#5cc3d7]/45 text-[#5cc3d7]">
                    <Icon type={contentIcons[index]} className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-black uppercase leading-6 text-white">
                    {item}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#05070b] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase text-[#5cc3d7]">
              {copy.human.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-black uppercase leading-tight sm:text-5xl">
              {copy.human.title.replace(/\.$/, "")}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
              {copy.human.body}
            </p>
            <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-zinc-100">
              {copy.human.goal}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr_0.8fr]">
            <div className="relative min-h-96 overflow-hidden rounded-lg border border-white/15">
              <Image
                src={municipalWinterImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative min-h-96 overflow-hidden rounded-lg border border-white/15">
              <Image
                src={municipalSignsImage}
                alt={copy.human.imageAlt}
                fill
                sizes="(min-width: 1024px) 28vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative min-h-96 overflow-hidden rounded-lg border border-white/15">
              <Image
                src={municipalPeopleImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-[55vh] overflow-hidden">
        <Image
          src={municipalCtaImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[75vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <h2 className="max-w-4xl text-3xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
            {copy.human.title.replace(/\.$/, "")}
            <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
              .
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg">
            {copy.human.goal}
          </p>
          <Link
            href={requestHref}
            className="mt-9 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-7 py-3 text-sm font-black uppercase text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30"
          >
            {copy.human.button}
          </Link>
        </div>
      </section>
    </main>
  );
}
