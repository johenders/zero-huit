import type { StaticImageData } from "next/image";

import type { SectorIconName } from "@/components/landing/SectorIcons";

/**
 * Modèle de contenu des landing pages sectorielles « high ticket ».
 *
 * Règle du guide : « Le type de contenu sectoriel doit rendre les blocs
 * obligatoires obligatoires dans TypeScript. Une page sectorielle ne doit pas
 * pouvoir être déployée sans étude de cas chiffrée ni bande démo sectorielle. »
 *
 * Deux mécanismes de qualité se complètent ici :
 *   1. Le typage garantit la PRÉSENCE des blocs (impossible de compiler sans).
 *   2. Les sentinelles {{PLACEHOLDER_…}} garantissent l'HONNÊTETÉ du contenu :
 *      rien d'inventé n'est publié. Voir `isPlaceholder` et `npm run check:secteurs`.
 */

/* ------------------------------------------------------------------ */
/* Sentinelles de contenu manquant                                     */
/* ------------------------------------------------------------------ */

/**
 * Une valeur que seul un humain peut fournir : chiffre client, témoignage
 * nominatif, fourchette de prix, identifiant vidéo, NEQ.
 *
 * Le guide interdit d'inventer ces valeurs. On les marque explicitement pour
 * que le code puisse les détecter et refuser de les publier.
 */
export type Placeholder = `{{${string}}}`;

const PLACEHOLDER_PATTERN = /^\{\{[A-Z0-9_]+\}\}$/;

export function isPlaceholder(value: unknown): value is Placeholder {
  return typeof value === "string" && PLACEHOLDER_PATTERN.test(value.trim());
}

/** Vrai si la valeur est utilisable telle quelle sur une page publiée. */
export function isPublishable(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0 && !isPlaceholder(value);
}

/** Recense toutes les sentinelles restantes dans un objet de contenu. */
export function collectPlaceholders(value: unknown, path = ""): string[] {
  if (isPlaceholder(value)) return [`${path || "(racine)"} = ${String(value)}`];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectPlaceholders(item, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      collectPlaceholders(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Statut de validation                                                */
/* ------------------------------------------------------------------ */

/**
 * Beaucoup d'affirmations d'une page de vente engagent l'entreprise : prix,
 * droits sur les fichiers, nombre de rondes de révision, assurances, délais.
 * Le guide interdit de les inventer.
 *
 * Les textes rédigés en brouillon portent donc `status: "a-valider"` : ils
 * sont visibles en développement (pour être corrigés), jamais en production.
 * Passer à `"valide"` est un geste humain, délibéré.
 */
export type ValidationStatus = "valide" | "a-valider";

export function isValidated(item: { status: ValidationStatus }): boolean {
  return item.status === "valide";
}

/* ------------------------------------------------------------------ */
/* Cardinalités imposées par le guide                                  */
/* ------------------------------------------------------------------ */

/** Le guide exige au minimum 8 objections traitées. */
export type AtLeast8<T> = readonly [T, T, T, T, T, T, T, T, ...T[]];
/** Le guide exige une FAQ de 6 à 10 questions. */
export type AtLeast6<T> = readonly [T, T, T, T, T, T, ...T[]];
/** Le guide vise 5 à 7 logos sectoriels ; 3 est le plancher acceptable. */
export type AtLeast3<T> = readonly [T, T, T, ...T[]];
export type AtLeast1<T> = readonly [T, ...T[]];

/* ------------------------------------------------------------------ */
/* Blocs                                                               */
/* ------------------------------------------------------------------ */

export type SectorCta = {
  /**
   * Règle : un seul intitulé d'action primaire, répété à l'identique sur
   * toute la page. Le CTA change de position, jamais de formulation.
   */
  label: string;
  href: string;
  /** Ce qui arrive après le clic, affiché sous le bouton (règle de clarté). */
  whatHappensNext: string;
};

/**
 * Voie de sortie basse pression : le comité d'achat n'est pas prêt à parler à
 * un vendeur à la première visite. Règle : toujours en offrir une.
 */
export type SectorLowPressureCta = {
  label: string;
  href: string | Placeholder;
  description: string;
};

export type SectorHero = {
  /** Positionne l'offre en une ligne : « Communications · Santé · Services sociaux ». */
  eyebrow: string;
  /** Lignes courtes : le H1 doit se scanner, pas se lire. */
  titleLine1: string;
  titleLine2?: string;
  /** Troisième ligne, pour un titre en trois temps. La dernière ligne rendue
   *  porte la ponctuation en dégradé. */
  titleLine3?: string;
  /** Descriptif factuel, en petits caractères — jamais en grandes majuscules. */
  subtitle: string;
  /** La promesse, en verbes d'action. */
  valuePropLead: string;
  valuePropBody?: string;
  /** Signal de confiance, décisif dans le secteur public et la santé. */
  trustLine?: string;
  trustPoints?: AtLeast3<string>;
  image: StaticImageData;
  imageAlt: string;
  /**
   * Vrai tant que l'image n'est pas une vraie photo du secteur. Une photo de
   * plateau générique fait douter le visiteur : elle est signalée jusqu'à son
   * remplacement.
   */
  imageIsTemporary: boolean;
};

/**
 * Carte vitrée du hero — reprise de la landing /evenements, qui fonctionne :
 * l'offre et son prix sont visibles dès le premier écran, à côté du titre.
 */
export type SectorHeroCard = {
  /** « Vos enjeux de communication. » — l'argument, pas un prix. */
  title: string;
  /** Deuxième ligne du titre, dans la section « enjeux ». */
  titleLine2?: string;
  /** Chapeau de la section « enjeux ». À défaut, le sous-titre du hero sert. */
  lead?: string;
  /**
   * Ce qu'on fait, puis pourquoi : `value` nomme le résultat visé, `label`
   * explique le problème qu'il règle. Dans le hero `card`, étroit (23rem),
   * chacun doit tenir sur une ligne — environ 27 et 38 caractères.
   */
  items: AtLeast3<{ icon: SectorIconName; value: string; label: string }>;
  footnote: string;
  /** Relance en bas de section, à la place de la note. */
  closingCta?: { question: string; label: string };
};

export type SectorLogo = {
  src: StaticImageData;
  /** Nom de l'organisation — sert d'attribut alt (règle d'accessibilité). */
  alt: string;
  /**
   * Règle : aucun logo sans autorisation écrite documentée.
   * Les logos « a-obtenir » ne sont jamais rendus en production.
   */
  authorization: "documentee" | "a-obtenir";
};

/** Le bloc qui prouve qu'on connaît le milieu mieux que le prospect. */
export type SectorProblem = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Réalités concrètes du secteur : cycles budgétaires, approbations, SEAO… */
  realities: AtLeast3<{ icon: SectorIconName; title: string; body: string }>;
  closing: string;
};

export type SectorVideoKind = "demo" | "case" | "message";

/**
 * Règle : trois vidéos maximum par page, jamais d'iframe tierce chargée au
 * chargement (facade pattern), sous-titres et transcription obligatoires.
 */
export type SectorVideo = {
  kind: SectorVideoKind;
  /** Identifiant Cloudflare Stream. */
  uid: string | Placeholder;
  title: string;
  /** Règle : afficher la durée avant la lecture. */
  durationSeconds: number;
  posterAlt: string;
  /**
   * Règle : nommer les contraintes techniques à côté de la vidéo.
   * « Le comité achète de la maîtrise du risque, pas de la beauté. »
   */
  productionNotes: AtLeast1<string>;
  /** Règle : transcription complète dans le DOM, repliable mais indexable. */
  transcript: string | Placeholder;
  /** Piste WebVTT française. */
  captionsSrc: string | Placeholder;
};

export type SectorMechanics = {
  eyebrow: string;
  title: string;
  lead: string;
  steps: AtLeast3<{
    icon: SectorIconName;
    title: string;
    body: string;
    /** Jalon concret : qui approuve, quel délai, quel livrable intermédiaire. */
    milestone: string;
  }>;
  deliverables: { title: string; items: AtLeast3<string> };
};

/**
 * Règle : une étude de cas doit contenir un chiffre que le client a fourni.
 * Sans chiffre, ce n'est pas une étude de cas, c'est un portfolio.
 */
export type SectorCaseStudy = {
  organization: string | Placeholder;
  context: string | Placeholder;
  constraint: string | Placeholder;
  approach: AtLeast1<string> | Placeholder;
  deliverables: AtLeast1<string> | Placeholder;
  result: {
    /** Ce qui a été mesuré. */
    metric: string | Placeholder;
    /** Le chiffre, tel que fourni par le client. */
    value: string | Placeholder;
    /** Qui a fourni le chiffre et comment il a été mesuré. */
    attribution: string | Placeholder;
  };
  /** Règle : témoignages nominatifs seulement. Anonyme = ne pas publier. */
  testimonial: {
    quote: string | Placeholder;
    name: string | Placeholder;
    role: string | Placeholder;
    organization: string | Placeholder;
  };
};

export type SectorObjection = {
  question: string;
  answer: string;
  status: ValidationStatus;
};

/**
 * Règle : afficher une fourchette. L'absence totale de prix fait fuir les
 * budgets qualifiés et attire les curieux.
 */
export type SectorInvestment = {
  eyebrow: string;
  title: string;
  lead: string;
  tiers: AtLeast1<{
    icon: SectorIconName;
    label: string;
    range: string | Placeholder;
    description: string;
    status: ValidationStatus;
  }>;
  /** Ce qui fait varier le montant — donne au champion les mots pour défendre. */
  drivers: AtLeast3<string>;
  note: string;
};

export type SectorTeam = {
  eyebrow: string;
  title: string;
  body: string;
  /** Crédibilité vérifiable exigée par les acheteurs publics. */
  credentials: AtLeast3<{ label: string; value: string | Placeholder }>;
  images: AtLeast3<{ src: StaticImageData; alt: string }>;
};

export type SectorFaqEntry = {
  question: string;
  answer: string;
  status: ValidationStatus;
};

export type SectorFinalCta = {
  title: string;
  body?: string;
  image: StaticImageData;
};


/* ------------------------------------------------------------------ */
/* Blocs de la landing publique                                        */
/* ------------------------------------------------------------------ */

/** Récit d'ouverture : pourquoi ces histoires méritent d'être racontées. */
/** Un temps de la méthode : le verbe, son objet, et l'image qui le montre. */
export type SectorNarrativePrinciple = {
  /** « Comprendre », « Clarifier », « Créer » — en petites capitales. */
  label: string;
  title: string;
  /** La phrase posée sur l'image. */
  caption: string;
  /** Ce que recouvre l'étape, sous le visuel. */
  body: string;
  /** Une vraie photo de mandat : des gens, un lieu réel, jamais du matériel seul. */
  image: StaticImageData;
  imageAlt: string;
};

/**
 * L'approche, montrée plutôt qu'énumérée : un message court à gauche, un grand
 * visuel à droite qui change avec l'étape. La section précédente nomme les
 * enjeux du client ; celle-ci fait ressentir la façon de travailler.
 */
export type SectorNarrative = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  /** Fragment de `titleLine2` mis en accent. Doit y figurer mot pour mot. */
  titleAccent: string;
  lead: string;
  principles: AtLeast3<SectorNarrativePrinciple>;
};

export type SectorService = {
  icon: SectorIconName;
  /** Catégorie affichée à côté du numéro : « 01 / PRODUCTION VIDÉO ». */
  category: string;
  /** Un mot, pour la barre de navigation sous le carrousel. */
  navLabel: string;
  title: string;
  body: string;
  examplesLabel: string;
  examples: AtLeast3<string>;
  /** Le visuel du service : des gens et des lieux réels, jamais du matériel seul. */
  image: StaticImageData;
  imageAlt: string;
};

export type SectorServices = {
  eyebrow: string;
  title: string;
  lead: string;
  items: AtLeast3<SectorService>;
};

/** À qui la page s'adresse, nommé explicitement. */
export type SectorAudiences = {
  eyebrow: string;
  title: string;
  lead: string;
  items: AtLeast3<string>;
};

export type SectorApproach = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Les contraintes propres au secteur, énoncées avant les principes. */
  constraints: AtLeast3<string>;
  bridge: string;
  principles: AtLeast3<{ icon: SectorIconName; title: string; body: string }>;
};

/**
 * Portfolio : des vidéos, rien d'autre. Contrairement à `demo`, ce bloc
 * n'exige ni transcription ni sous-titres — il montre le travail, il ne le
 * documente pas. Les titres sont facultatifs tant qu'ils ne sont pas écrits.
 */
export type SectorPortfolio = {
  eyebrow: string;
  title: string;
  lead?: string;
  items: AtLeast3<{
    /** Identifiant Cloudflare Stream. */
    uid: string;
    title?: string;
  }>;
  /** Renvoi vers le portfolio complet, sous les vidéos. */
  moreCta?: { label: string; href: string };
};

export type SectorProcess = {
  eyebrow: string;
  title: string;
  /** Deuxième ligne du titre, quand la promesse tient en deux temps. */
  titleLine2?: string;
  lead?: string;
  steps: AtLeast3<{
    icon: SectorIconName;
    title: string;
    body: string;
    /** Le verbe géant affiché derrière l'étape active : « Écouter », « Capter ». */
    accentWord: string;
  }>;
};

/**
 * Mandats et situations que le secteur reconnaît immédiatement.
 * C'est ici que vivent les offres propres au réseau : remise à neuf de
 * vidéothèque, projets d'envergure, et la contrainte budgétaire.
 */
export type SectorHighlights = {
  eyebrow: string;
  title: string;
  lead: string;
  items: AtLeast3<{
    icon: SectorIconName;
    title: string;
    body: string;
    points: AtLeast3<string>;
  }>;
};

/** « Un tournage. Plusieurs contenus. » — l'argument de rendement. */
export type SectorMultiplier = {
  eyebrow: string;
  title: string;
  lead: string;
  outputs: AtLeast3<string>;
  goal: string;
};

/** Relance en milieu de page : le lecteur se reconnaît dans une question. */
export type SectorMidCta = {
  title: string;
  questions: AtLeast3<string>;
  body: string;
  /** Libellés de l'outil « Composez votre projet ». */
  composer: {
    prompt: string;
    empty: string;
    summaryTitle: string;
    deliverables: string;
    reset: string;
  };
};

/* ------------------------------------------------------------------ */
/* Contenu complet d'un secteur, pour une langue                       */
/* ------------------------------------------------------------------ */

export type SectorContent = {
  meta: {
    title: string;
    description: string;
    /** Chemin canonique à mot-clé — une seule URL par secteur. */
    path: string;
    /** Nom du service pour le JSON-LD Service. */
    serviceName: string;
    breadcrumbLabel: string;
  };
  cta: SectorCta;
  lowPressureCta: SectorLowPressureCta;
  hero: SectorHero;
  heroCard: SectorHeroCard;
  proof: { label: string; logos: AtLeast3<SectorLogo> };

  /* --- Landing publique --- */
  narrative: SectorNarrative;
  /** Optionnel : tous les secteurs n'ont pas encore de vidéos publiables. */
  portfolio?: SectorPortfolio;
  services: SectorServices;
  highlights: SectorHighlights;
  audiences: SectorAudiences;
  approach: SectorApproach;
  process: SectorProcess;
  multiplier: SectorMultiplier;
  midCta: SectorMidCta;

  /* --- Dossier de référence (exigences du guide d'achat) --- */
  problem: SectorProblem;
  demo: { eyebrow: string; title: string; lead: string; videos: SectorVideo[] };
  mechanics: SectorMechanics;
  caseStudies: {
    eyebrow: string;
    title: string;
    lead: string;
    items: AtLeast1<SectorCaseStudy>;
  };
  objections: { eyebrow: string; title: string; items: AtLeast8<SectorObjection> };
  investment: SectorInvestment;
  team: SectorTeam;
  faq: { eyebrow: string; title: string; items: AtLeast6<SectorFaqEntry> };
  finalCta: SectorFinalCta;
};

export type SectorContentByLocale = {
  fr: SectorContent;
  en: SectorContent;
};
