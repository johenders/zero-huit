import { headers } from "next/headers";

import SectorLanding, {
  exampleVideoSrc,
  type IconType,
  type SectorLandingCopy,
} from "@/components/SectorLanding";
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

const municipalExampleVideoSrcs = [
  exampleVideoSrc("abd378a26e715f2dfef06ee6bfe36429"),
  exampleVideoSrc("c313de5c752ced9187431c236dcbf5ed"),
  exampleVideoSrc("9320943d9c307bd0b293f5b3f4066fad"),
];

const municipalImages = {
  hero: municipalHeroImage,
  importanceTall: municipalTerraceImage,
  importanceTop: municipalMarketImage,
  importanceBottom: municipalPaddleImage,
  humanLeft: municipalWinterImage,
  humanCenter: municipalSignsImage,
  humanRight: municipalPeopleImage,
  cta: municipalCtaImage,
};

const municipalContentIcons: IconType[] = [
  "video-camera",
  "megaphone",
  "camera",
  "map",
  "community",
  "building",
  "spark",
  "strategy",
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
          client: "Salaberry-de-Valleyfield",
          title: "Entretien des patinoires",
          objective:
            "Montrer que l'entretien des patinoires requiert parfois la fermeture temporaire des installations.",
        },
        {
          client: "Salaberry-de-Valleyfield",
          title: "Recrutement étudiant",
          objective:
            "Promouvoir le recrutement d'étudiants pour les emplois d'été.",
        },
        {
          client: "Beauharnois",
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
          client: "Salaberry-de-Valleyfield",
          title: "Ice rink maintenance",
          objective:
            "Show that rink maintenance sometimes requires temporary facility closures.",
        },
        {
          client: "Salaberry-de-Valleyfield",
          title: "Student recruitment",
          objective: "Promote student recruitment for summer jobs.",
        },
        {
          client: "Beauharnois",
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

function getMunicipalPageCopy(locale: Locale): SectorLandingCopy {
  return pageCopy[locale];
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

  return (
    <SectorLanding
      copy={getMunicipalPageCopy(locale)}
      images={municipalImages}
      requestHref={withLocaleHref(locale, "/demande")}
      proofIcon="building"
      contentIcons={municipalContentIcons}
      exampleVideoSrcs={municipalExampleVideoSrcs}
    />
  );
}
