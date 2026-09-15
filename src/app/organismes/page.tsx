import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import {
  MandatesExplorer,
  type Mandate,
} from "@/components/organismes/MandatesExplorer";
import {
  NeedsExplorer,
  type Need,
} from "@/components/organismes/NeedsExplorer";
import {
  TestimonialVideos,
  type Testimonial,
} from "@/components/organismes/TestimonialVideos";
import { normalizeLocale } from "@/lib/i18n/shared";
import { buildPageMetadata } from "@/lib/seo";
import blobPattern from "../../../assets/landingpage/Organimes/blob-scatter-haikei.svg";
import t211 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4817.jpg";
import t212 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4828.jpg";
import t213 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4524.jpg";
import t214 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4743.jpg";
import t215 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4752.jpg";
import t216 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4768.jpg";
import t217 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4881.jpg";
import t218 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4898.jpg";
import t219 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_4959.jpg";
import t2110 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5030.jpg";
import t2111 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5202.jpg";
import t2112 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5225.jpg";
import t2113 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5330.jpg";
import t2114 from "../../../assets/landingpage/Organimes/Photos - Trisomie 21/IMG_5354.jpg";
import ppr1 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_7836.jpeg";
import ppr2 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_7945.jpeg";
import ppr3 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8232.jpeg";
import ppr4 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_9217.jpeg";
import ppr5 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8247.jpeg";
import ppr6 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8250.jpeg";
import ppr7 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_9303.jpeg";
import ppr8 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_8364.jpeg";
import ppr9 from "../../../assets/landingpage/Organimes/Photos - Les pas pour rire/Web/IMG_9409.jpeg";
import heroImage from "../../../assets/landingpage/Organimes/hero-organisme.jpg";
import espaceBts1 from "../../../assets/landingpage/Organimes/Photos - Espace Suroit/DSCF7529.jpg .jpg";
import espaceBts2 from "../../../assets/landingpage/Organimes/Photos - Espace Suroit/DSCF7587.jpg";
import espaceBts3 from "../../../assets/landingpage/Organimes/Photos - Espace Suroit/DSCF7498.jpg";
import espaceBts4 from "../../../assets/landingpage/Organimes/Photos - Espace Suroit/DSCF7516.jpg";
import listenImage from "../../../assets/bts/IMG_7132.jpg";
import meetingImage from "../../../assets/bts/IMG_2410.jpg";
import monitorImage from "../../../assets/bts/IMG_7175.jpg";
import crewImage from "../../../assets/bts/IMG_8361-2.jpg";
import setupImage from "../../../assets/bts/IMG_3434.jpg";
import pairImage from "../../../assets/bts/DSCF8758.jpg";
import fundingImage from "../../../assets/bts/IMG_6349.jpg";

/**
 * Landing « organismes communautaires ».
 *
 * Direction documentaire : photo pleine largeur, blanc chaud, charbon, et les
 * accents cyan et vert de la marque. L'en-tête et le pied de page viennent de
 * `SiteShell`, qui reconnaît cette route comme une landing sectorielle.
 *
 * Les animations réutilisent `zh-reveal` et `zh-fade` de `globals.css` : elles
 * sont pilotées par le défilement, sans JavaScript, et déjà protégées par
 * `prefers-reduced-motion` et un `@supports`. Sans prise en charge, tout
 * s'affiche immédiatement.
 */

const CONTACT_HREF = "/contact";

/** Grain cinématographique : une turbulence SVG, aucun fichier à charger. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/** Témoignages : citations fournies par l'équipe. */
const TESTIMONIALS: readonly Testimonial[] = [
  {
    organisation: "Les Pas pour Rire",
    attribution: "Sonia Viau",
    videoUid: "9f77c54f9b270fd079ef4eb7f048c024",
    quote:
      "Votre approche est super bonne, vous êtes vraiment à l’écoute et êtes capables de vous ajuster en fonction de nos besoins.",
  },
  {
    organisation: "Espace Suroît",
    attribution: "Karine Savoie",
    videoUid: "492a8f24810cf635bd473036ffc09c01",
    quote:
      "L’ambiance est agréable et le résultat est hyper professionnel et pile ce qu’on veut.",
  },
  {
    organisation: "Club Joie de Vivre",
    attribution: "François Tessier",
    videoUid: "d0befe7f32629b086e1a6589c06eeb6b",
    quote:
      "Notre campagne nous a généré énormément de visibilité sur les réseaux sociaux.",
  },
];

const MANDATES: readonly Mandate[] = [
  {
    organisation: "Les Pas pour Rire",
    category: "Documentaire",
    title: "Bien plus qu'une pièce de théâtre",
    body: "Pour les 30 ans des Pas pour Rire, nous avons suivi des adultes vivant avec une déficience intellectuelle dans la préparation de leur nouvelle pièce de théâtre.",
    story: [
      "Des répétitions à la scène, le documentaire capte les doutes, les fous rires et la fierté des comédiens. Un regard sur la confiance et les liens qui se créent au fil du projet.",
      "Le récit met en lumière la mission de la troupe : offrir à chacun un espace pour créer, avancer à son rythme et être reconnu pour son talent et sa personnalité.",
    ],
    videoPoster: ppr4,
    videoCaption: "Les Pas pour Rire — Documentaire du 30e anniversaire",
    /* Texte alternatif vide : ces photos illustrent un récit déjà décrit juste
       au-dessus. Mieux vaut cela qu'une description approximative. */
    /* Chaque photo joue le rôle que l'équipe lui a donné : deux pleines
       largeurs en ratio naturel ouvrent et ferment, cinq portraits forment la
       bande centrale, et deux restent réservées à la visionneuse. */
    photos: [
      { image: ppr7, alt: "", role: "duo", focus: "72% 45%" }, // IMG_9303 — toute la troupe
      { image: ppr4, alt: "", role: "duo", focus: "49% 42%" }, // IMG_9217 — le 30e anniversaire
      { image: ppr6, alt: "", role: "portrait", focus: "53% 67%" }, // IMG_8250 — préparation
      { image: ppr2, alt: "", role: "portrait", focus: "30% 19%" }, // IMG_7945 — le tournage
      { image: ppr5, alt: "", role: "portrait", focus: "50% 50%" }, // IMG_8247 — l'humour
      { image: ppr8, alt: "", role: "portrait", focus: "50% 50%" }, // IMG_8364 — la complicité
      { image: ppr1, alt: "", role: "portrait", focus: "50% 30%" }, // IMG_7836 — un moment spontané

      { image: ppr3, alt: "", role: "viewer", focus: "50% 50%" }, // IMG_8232 — reconnaissance officielle
      { image: ppr9, alt: "", role: "viewer", focus: "24% 45%" }, // IMG_9409 — autre moment de tournage
    ],
  },
  {
    organisation: "Trisomie 21",
    category: "Campagne de sensibilisation",
    title: "Deux campagnes pour changer les regards",
    videoUid: "4b38a8f118fecf29d48cef325cd62912",
    videoCaption: "Trisomie 21 — Campagne de la Journée mondiale",
    /* Les quatorze photos sont montrées : quatre portraits, les deux paysages
       en respiration, puis huit portraits. Les bandes se remplissent en
       rangées de quatre, sans trou au bout. */
    photos: [
      { image: t213, alt: "", role: "portrait" }, // IMG_4524
      { image: t214, alt: "", role: "portrait" }, // IMG_4743
      { image: t215, alt: "", role: "portrait" }, // IMG_4752
      { image: t216, alt: "", role: "portrait" }, // IMG_4768
      { image: t211, alt: "", role: "duo" }, // IMG_4817
      { image: t212, alt: "", role: "duo" }, // IMG_4828
      { image: t217, alt: "", role: "portrait" }, // IMG_4881
      { image: t218, alt: "", role: "portrait" }, // IMG_4898
      { image: t219, alt: "", role: "portrait" }, // IMG_4959
      { image: t2110, alt: "", role: "portrait" }, // IMG_5030
      { image: t2111, alt: "", role: "portrait" }, // IMG_5202
      { image: t2112, alt: "", role: "portrait" }, // IMG_5225
      { image: t2113, alt: "", role: "portrait" }, // IMG_5330
      { image: t2114, alt: "", role: "portrait" }, // IMG_5354
    ],
    body: "Deux campagnes pour le Regroupement pour la Trisomie 21 : *On est tous pareils à notre manière* et *Changeons notre regard*, réalisées pour la Journée mondiale de la trisomie 21.",
    story: [
      "En donnant la parole aux personnes concernées, ces projets révèlent leurs personnalités, leurs ambitions et leur quotidien. Des rencontres qui invitent à dépasser les préjugés.",
      "La première campagne explore ce qui nous rassemble. La seconde rappelle que la trisomie 21 ne résume ni une personne ni ses possibilités. Dans les deux cas, les témoignages portent le message.",
    ],
  },
  {
    organisation: "Espace Suroît",
    category: "Prévention de la cyberviolence",
    title: "Garder le dialogue ouvert, même en ligne",
    videos: [
      { uid: "ad9dd01633803ed03f2571511675e5e2", posterTime: 18 },
      { uid: "0c651a3ce21638605d30d9e7bb645b8b", posterTime: 16 },
    ],
    photos: [
      {
        image: espaceBts1,
        alt: "Préparation d’une scène dans un garage, sous une perche de prise de son, pour Espace Suroît",
        role: "duo",
      },
      {
        image: espaceBts2,
        alt: "Tournage en extérieur pour Espace Suroît, avec la caméra et la perche au premier plan",
        role: "duo",
      },
      {
        image: espaceBts3,
        alt: "Vérification du cadrage sur le moniteur de la caméra pendant le tournage pour Espace Suroît",
        role: "duo",
      },
      {
        image: espaceBts4,
        alt: "Un comédien joue une scène dans un garage pour Espace Suroît, vu depuis l’arrière de la caméra et de l’équipe",
        role: "duo",
      },
    ],
    body: "Pour la campagne *Cyber Impact* d’Espace Suroît, nous avons réalisé deux vidéos sur la cyberviolence. L’une s’adresse aux parents, l’autre aux jeunes.",
    story: [
      "La première invite les parents à garder le dialogue ouvert plutôt qu’à tout interdire. L’écoute et la confiance permettent aux jeunes de demander de l’aide sans craindre d’être jugés.",
      "La seconde aide les jeunes à reconnaître les apparences trompeuses en ligne et à se tourner vers un adulte de confiance. Deux approches complémentaires pour sensibiliser sans miser sur la peur.",
    ],
  },
  /* Appel aux dons. Une galerie montre les quatorze capsules six par
     six, en trois colonnes sur ordinateur. Les légendes restent vides tant
     qu'on ne sait pas ce que chaque capsule raconte — mieux vaut aucune ligne
     qu'une ligne inventée. */
  {
    organisation: "Club Joie de Vivre",
    category: "Appel aux dons",
    title: "Grandir pour accueillir encore plus",
    storyLayout: "grid",
    videoLayout: "gallery",
    videos: [
      { uid: "54c8d4304c8d12c33e29a834b01dce73" },
      { uid: "1893380665e33861ac2a337a6c22af0f" },
      { uid: "444c90f768872b202f51ad29771104d2" },
      { uid: "8363f63f2939a5811e59dd023602b5ab" },
      { uid: "0c6132c33492a3655aa0b0c0eba292ab" },
      { uid: "21e5f382ef35f7d9dc185d8ef25dd5d6" },
      { uid: "0ae35a290ff82973939f38acd5cbe819" },
      { uid: "88192514d11130fc2aabb385dc671cf2" },
      { uid: "689543c11412e424aaa5363306583e81" },
      { uid: "f6d2b5f1bee9973d253560fdae2d8cbf" },
      { uid: "3164ae2028a37e808b647c72e5f4101c" },
      { uid: "69374a81bdf25b9df80f00cd568fb146" },
      { uid: "4f7d4cf41158947ec8bc6984daea51e6" },
      { uid: "749a1b551b66564301b2cf538fd048da" },
    ],
    body: "Une série de capsules pour soutenir l’appel aux dons du Club Joie de Vivre, qui accompagne des adultes vivant avec une déficience intellectuelle ou un trouble du spectre de l’autisme.",
    story: [
      "À travers les activités, les rencontres et les moments de fierté, les vidéos donnent un visage à sa mission : créer un milieu où chacun peut participer et trouver sa place.",
      "Les capsules montrent un quotidien qui encourage l’autonomie, les liens et le sentiment d’appartenance. Une façon de faire comprendre ce que ce milieu apporte à ses membres et à la communauté.",
    ],
    hidePhotoPlaceholder: true,
  },
  /* Deux capsules pour un même mandat : la fiche les range côte à côte. Pas
     de photos de plateau pour ce projet, donc pas d'emplacement gris. */
  {
    organisation: "Fondation Jeunes en tête",
    category: "Sensibilisation à la santé mentale",
    title: "Mettre des mots sur ce que les jeunes vivent",
    videos: [
      {
        uid: "99892034d951e254824053818e8c6bbd",
        caption: "Mentalisation",
        /* Les deux premières secondes tombent sur le carton de titre ; à
           1 min 15, la porte-parole est cadrée de face. */
        posterTime: 75,
      },
      {
        uid: "9be8691e4feb06fe4114c41b708bd021",
        caption: "On jase avec Maude",
        posterTime: 21,
      },
    ],
    body: "Pour la Fondation Jeunes en Tête, nous avons réalisé deux capsules de sensibilisation à la santé mentale : *Mentalisation* et *On jase avec Maude*.",
    story: [
      "Une approche sobre et humaine pour aider les jeunes et leur entourage à mettre des mots sur ce qu’ils vivent, reconnaître les signes de détresse et ouvrir la discussion.",
      "La Fondation accompagne les jeunes de 11 à 18 ans partout au Québec. La réalisation laisse toute la place aux personnes et au message, pour aborder des sujets sensibles sans les dramatiser.",
    ],
    hidePhotoPlaceholder: true,
  },
];

/** Les six besoins du milieu : la liste de gauche, développée à droite. */
const NEEDS: readonly Need[] = [
  {
    title: "Sensibiliser",
    body: "Faire comprendre un enjeu social **avec justesse**. Nous créons des contenus humains qui ouvrent la discussion, font évoluer les perceptions et encouragent l'action.",
    image: listenImage,
    imageAlt: "Captation d'un témoignage dans un milieu de vie",
  },
  {
    title: "Informer",
    body: "Rendre vos services, vos ressources et vos démarches **plus faciles à comprendre** pour les personnes accompagnées et leurs proches.",
    image: monitorImage,
    imageAlt: "Deux membres de l'équipe vérifient un cadrage au moniteur",
  },
  {
    title: "Former et outiller",
    body: "Transformer votre expertise en **outils clairs et concrets** : capsules vidéo, témoignages, guides visuels ou formations adaptés aux réalités du terrain.",
    image: meetingImage,
    imageAlt: "Rencontre de travail autour d'un projet de contenu",
  },
  {
    title: "Mobiliser",
    body: "Rassembler votre communauté autour d'une cause ou d'un projet grâce à des campagnes qui **donnent envie de participer** et de s'impliquer.",
    image: crewImage,
    imageAlt: "Équipe réunie autour d'une caméra pendant un tournage",
  },
  {
    title: "Recruter",
    body: "Mettre en valeur votre mission, votre équipe et votre impact afin d'attirer des employés et des bénévoles **qui partagent vos valeurs**.",
    image: pairImage,
    imageAlt: "Deux personnes en tournage, dans un moment d'écoute",
  },
  {
    title: "Faire rayonner",
    body: "Raconter vos actions et vos retombées afin de **renforcer le lien** avec votre communauté, vos partenaires et vos bailleurs de fonds.",
    image: setupImage,
    imageAlt: "Installation d'une scène de tournage en milieu réel",
  },
];

/**
 * Ce qu'on offre : quatre portes d'entrée, volontairement peu nombreuses.
 *
 * Ce sont des services d'accompagnement, pas des types de mandats — les
 * campagnes et les capsules sont des livrables, et elles se montrent plus bas
 * dans les mandats. Le quatrième dit « accompagnement au financement » plutôt
 * que « demandes de financement » : Zéro Huit outille la demande, elle ne la
 * remplit pas à la place de l'organisme et n'en garantit pas l'issue.
 *
 * Les quatre descriptions font une trentaine de mots chacune : sur la rangée
 * de quatre colonnes, les filets du bas s'alignent au lieu de se décaler.
 */
const OFFERS = [
  {
    title: "Photos",
    body: "Des images de vos activités, de vos équipes et des personnes que vous accompagnez, créées pour raconter votre réalité, mettre votre mission en valeur et alimenter vos différents outils de communication.",
  },
  {
    title: "Vidéos",
    body: "Témoignages, capsules, campagnes et contenus pensés pour informer, toucher et mobiliser votre public, tout en mettant en lumière votre mission, vos projets et les personnes qui leur donnent vie.",
  },
  {
    title: "Stratégie de communication",
    body: "On vous aide à clarifier votre message, structurer votre campagne et choisir les bons moyens pour rejoindre votre public, mobiliser votre communauté et atteindre plus efficacement vos objectifs de communication.",
  },
  {
    title: "Accompagnement au financement",
    body: "Un soutien pour présenter votre projet, préparer vos outils de communication et renforcer vos demandes de financement ou de subvention afin de mieux démontrer vos besoins, votre impact et votre vision.",
  },
];

const FUNDING_STEPS = [
  {
    title: "Clarifier le besoin",
    body: "Définir l'enjeu, les personnes à rejoindre et le changement souhaité.",
  },
  {
    title: "Structurer le projet",
    body: "Préciser les livrables, les étapes de production et les moyens de diffusion.",
  },
  {
    title: "Bâtir un budget réaliste",
    body: "Préparer une estimation détaillée et adaptée aux critères du programme visé.",
  },
  {
    title: "Appuyer la rédaction",
    body: "Fournir les informations nécessaires pour présenter clairement l'approche, la portée et les retombées attendues.",
  },
  {
    title: "Fournir les documents",
    body: "Remettre une soumission détaillée, un échéancier de production et une description claire des livrables.",
  },
];

const APPROACH_STEPS = [
  {
    title: "Écouter",
    body: "Comprendre votre mission, vos contraintes, vos publics et les réalités du terrain.",
  },
  {
    title: "Clarifier",
    body: "Trouver le message central et choisir la forme de contenu la plus pertinente.",
  },
  {
    title: "Créer",
    body: "Produire avec sensibilité, efficacité et respect des personnes représentées.",
  },
  {
    title: "Déployer",
    body: "Livrer des contenus simples à utiliser dans vos campagnes, vos formations et vos communications.",
  },
];

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get("x-locale"));

  return buildPageMetadata({
    locale,
    path: "/organismes",
    title: "Communication pour organismes communautaires | Zéro Huit",
    description:
      "Zéro Huit accompagne les organismes communautaires dans la création de vidéos, de campagnes de sensibilisation et de projets soutenus par du financement ou des subventions.",
  });
}

export default function OrganismesPage() {
  return (
    <main className="font-['Montserrat'] bg-[#F6F4EF] text-[#111111]">
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-[#0c0c0c]">
        {/* Cadrage : la photo est en 3:2, plus haute que le hero sur grand
            écran, donc le rognage se fait en hauteur. On remonte le point
            d'ancrage à 42 % pour garder les visages et sacrifier le
            premier plan encombré du bas. Sous `lg` le rognage devient
            horizontal : on se recale sur le duo qui discute à droite, la
            scène qui porte le propos. */}
        <Image
          src={heroImage}
          alt="Tournage dans une salle communautaire : une intervenante discute avec une participante pendant qu'une caméra capte la scène, entourées de membres du groupe"
          fill
          priority
          sizes="100vw"
          className="zh-hero-zoom zh-parallax object-cover object-[64%_45%] lg:object-[50%_42%]"
        />

        {/* Trois dégradés au lieu d'un voile uniforme : le texte repose sur du
            noir, le duo de droite garde ses couleurs et sa lumière. */}
        {/* 1 — de la gauche vers le centre, derrière le texte. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,12,12,0.82)_0%,rgba(12,12,12,0.6)_26%,rgba(12,12,12,0.28)_50%,rgba(12,12,12,0.05)_72%,rgba(12,12,12,0)_88%)]"
        />
        {/* 2 — du bas vers le centre, sous le bloc de contenu. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,12,12,0.88)_0%,rgba(12,12,12,0.55)_22%,rgba(12,12,12,0.2)_42%,rgba(12,12,12,0)_62%)]"
        />
        {/* 3 — un souffle de noir en haut, seulement pour que le logo et le
            bouton de l'en-tête restent lisibles sur le plafond clair. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.5)_0%,rgba(12,12,12,0.12)_14%,rgba(12,12,12,0)_26%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />

        {/* Le bloc suit la gouttière du site et s'arrête à 700 px : il tient
            dans le tiers inférieur sans coller au bas, et cesse de flotter au
            milieu de la photo. */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-[13svh] pt-40 sm:px-6 lg:px-10">
          {/* Le paragraphe garde sa mesure courte (570 px) ; le titre, lui,
              prend la gouttière. Mesuré dans Montserrat 800 avec le tracking
              en place, sa plus longue ligne fait 15,70 em : dans 700 px elle
              ne tiendrait qu'en dessous de 44 px de corps. */}
          <div>
            <p
              className="zh-hero-in text-[0.78rem] font-bold uppercase leading-[1.4] tracking-[0.2em] text-[#9ede72] sm:text-[0.875rem]"
            >
              Communication pour organismes communautaires
            </p>

            {/* Deux lignes tenues par la structure, jamais par la largeur :
                chaque phrase est son propre bloc. */}
            {/* La coupure tombe avant les trois verbes, qui portent le
                propos et restent groupés. Mesurée dans Montserrat 800 avec ce
                tracking, cette ligne fait 16,31 em : 68 px la posent à
                1109 px des 1200 px de la gouttière. Couper après
                « informer, » déborderait. À partir de `xl` le retour à la
                ligne est interdit, la mesure garantissant qu'il ne sert
                jamais. */}
            <h1
              className="zh-hero-in mt-6 max-w-[1200px] font-extrabold leading-[0.98] tracking-[-0.045em] text-white xl:whitespace-nowrap"
              style={{
                fontSize: "clamp(2rem, 4.7vw, 4.25rem)",
                animationDelay: "100ms",
              }}
            >
              <span className="block">Des vidéos conçues pour</span>
              <span className="block">informer, sensibiliser et mobiliser</span>
            </h1>

            {/* Les deux boutons s'empilent tant qu'ils ne tiennent pas côte à
                côte, et prennent alors toute la largeur disponible. */}
            <div
              className="zh-hero-in mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5"
              style={{ animationDelay: "340ms" }}
            >
              <a
                href="#mandats"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[#8acd5f] px-8 py-4 text-[0.95rem] font-bold text-[#111111] transition duration-300 hover:-translate-y-0.5 hover:bg-[#9ede72] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Voir nos réalisations
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </a>
              <Link
                href={CONTACT_HREF}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border border-white/55 px-8 py-4 text-[0.95rem] font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Parler de votre projet
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Invitation à descendre : un trait qui respire. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 z-10 flex justify-center"
        >
          <span className="zh-scroll-cue block h-10 w-px bg-white/40" />
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Témoignages                                                   */}
      {/* ------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden bg-[#F6F4EF] pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Le motif porte son propre fond gris : en fusion « multiply » il se
            teinte du blanc chaud de la page au lieu de l'écraser. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-70 mix-blend-multiply"
          style={{ backgroundImage: `url(${blobPattern.src})` }}
        />

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="zh-reveal">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#1f8ba3]">
              Témoignages
            </p>
            <h2
              className="mt-7 font-extrabold leading-[1.04] tracking-[-0.045em] text-[#111111] lg:whitespace-nowrap"
              style={{ fontSize: "clamp(2rem, 4.4vw, 3.75rem)" }}
            >
              Ce qu&apos;en disent les organismes
            </h2>
          </div>

          <div className="zh-reveal mt-14 sm:mt-16">
            <TestimonialVideos testimonials={TESTIMONIALS} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Partir de votre réalité                                       */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-[#111111] py-24 text-white sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          {/* Titre pleine largeur : 81 caractères tiennent sur deux lignes
              jusqu'à 60 px de corps, pas au-delà. */}
          <div className="zh-reveal">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#5cc3d7]">
              Partir de votre réalité
            </p>
            <h2
              className="mt-7 font-extrabold leading-[1.05] tracking-[-0.045em] text-white"
              style={{ fontSize: "clamp(2rem, 4.6vw, 3.75rem)" }}
            >
              Vous êtes déjà sur le terrain. Nous vous aidons à faire entendre
              ce qui s&apos;y passe.
            </h2>
            <p className="mt-9 max-w-3xl text-base leading-[1.85] text-zinc-400 sm:text-lg">
              Derrière chaque organisme, il y a une mission, des personnes
              engagées et des réalités qui méritent d&apos;être mieux comprises.
              Notre rôle est d&apos;écouter, de simplifier et de donner une
              forme forte à votre message, sans dénaturer ce qui vous rend
              essentiel dans votre milieu.
            </p>
          </div>

          <NeedsExplorer needs={NEEDS} />

          <p className="zh-reveal mt-16 border-t border-white/12 pt-8 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Vidéo · Photographie · Témoignages · Campagnes de sensibilisation ·
            Formation · Réseaux sociaux
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Ce qu'on offre                                                */}
      {/* ------------------------------------------------------------ */}
      {/* Placée entre le besoin et la preuve : on vient de nommer ce que vit
          l'organisme, on dit ce qu'on sait faire, puis on le démontre avec les
          mandats. Blanc chaud plus clair que la section suivante, dont le
          filet supérieur marque la césure. */}
      <section className="bg-[#F6F4EF] py-24 sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="zh-reveal max-w-3xl">
            <h2
              className="font-extrabold leading-[1.04] tracking-[-0.045em] text-[#111111]"
              style={{ fontSize: "clamp(2rem, 4.4vw, 3.75rem)" }}
            >
              Ce qu&apos;on offre
            </h2>
            <p className="mt-7 text-base leading-[1.85] text-[#696762] sm:text-lg">
              Des services pensés pour vous aider à mieux communiquer votre
              mission, mobiliser votre communauté et faire avancer vos projets.
            </p>
          </div>

          {/* Même écriture que les étapes du financement : un filet, pas de
              carte. Le survol vit sur le conteneur intérieur, `zh-reveal`
              occupant déjà `transform` sur l'élément de liste. */}
          <ul className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERS.map((offer, index) => (
              <li
                key={offer.title}
                className="zh-reveal"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="group h-full border-t border-black/15 pt-6 transition-transform duration-300 hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className="font-mono text-xs font-bold tabular-nums tracking-[0.2em] text-[#5b9c34] transition-colors duration-300 group-hover:text-[#4a8a28] motion-reduce:transition-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold leading-[1.25] tracking-[-0.02em] text-[#111111]">
                    {offer.title}
                  </h3>
                  <p className="mt-3 text-base leading-[1.75] text-[#696762]">
                    {offer.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Mandats                                                       */}
      {/* ------------------------------------------------------------ */}
      <section
        id="mandats"
        className="scroll-mt-24 border-t border-black/10 bg-[#EFECE3] py-24 sm:py-32"
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="zh-reveal">
            {/* Une seule ligne, garantie : à partir de `lg` le retour à la
                ligne est interdit. La mesure suit — 31 caractères à 60 px font
                930 px pour 1200 disponibles. */}
            <h2
              className="font-extrabold leading-[1.04] tracking-[-0.045em] text-[#111111] lg:whitespace-nowrap"
              style={{ fontSize: "clamp(2rem, 4.4vw, 3.75rem)" }}
            >
              Des mandats ancrés dans le réel
            </h2>
          </div>

          <MandatesExplorer mandates={MANDATES} />
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Financement et subventions                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-[#111111] py-24 text-white sm:py-32">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          {/* Rangée haute : le propos à gauche (45 %), l'image à droite
              (55 %). Les deux colonnes s'étirent à la même hauteur, donc
              l'image se cale sur le bloc de texte au lieu de le dépasser et
              les étapes descendent ensuite sur toute la largeur. */}
          <div className="grid items-stretch gap-12 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-16">
            <div>
              <h2
                className="zh-reveal font-extrabold leading-[1.06] tracking-[-0.04em] text-white"
                style={{ fontSize: "clamp(1.85rem, 3.6vw, 3.1rem)" }}
              >
                Un dossier solide, avant même le premier tournage.
              </h2>
              {/* Mesure resserrée : autour de 62 caractères par ligne. */}
              <p className="zh-reveal mt-8 max-w-lg text-base leading-[1.85] text-zinc-300 sm:text-lg">
                Une bonne idée mérite d&apos;être bien présentée. On vous aide
                à structurer votre projet, clarifier vos besoins et mettre vos
                objectifs en mots pour que votre demande soit plus claire, plus
                crédible et plus facile à défendre auprès de vos partenaires et
                bailleurs de fonds.
              </p>

              <div className="zh-reveal mt-10 max-w-lg border-l-2 border-[#8acd5f] pl-6">
                <p className="text-base leading-[1.8] text-zinc-200">
                  Vous pouvez arriver avec une idée, un appel de projets ou une
                  échéance qui approche. On vous aide à faire le pont entre
                  votre mission, les critères du programme et un projet
                  réalisable.
                </p>
              </div>

              <Link
                href={CONTACT_HREF}
                className="zh-reveal group mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#8acd5f] px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:bg-[#9ad86f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Discuter de mon projet
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </Link>
            </div>

            {/* Cadre cinématographique tant que la grille est empilée ; à
                partir de `lg` l'aspect cède la place à l'étirement, et la
                photo prend exactement la hauteur du texte voisin. */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-black/40 lg:aspect-auto lg:min-h-[28rem]">
              <Image
                src={fundingImage}
                alt="Préparation d'un tournage sur les lieux d'un mandat"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="zh-image-in object-cover object-center"
              />
            </div>
          </div>

          {/* Les cinq étapes en pleine largeur : une lecture horizontale qui
              se saisit d'un coup, au lieu d'une colonne qui s'allonge.
              Le filet supérieur se répète sur chaque étape, donc chaque
              rangée garde son repère quand la grille se replie. */}
          <ol className="mt-20 grid gap-x-6 gap-y-10 sm:mt-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {FUNDING_STEPS.map((step, index) => (
              /* `zh-reveal` occupe déjà `transform` sur l'élément de liste :
                 le survol vit donc sur le conteneur intérieur, sinon
                 l'animation d'entrée l'écraserait. */
              <li
                key={step.title}
                className="zh-reveal"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="group h-full border-t border-white/15 pt-6 transition-transform duration-300 hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className="font-mono text-xs font-bold tabular-nums tracking-[0.2em] text-[#8acd5f] transition-colors duration-300 group-hover:text-[#a8e07d] motion-reduce:transition-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold leading-[1.25] tracking-[-0.02em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.7] text-zinc-400">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="zh-reveal mt-16 max-w-3xl text-sm leading-[1.7] text-zinc-400">
            Zéro Huit ne peut pas garantir l&apos;obtention d&apos;une
            subvention. Notre rôle est de vous aider à présenter un projet
            clair, crédible et cohérent avec les critères du programme ciblé.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Notre approche                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-[#EFECE3] py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 sm:gap-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-10">
          <div className="zh-reveal max-w-lg lg:self-start">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#1f8ba3]">
              Notre approche
            </p>
            <h2
              className="mt-7 font-extrabold leading-[1.06] tracking-[-0.04em] text-[#111111]"
              style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)" }}
            >
              On commence
              <br />
              par écouter.
            </h2>
            <p className="mt-7 text-base leading-[1.85] text-[#696762] sm:text-lg">
              Vous connaissez votre communauté mieux que quiconque. Nous
              apportons notre regard stratégique et créatif, mais votre réalité
              demeure toujours le point de départ.
            </p>
          </div>

          <ol className="space-y-10 sm:space-y-12">
            {APPROACH_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="zh-reveal relative grid grid-cols-[3.5rem_1fr] items-start gap-5 before:absolute before:top-14 before:-bottom-10 before:left-7 before:w-px before:bg-[#5b9c34]/25 last:before:hidden sm:grid-cols-[4.5rem_1fr] sm:gap-8 sm:before:top-18 sm:before:-bottom-12 sm:before:left-9"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8acd5f] font-mono text-xl font-bold tabular-nums text-[#111111] sm:h-18 sm:w-18 sm:text-2xl"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="pt-2 sm:pt-3">
                  <h3 className="text-2xl font-extrabold tracking-[-0.025em] text-[#111111] sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-md text-base leading-[1.75] text-[#696762]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Dernière parole                                               */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-[#5cc3d7] to-[#8acd5f] py-28 text-[#111111] sm:py-36">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          <h2
            className="zh-reveal max-w-4xl font-extrabold leading-[1.04] tracking-[-0.045em]"
            style={{ fontSize: "clamp(2rem, 4.6vw, 4rem)" }}
          >
            Parlez-nous de la réalité que vous voulez changer.
          </h2>
          <p className="zh-reveal mt-9 max-w-2xl text-base leading-[1.8] text-[#111111]/80 sm:text-lg">
            Prenons le temps de comprendre votre mission, votre projet et les
            personnes que vous souhaitez rejoindre. La première discussion est
            simple, humaine et sans pression.
          </p>

          <div className="zh-reveal mt-12 flex flex-wrap items-center gap-8">
            <Link
              href={CONTACT_HREF}
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[#111111] px-8 py-4 text-sm font-bold text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
            >
              Planifier une première discussion
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>

            <a
              href="mailto:info@zerohuit.ca"
              className="text-base font-bold text-[#111111] underline decoration-[#111111]/40 decoration-2 underline-offset-[6px] transition-colors duration-300 hover:decoration-[#111111] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111] motion-reduce:transition-none"
            >
              info@zerohuit.ca
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
