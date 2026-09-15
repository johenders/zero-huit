import type { SectorContentByLocale } from "./types";

// TODO(images) : remplacer par des photos de tournage en milieu de santé.
import heroImage from "../../../assets/landingpage/Communications · Santé · Services sociaux/Still 2026-03-04 121037_4.5.1.jpg";
import classroomImage from "../../../assets/bts/IMG_7132.jpg";
import roomImage from "../../../assets/bts/IMG_5163.jpg";
import crewImage from "../../../assets/bts/DSCF8758.jpg";
import ctaImage from "../../../assets/bts/IMG_6349.jpg";
import observeImage from "../../../assets/bts/IMG_6310.jpg";
import decideImage from "../../../assets/bts/IMG_7175.jpg";
import setImage from "../../../assets/bts/IMG_8446.jpg";
import meetingImage from "../../../assets/bts/IMG_2410.jpg";
import gatheringImage from "../../../assets/bts/DSCF9247.jpg";
import teamImage from "../../../assets/bts/IMG_8361-2.jpg";
import portraitImage from "../../../assets/bts/IMG_1219.jpg";
import lightSetImage from "../../../assets/bts/IMG_3434.jpg";

import cisssmoLogo from "../../../assets/clients/cisssmo.png";
import cnesstLogo from "../../../assets/clients/cnesst.png";
import ccqLogo from "../../../assets/clients/ccq.png";
import cegepLogo from "../../../assets/clients/cegep.png";

/**
 * Secteur : milieu de la santé.
 *
 * Le contenu français est celui fourni par l'équipe — il n'est pas réécrit.
 * L'anglais en est la traduction fidèle (Loi 96 : parité de contenu, de
 * présentation et de fonctionnalités entre les deux versions).
 *
 * Les blocs marqués « dossier » n'apparaissent pas sur la landing publique :
 * ils alimentent la page de référence imprimable, exigée par le guide d'achat
 * (fourchettes, objections, étude de cas chiffrée, crédibilité vérifiable).
 * Tout ce qui engage l'entreprise y reste en brouillon `a-valider` ou en
 * sentinelle {{…}} tant qu'un humain ne l'a pas confirmé.
 */
export const santeContent: SectorContentByLocale = {
  fr: {
    meta: {
      title:
        "Production vidéo et contenu pour le milieu de la santé | Zéro huit",
      description:
        "Création de contenu et production vidéo pour les organisations du milieu de la santé : vidéo corporative, sensibilisation, recrutement, témoignages, photographie et contenu numérique.",
      path: "/production-video-sante",
      serviceName: "Création de contenu pour le milieu de la santé",
      breadcrumbLabel: "Milieu de la santé",
    },

    cta: {
      label: "Discuter de votre projet",
      href: "/demande",
      whatHappensNext:
        "Expliquez-nous simplement ce que vous souhaitez communiquer. Nous nous occuperons de trouver la meilleure façon de le transformer en contenu.",
    },

    lowPressureCta: {
      label: "Découvrir notre approche",
      href: "/production-video-sante/dossier",
      description:
        "Le détail de notre façon de travailler, nos fourchettes et nos réponses aux questions d'approvisionnement. Aucun appel.",
    },

    hero: {
      eyebrow: "Communications · Santé · Services sociaux",
      titleLine1: "Communiquer autrement.",
      subtitle:
        "Production vidéo, photographie et contenu numérique pour les organisations du réseau de la santé et des services sociaux.",
      valuePropLead: "Informer. Sensibiliser. Recruter. Mobiliser.",
      image: heroImage,
      imageAlt:
        "Trois professionnels de la santé consultent un dossier dans le corridor d'une unité de soins",
      imageIsTemporary: false,
    },

    heroCard: {
      title: "Vos enjeux de communication sont complexes.",
      titleLine2: "On vous aide à les rendre clairs.",
      items: [
        {
          icon: "people",
          value: "Recrutement",
          label:
            "Recruter est un défi constant, et les affichages de postes ne disent rien de ce que vos équipes vivent au quotidien.",
        },
        {
          icon: "chat",
          value: "Informations",
          label:
            "Transformer l'information complexe en messages simples, accessibles et utiles au quotidien.",
        },
        {
          icon: "clipboard",
          value: "Formations",
          label:
            "Créez des formations internes claires, simples et faciles à suivre pour vos équipes.",
        },
      ],
      footnote:
        "Vidéo, photographie et contenus numériques, choisis selon l'enjeu.",
      closingCta: {
        question: "Vous avez un autre enjeu de communication?",
        label: "Parlez-nous-en",
      },
    },

    proof: {
      label: "Ils nous ont confié des mandats dans le réseau",
      logos: [
        {
          src: cisssmoLogo,
          alt: "CISSS de la Montérégie-Ouest",
          authorization: "documentee",
        },
        { src: cnesstLogo, alt: "CNESST", authorization: "documentee" },
        {
          src: ccqLogo,
          alt: "Centre de services sociaux des Patriotes",
          authorization: "a-obtenir",
        },
        { src: cegepLogo, alt: "Cégep de Valleyfield", authorization: "documentee" },
      ],
    },

    /* --- Landing publique ------------------------------------------- */

    narrative: {
      eyebrow: "Notre approche",
      titleLine1: "Avant de créer,",
      titleLine2: "on cherche à comprendre.",
      titleAccent: "comprendre",
      lead:
        "Un bon contenu ne commence pas par une caméra. Il commence par savoir ce qu'on veut vraiment raconter et pourquoi on le raconte.",
      principles: [
        {
          label: "Comprendre",
          title: "Votre réalité",
          caption: "Écouter avant de créer.",
          body:
            "Nous analysons vos enjeux de communication en santé et services sociaux, vos publics et vos contraintes pour définir un message adapté à votre réalité.",
          image: observeImage,
          imageAlt:
            "Un membre de l'équipe observe attentivement une scène en cours de tournage",
        },
        {
          label: "Clarifier",
          title: "Le message",
          caption: "Trouver ce qui mérite vraiment d'être dit.",
          body:
            "Nous vulgarisons l'information complexe pour créer des communications claires, accessibles et humaines, adaptées à vos usagers, vos équipes et vos partenaires.",
          image: decideImage,
          imageAlt:
            "Deux membres de l'équipe discutent devant le moniteur pendant un tournage",
        },
        {
          label: "Créer",
          title: "Le bon format",
          caption: "Choisir le meilleur moyen de le raconter.",
          body:
            "Production vidéo, photographie ou contenu numérique : nous choisissons le bon format pour informer, sensibiliser, recruter ou mobiliser vos publics.",
          image: setImage,
          imageAlt: "Équipe de tournage en action autour d'une scène préparée",
        },
      ],
    },

    portfolio: {
      eyebrow: "Nos réalisations",
      title: "Voici ce qu'on crée.",
      moreCta: { label: "Voir tout notre portfolio", href: "/portfolio" },
      items: [
        { uid: "6b54c8bbaf2e073c5d338c8cf55c64c5" },
        { uid: "f2153bfbcaec089659ea0aa3f8fecf8f" },
        { uid: "459bcc1b1ec40c5a0a208134637e1487" },
        { uid: "dbf32f0597ec3a18a99b4303a1d1a4cd" },
        { uid: "e2433ff6d6852933862d3459c269ae29" },
      ],
    },

    services: {
      eyebrow: "Nos services",
      title:
        "Des communications plus claires pour des enjeux qui ne le sont pas toujours.",
      lead:
        "Production vidéo, photographie, sensibilisation, recrutement et contenu numérique pour les organisations de la santé et des services sociaux.",
      items: [
        {
          icon: "video",
          category: "Production vidéo",
          navLabel: "Vidéo",
          title: "Donner vie à votre mission",
          body:
            "Présentez votre organisation, vos équipes et vos services avec une production vidéo corporative et institutionnelle adaptée aux réalités du réseau de la santé et des services sociaux.",
          examplesLabel: "Applications",
          examples: [
            "Vidéo institutionnelle",
            "Présentation de services",
            "Portraits d'équipes",
            "Témoignages",
            "Vidéos destinées aux partenaires",
          ],
          image: classroomImage,
          imageAlt:
            "Captation d'une entrevue avec un professionnel dans son milieu de travail",
        },
        {
          icon: "camera",
          category: "Photographie",
          navLabel: "Photo",
          title: "Montrer votre réalité avec authenticité",
          body:
            "Photographie professionnelle, portraits et banque d'images : une bibliothèque cohérente qui représente vraiment vos équipes, vos services, vos installations et les personnes qui font vivre votre organisation.",
          examplesLabel: "Applications",
          examples: [
            "Banque d'images",
            "Portraits",
            "Environnement de travail",
            "Campagnes publicitaires",
            "Rapports annuels",
            "Sites Web",
            "Relations médias",
          ],
          image: portraitImage,
          imageAlt: "Portrait cadré à l'écran pendant une séance",
        },
        {
          icon: "chat",
          category: "Communication aux usagers",
          navLabel: "Usagers",
          title: "Rendre vos services plus simples à comprendre",
          body:
            "Une communication aux usagers qui repose sur la vulgarisation : services, droits, consignes et parcours de soins deviennent une information simple et accessible, pour les usagers comme pour leurs proches.",
          examplesLabel: "Applications",
          examples: [
            "Accès aux services",
            "Droits des usagers",
            "Consignes et procédures",
            "Parcours de soins",
            "Capsules explicatives",
            "Vulgarisation",
          ],
          image: roomImage,
          imageAlt: "Tournage d'une capsule dans une salle d'intervention",
        },
        {
          icon: "megaphone",
          category: "Sensibilisation",
          navLabel: "Sensibilisation",
          title: "Faire comprendre les enjeux qui comptent",
          body:
            "Campagnes de sensibilisation, prévention, santé publique : des contenus humains et accessibles pour faire comprendre des enjeux complexes, et faire agir.",
          examplesLabel: "Applications",
          examples: [
            "Prévention",
            "Santé publique",
            "Sensibilisation",
            "Saines habitudes de vie",
            "Campagnes populationnelles",
            "Initiatives communautaires",
          ],
          image: gatheringImage,
          imageAlt: "Tournage d'une scène réunissant plusieurs personnes dans un lieu public",
        },
        {
          icon: "people",
          category: "Recrutement",
          navLabel: "Recrutement",
          title: "Donner envie de rejoindre votre milieu",
          body:
            "Vidéo de recrutement et marque employeur : montrez la réalité de votre milieu, vos équipes et votre culture pour attirer des candidats qui s'y reconnaissent vraiment.",
          examplesLabel: "Applications",
          examples: [
            "Campagnes de recrutement",
            "Vidéos métiers",
            "Témoignages d'employés",
            "Portraits d'équipes",
            "Marque employeur",
            "Environnement de travail",
          ],
          image: teamImage,
          imageAlt: "Équipe réunie autour d'une caméra pendant un tournage",
        },
        {
          icon: "clipboard",
          category: "Formation et communication interne",
          navLabel: "Formation",
          title: "Former et informer clairement",
          body:
            "Facilitez l'intégration, la formation et la communication interne grâce à des contenus vidéo et numériques conçus pour vos employés, vos professionnels et vos partenaires.",
          examplesLabel: "Applications",
          examples: [
            "Accueil et intégration",
            "Procédures cliniques",
            "Santé et sécurité",
            "Politiques internes",
            "Formation continue",
            "Communications de direction",
          ],
          image: meetingImage,
          imageAlt: "Rencontre de travail entre trois personnes autour d'un projet",
        },
        {
          icon: "heart",
          category: "Histoires humaines",
          navLabel: "Témoignages",
          title: "Donner une voix aux histoires humaines",
          body:
            "Des témoignages d'usagers, de proches et de professionnels, réalisés avec sensibilité et respect, pour donner une voix aux personnes derrière votre mission.",
          examplesLabel: "Applications",
          examples: [
            "Usagers",
            "Proches",
            "Professionnels",
            "Employés",
            "Bénévoles",
            "Partenaires",
          ],
          image: crewImage,
          imageAlt: "Deux personnes en tournage, dans un moment d'écoute",
        },
        {
          icon: "share",
          category: "Réseaux sociaux",
          navLabel: "Réseaux sociaux",
          title: "Faire vivre vos contenus plus longtemps",
          body:
            "Contenu pour les réseaux sociaux, vidéo verticale, Reels et contenu numérique : chaque tournage se décline en capsules courtes qui informent votre communauté longtemps après le jour 1.",
          examplesLabel: "Applications",
          examples: [
            "Capsules courtes",
            "Reels",
            "Vidéos verticales",
            "Extraits d'entrevues",
            "Portraits",
            "Contenu éducatif",
            "Photos",
            "Déclinaisons de campagne",
          ],
          image: lightSetImage,
          imageAlt: "Deux membres de l'équipe installent une scène de tournage",
        }
      ],
    },
    highlights: {
      eyebrow: "Mandats fréquents",
      title: "Trois situations qu'on connaît par cœur.",
      lead:
        "Ce sont les demandes qui reviennent le plus souvent dans le réseau. On sait comment les mener.",
      items: [
        {
          icon: "refresh",
          title: "Remise à neuf de votre vidéothèque",
          body:
            "Après une réorganisation, vos capsules portent encore l'ancienne signature de votre établissement : anciens noms, anciens logos, anciennes coordonnées. Elles deviennent indiffusables sans qu'une seule image soit mauvaise.",
          points: [
            "Inventaire complet de votre catalogue",
            "Ce qui se corrige au montage : habillage, titres, coordonnées, voix hors champ",
            "Ce qui demande un retournage partiel",
            "Ce qui doit être refait",
            "La majorité des capsules se récupèrent sans nouveau tournage",
          ],
        },
        {
          icon: "scale",
          title: "Projets d'envergure",
          body:
            "Une campagne déployée sur plusieurs mois, plusieurs installations et plusieurs publics. Nous coordonnons l'ensemble et vous n'avez qu'un seul interlocuteur.",
          points: [
            "Plusieurs installations et plusieurs équipes",
            "Calendrier de production étalé sur plusieurs mois",
            "Comédiens, motion design, versions accessibles",
            "Un seul interlocuteur pour tout le mandat",
            "Livraisons échelonnées selon vos échéances",
          ],
        },
        {
          icon: "budget",
          title: "Un budget à défendre à l'interne",
          body:
            "Vous devez chiffrer un mandat avant même qu'il soit défini, puis l'engager avant la fin de l'année financière. On vous donne de quoi le défendre.",
          points: [
            "Une fourchette dès la première conversation",
            "Le détail de ce qui fait varier le montant",
            "Un chiffrage utilisable tel quel dans une demande interne",
            "La possibilité de planifier pour le prochain cycle budgétaire",
            "Aucun engagement tant que le cadrage n'est pas clair",
          ],
        },
      ],
    },

    audiences: {
      eyebrow: "Pour qui",
      title: "Pour quels types d'organisations ?",
      lead:
        "Nous pouvons accompagner différents acteurs du milieu de la santé et des services à la population.",
      items: [
        "Établissements et institutions de santé",
        "Fondations",
        "Cliniques et groupes médicaux",
        "Associations et ordres professionnels",
        "Organismes communautaires",
        "Organisations en santé mentale et services sociaux",
        "Centres de recherche",
        "Organisations liées à la prévention et à la santé publique",
        "Entreprises développant des solutions pour le secteur de la santé",
      ],
    },

    approach: {
      eyebrow: "Notre approche",
      title: "Une approche adaptée à votre réalité",
      lead:
        "Les communications dans le secteur de la santé demandent une approche particulière.",
      constraints: [
        "Il faut parfois vulgariser des sujets complexes.",
        "Créer du contenu dans des environnements sensibles.",
        "Travailler avec des personnes qui ne sont pas habituées à être devant une caméra.",
        "Respecter des contraintes opérationnelles importantes.",
      ],
      bridge: "Et surtout, ne jamais perdre de vue l'humain derrière le message.",
      principles: [
        {
          icon: "heart",
          title: "Humanité",
          body:
            "Nous créons des environnements de tournage simples, respectueux et rassurants pour permettre aux personnes devant la caméra de demeurer naturelles.",
        },
        {
          icon: "idea",
          title: "Clarté",
          body:
            "Nous vous aidons à transformer des sujets parfois complexes en messages faciles à comprendre.",
        },
        {
          icon: "clock",
          title: "Efficacité",
          body:
            "Nous préparons chaque production afin de limiter l'impact sur vos équipes et vos opérations.",
        },
        {
          icon: "badge",
          title: "Qualité",
          body:
            "Chaque contenu est pensé pour représenter votre organisation avec professionnalisme, autant dans l'image que dans le message.",
        },
      ],
    },

    process: {
      eyebrow: "Comment ça se passe",
      title: "Vous avez déjà beaucoup à gérer.",
      titleLine2: "On s'occupe du reste.",
      steps: [
        {
          icon: "chat",
          title: "Comprendre",
          accentWord: "Écouter",
          body:
            "On commence par vos objectifs, vos publics et ce que la communication doit réellement accomplir.",
        },
        {
          icon: "pen",
          title: "Concevoir",
          accentWord: "Imaginer",
          body:
            "On trouve l'angle, le concept et la structure qui serviront le mieux votre message.",
        },
        {
          icon: "calendar",
          title: "Planifier",
          accentWord: "Organiser",
          body:
            "On coordonne les horaires, les lieux, les intervenants et tous les détails de production.",
        },
        {
          icon: "camera",
          title: "Produire",
          accentWord: "Capter",
          body:
            "Notre équipe prend en charge la captation vidéo, photo et audio sur le terrain.",
        },
        {
          icon: "edit",
          title: "Monter",
          accentWord: "Assembler",
          body:
            "On transforme le matériel capté en contenus clairs, professionnels et adaptés à vos publics.",
        },
        {
          icon: "layers",
          title: "Décliner",
          accentWord: "Diffuser",
          body:
            "On adapte le contenu aux formats et plateformes dont vous avez réellement besoin.",
        },
      ],
    },

    multiplier: {
      eyebrow: "Rendement",
      title: "Un tournage. Plusieurs contenus.",
      lead:
        "Votre projet ne devrait pas se limiter à une seule vidéo. Une production bien planifiée peut générer :",
      outputs: [
        "1 vidéo principale",
        "3 à 10 capsules courtes",
        "Des dizaines de photographies",
        "Des extraits pour les réseaux sociaux",
        "Des témoignages individuels",
        "Des formats verticaux et horizontaux",
        "Du contenu pour votre site Web",
        "Du matériel pour vos campagnes de recrutement ou de sensibilisation",
      ],
      goal: "Maximiser la valeur de chaque journée de production.",
    },

    midCta: {
      title: "Vous avez le message. Nous trouvons la meilleure façon de le raconter.",
      questions: [
        "Vous préparez une campagne ?",
        "Vous souhaitez moderniser vos contenus ?",
        "Vous devez présenter un nouveau service ?",
        "Vous cherchez à mettre en valeur vos employés ?",
        "Vous souhaitez sensibiliser la population à un enjeu ?",
        "Ou vous avez simplement une idée que vous aimeriez transformer en projet ?",
      ],
      body:
        "Parlons-en. Notre équipe pourra vous proposer une approche adaptée à vos objectifs, votre échéancier et votre budget.",
      composer: {
        prompt: "Cochez ce qui vous concerne",
        empty:
          "Sélectionnez un ou plusieurs besoins : nous afficherons les livrables correspondants, et votre sélection nous parviendra avec votre demande.",
        summaryTitle: "Votre projet",
        deliverables: "Livrables possibles",
        reset: "Tout effacer",
      },
    },

    demo: {
      eyebrow: "Le travail lui-même",
      title: "Ce que ça donne, tourné dans un établissement.",
      lead: "Pas une bande démo de 12 industries. Des capsules tournées dans le réseau.",
      videos: [
        {
          kind: "demo",
          uid: "{{PLACEHOLDER_UID_BANDE_DEMO_SANTE}}",
          title: "Bande démo — milieu de la santé",
          durationSeconds: 60,
          posterAlt: "Extraits de capsules tournées dans des établissements de santé",
          productionNotes: [
            "Tournée en unité active, sans interruption des soins",
            "Équipe réduite, un seul point de branchement électrique",
            "Consentements obtenus avant le premier plan",
          ],
          transcript: "{{PLACEHOLDER_TRANSCRIPTION_BANDE_DEMO}}",
          captionsSrc: "{{PLACEHOLDER_VTT_BANDE_DEMO}}",
        },
        {
          kind: "case",
          uid: "{{PLACEHOLDER_UID_ETUDE_DE_CAS}}",
          title: "Étude de cas filmée",
          durationSeconds: 120,
          posterAlt: "Responsable des communications d'un établissement en entrevue",
          productionNotes: [
            "Le client raconte le mandat et nomme le résultat",
            "Tournage en une demi-journée, sur les lieux",
          ],
          transcript: "{{PLACEHOLDER_TRANSCRIPTION_ETUDE_DE_CAS}}",
          captionsSrc: "{{PLACEHOLDER_VTT_ETUDE_DE_CAS}}",
        },
      ],
    },

    faq: {
      eyebrow: "Questions fréquentes",
      title: "Questions fréquentes",
      items: [
        {
          question: "Pouvez-vous nous accompagner dès le début du projet ?",
          answer:
            "Oui. Nous pouvons intervenir dès la réflexion initiale afin de vous aider à définir le concept, les messages, les formats et la stratégie de contenu.",
          status: "valide",
        },
        {
          question: "Pouvez-vous travailler avec notre équipe de communication ?",
          answer:
            "Absolument. Nous pouvons autant agir comme équipe de production autonome que comme extension de votre département de communication, marketing ou ressources humaines.",
          status: "valide",
        },
        {
          question:
            "Est-il possible de produire plusieurs contenus durant un même tournage ?",
          answer:
            "Oui, et c'est même l'approche que nous privilégions. Nous planifions les tournages afin de créer plusieurs contenus à partir d'une même journée de production et ainsi maximiser votre investissement.",
          status: "valide",
        },
        {
          question:
            "Pouvez-vous filmer des personnes qui ne sont pas habituées à être devant une caméra ?",
          answer:
            "Oui. Notre équipe prend le temps de mettre les participants à l'aise et de créer un environnement naturel. Les entrevues sont réalisées sous forme de conversation plutôt que comme une performance devant la caméra.",
          status: "valide",
        },
        {
          question: "Pouvez-vous produire du contenu adapté aux réseaux sociaux ?",
          answer:
            "Oui. Nous pouvons livrer différentes déclinaisons selon vos plateformes : formats horizontaux, verticaux, courts, longs ou publicitaires.",
          status: "valide",
        },
        {
          question: "Comment gérez-vous les consentements des personnes filmées ?",
          answer: "{{PLACEHOLDER_REPONSE_CONSENTEMENTS}}",
          status: "a-valider",
        },
      ],
    },

    finalCta: {
      title: "On commence?",
      image: ctaImage,
    },

    /* --- Dossier de référence --------------------------------------- */

    problem: {
      eyebrow: "Ce qu'on entend, chaque fois",
      title: "Produire une vidéo dans le réseau, ce n'est pas produire une vidéo.",
      lead: "Le tournage est la partie facile. Ce qui coince est ailleurs.",
      realities: [
        {
          icon: "budget",
          title: "Le budget se décide avant que le projet existe",
          body: "Chiffrer un mandat des mois avant de savoir ce qu'il contiendra.",
        },
        {
          icon: "stamp",
          title: "Chaque tournage traverse plusieurs approbations",
          body:
            "Communications, chef d'unité, direction, syndicat. Et chaque consentement.",
        },
        {
          icon: "refresh",
          title: "Les capsules vieillissent vite",
          body:
            "Un nom change, et la capsule devient indiffusable. Aucune image n'est mauvaise.",
        },
        {
          icon: "people",
          title: "Le personnel que vous filmez travaille",
          body:
            "On ne peut pas immobiliser une unité ni retarder un soin pour un plan.",
        },
        {
          icon: "accessibility",
          title: "L'accessibilité est exigée au devis",
          body:
            "Sous-titres, transcription, parfois LSQ. Ça se planifie au montage et ça se chiffre au départ.",
        },
      ],
      closing:
        "Ces contraintes sont dans notre plan de production, pas dans nos surprises.",
    },

    mechanics: {
      eyebrow: "Jalons de production",
      title: "Un mandat, cinq jalons, aucune surprise.",
      lead:
        "Vous savez à chaque étape qui doit approuver quoi, et ce que vous recevez au bout.",
      steps: [
        {
          icon: "chat",
          title: "Cadrage",
          body: "Une rencontre pour nommer l'objectif, le public et la date de diffusion.",
          milestone: "Vous recevez une fourchette et un calendrier.",
        },
        {
          icon: "clipboard",
          title: "Préparation",
          body: "Scénario, repérage, consentements, horaire validé avec les chefs d'unité.",
          milestone: "Plan de tournage approuvé avant le jour 1.",
        },
        {
          icon: "camera",
          title: "Tournage",
          body: "Équipe réduite, matériel discret, horaire calé sur celui de l'unité.",
          milestone: "Rushes sauvegardés en double le soir même.",
        },
        {
          icon: "edit",
          title: "Montage",
          body: "Un premier montage, vos commentaires regroupés, une version corrigée.",
          milestone: "{{PLACEHOLDER_NOMBRE_RONDES_REVISION}}",
        },
        {
          icon: "delivery",
          title: "Livraison",
          body: "Fichiers finaux, déclinaisons, sous-titres et transcription.",
          milestone: "Livraison des formats convenus au cadrage.",
        },
      ],
      deliverables: {
        title: "Ce que vous recevez",
        items: [
          "Le fichier maître en haute définition",
          "Les déclinaisons pour vos plateformes",
          "Les sous-titres français au format .vtt",
          "La transcription complète en texte",
          "Les photos tirées du tournage",
        ],
      },
    },

    caseStudies: {
      eyebrow: "Preuve",
      title: "Un mandat, un chiffre, un nom.",
      lead:
        "Sans chiffre fourni par le client, ce n'est pas une étude de cas. C'est un portfolio.",
      items: [
        {
          organization: "{{PLACEHOLDER_ETUDE_ORGANISATION}}",
          context: "{{PLACEHOLDER_ETUDE_CONTEXTE}}",
          constraint: "{{PLACEHOLDER_ETUDE_CONTRAINTE}}",
          approach: "{{PLACEHOLDER_ETUDE_APPROCHE}}",
          deliverables: "{{PLACEHOLDER_ETUDE_LIVRABLES}}",
          result: {
            metric: "{{PLACEHOLDER_ETUDE_MESURE}}",
            value: "{{PLACEHOLDER_ETUDE_CHIFFRE}}",
            attribution: "{{PLACEHOLDER_ETUDE_SOURCE_DU_CHIFFRE}}",
          },
          testimonial: {
            quote: "{{PLACEHOLDER_TEMOIGNAGE_CITATION}}",
            name: "{{PLACEHOLDER_TEMOIGNAGE_NOM}}",
            role: "{{PLACEHOLDER_TEMOIGNAGE_TITRE}}",
            organization: "{{PLACEHOLDER_TEMOIGNAGE_ORGANISATION}}",
          },
        },
      ],
    },

    objections: {
      eyebrow: "Les vraies questions",
      title: "Ce que vous alliez demander à la troisième rencontre.",
      items: [
        {
          question: "Combien de temps entre la commande et la diffusion ?",
          answer: "{{PLACEHOLDER_REPONSE_DELAI_LIVRAISON}}",
          status: "a-valider",
        },
        {
          question: "Qui possède les fichiers sources et les droits ?",
          answer: "{{PLACEHOLDER_REPONSE_DROITS_ET_SOURCES}}",
          status: "a-valider",
        },
        {
          question: "Vous avez déjà tourné dans un environnement comme le nôtre ?",
          answer:
            "Oui. Nos mandats couvrent les hôpitaux, les CHSLD, les maisons des aînés, les centres de réadaptation et les organismes communautaires.",
          status: "a-valider",
        },
        {
          question: "Comment ça se passe avec nos approbations internes ?",
          answer:
            "On planifie les approbations comme une étape de production, avec une date pour chaque validation. Les commentaires sont regroupés en une seule fois par ronde.",
          status: "a-valider",
        },
        {
          question: "Livrez-vous les versions accessibles ?",
          answer: "{{PLACEHOLDER_REPONSE_ACCESSIBILITE_LIVRABLES}}",
          status: "a-valider",
        },
        {
          question: "Pouvez-vous répondre à un appel d'offres public ?",
          answer: "{{PLACEHOLDER_REPONSE_APPELS_OFFRES}}",
          status: "a-valider",
        },
        {
          question: "Qui, précisément, sera sur le plateau ?",
          answer: "{{PLACEHOLDER_REPONSE_COMPOSITION_EQUIPE}}",
          status: "a-valider",
        },
        {
          question:
            "Nos capsules portent encore l'ancienne signature. Faut-il tout retourner ?",
          answer:
            "Rarement. On commence par un inventaire de votre vidéothèque : ce qui se corrige au montage, ce qui se retourne partiellement, et ce qui doit être refait. La majorité des capsules se récupèrent sans nouveau tournage.",
          status: "a-valider",
        },
        {
          question: "On n'a pas de budget cette année.",
          answer:
            "C'est fréquent, et ce n'est pas un problème. On peut chiffrer maintenant pour que vous ayez un montant défendable à inscrire au prochain cycle budgétaire.",
          status: "a-valider",
        },
        {
          question: "Combien de temps gardez-vous nos fichiers ?",
          answer: "{{PLACEHOLDER_REPONSE_ARCHIVAGE}}",
          status: "a-valider",
        },
      ],
    },

    investment: {
      eyebrow: "Investissement",
      title: "Ce que ça coûte, et ce qui fait varier le montant.",
      lead:
        "Un montant à inscrire dans une demande interne, avant même que le projet soit défini.",
      tiers: [
        {
          icon: "camera",
          label: "Capsule unique",
          range: "{{PLACEHOLDER_FOURCHETTE_CAPSULE_UNIQUE}}",
          description: "Un message, un lieu de tournage, une journée sur place.",
          status: "a-valider",
        },
        {
          icon: "layers",
          label: "Série de capsules",
          range: "{{PLACEHOLDER_FOURCHETTE_SERIE}}",
          description: "Plusieurs contenus tirés des mêmes journées de tournage.",
          status: "a-valider",
        },
        {
          icon: "refresh",
          label: "Remise à neuf de vidéothèque",
          range: "{{PLACEHOLDER_FOURCHETTE_VIDEOTHEQUE}}",
          description:
            "Inventaire du catalogue, mise à jour de l'habillage, retournage ciblé.",
          status: "a-valider",
        },
        {
          icon: "scale",
          label: "Projet d'envergure",
          range: "{{PLACEHOLDER_FOURCHETTE_ENVERGURE}}",
          description:
            "Plusieurs sites, comédiens, motion design, versions accessibles complètes.",
          status: "a-valider",
        },
      ],
      drivers: [
        "Le nombre de lieux de tournage",
        "Le nombre de journées de tournage",
        "La présence de comédiens ou de figuration",
        "Une version en langue des signes québécoise",
        "L'ajout d'une audiodescription",
        "Le motion design et l'animation",
        "Le nombre de déclinaisons",
        "Le nombre de langues de diffusion",
      ],
      note:
        "Ces fourchettes couvrent la majorité de nos mandats. Une conversation suffit pour resserrer le montant.",
    },

    team: {
      eyebrow: "Qui fait le travail",
      title: "Une équipe, une adresse, du matériel à nous.",
      body:
        "Pas de sous-traitance en cascade. Les personnes que vous rencontrez au départ sont celles qui seront sur le plateau.",
      credentials: [
        {
          label: "Adresse",
          value: "74, rue Saint-Laurent, Beauharnois (Québec) J6N 1V6",
        },
        { label: "Téléphone", value: "450 395-1777" },
        { label: "NEQ", value: "{{PLACEHOLDER_NEQ}}" },
        { label: "En activité depuis", value: "{{PLACEHOLDER_ANNEE_FONDATION}}" },
        { label: "Taille de l'équipe", value: "{{PLACEHOLDER_TAILLE_EQUIPE}}" },
        {
          label: "Assurance responsabilité civile",
          value: "{{PLACEHOLDER_COUVERTURE_ASSURANCE}}",
        },
      ],
      images: [
        { src: crewImage, alt: "Deux membres de l'équipe cadrent un plan" },
        { src: classroomImage, alt: "Captation d'une entrevue en établissement" },
        { src: roomImage, alt: "Tournage dans une salle d'intervention" },
      ],
    },
  },

  en: {
    meta: {
      title: "Video production and content for healthcare organizations | Zéro huit",
      description:
        "Content creation and video production for healthcare organizations: corporate video, awareness campaigns, recruitment, testimonials, photography and digital content.",
      path: "/production-video-sante",
      serviceName: "Content creation for healthcare organizations",
      breadcrumbLabel: "Healthcare",
    },

    cta: {
      label: "Discuss your project",
      href: "/request",
      whatHappensNext:
        "Simply tell us what you want to communicate. We will find the best way to turn it into content.",
    },

    lowPressureCta: {
      label: "See how we work",
      href: "/production-video-sante/dossier",
      description:
        "How we work in detail, our price ranges, and our answers to procurement questions. No call.",
    },

    hero: {
      eyebrow: "Communications · Health · Social services",
      titleLine1: "Put a human face",
      titleLine2: "on your mission.",
      subtitle:
        "Video production, photography and digital content for organizations in the health and social services network.",
      valuePropLead: "Inform. Raise awareness. Recruit. Mobilize.",
      valuePropBody:
        "We turn your challenges into clear, human and professional content.",
      trustLine:
        "An approach adapted to sensitive environments and institutional realities.",
      trustPoints: [
        "Rigorous planning",
        "A human approach",
        "End-to-end production",
      ],
      image: heroImage,
      imageAlt:
        "Three healthcare professionals reviewing a file in a care unit corridor",
      imageIsTemporary: false,
    },

    heroCard: {
      title: "One day. Many pieces of content.",
      items: [
        {
          icon: "video",
          value: "1 main video",
          label: "The core message of your project",
        },
        {
          icon: "layers",
          value: "3 to 10 short videos",
          label: "To extend your campaign",
        },
        {
          icon: "camera",
          value: "A photo library",
          label: "Authentic, reusable images",
        },
        {
          icon: "share",
          value: "Multiple formats",
          label: "Web · Social · Vertical · Horizontal",
        },
      ],
      footnote: "A production designed to get the most out of every shooting day.",
    },

    proof: {
      label: "They trusted us with mandates in the network",
      logos: [
        {
          src: cisssmoLogo,
          alt: "CISSS de la Montérégie-Ouest",
          authorization: "documentee",
        },
        { src: cnesstLogo, alt: "CNESST", authorization: "documentee" },
        {
          src: ccqLogo,
          alt: "Centre de services sociaux des Patriotes",
          authorization: "a-obtenir",
        },
        { src: cegepLogo, alt: "Cégep de Valleyfield", authorization: "documentee" },
      ],
    },

    narrative: {
      eyebrow: "Our approach",
      titleLine1: "Before we create,",
      titleLine2: "we work to understand.",
      titleAccent: "understand",
      lead:
        "Because good content doesn't start with a camera. It starts with a question: what do you actually need people to understand, to feel, or to act on?",
      principles: [
        {
          label: "Understand",
          title: "Your reality",
          caption: "Listen before creating.",
          body:
            "We analyze your communication challenges in health and social services, your audiences and your constraints, to define a message that fits your reality.",
          image: observeImage,
          imageAlt: "A crew member watching a scene closely during a shoot",
        },
        {
          label: "Clarify",
          title: "The message",
          caption: "Find what truly deserves to be said.",
          body:
            "We turn complex information into clear, accessible and human communications, tailored to your users, your teams and your partners.",
          image: decideImage,
          imageAlt: "Two crew members discussing at the monitor during a shoot",
        },
        {
          label: "Create",
          title: "The right format",
          caption: "Choose the best way to tell it.",
          body:
            "Video production, photography or digital content: we choose the right format to inform, raise awareness, recruit or mobilize your audiences.",
          image: setImage,
          imageAlt: "Film crew at work around a prepared scene",
        },
      ],
    },

    portfolio: {
      eyebrow: "Our work",
      title: "See for yourself.",
      moreCta: { label: "See our full portfolio", href: "/portfolio" },
      items: [
        { uid: "6b54c8bbaf2e073c5d338c8cf55c64c5" },
        { uid: "f2153bfbcaec089659ea0aa3f8fecf8f" },
        { uid: "459bcc1b1ec40c5a0a208134637e1487" },
        { uid: "dbf32f0597ec3a18a99b4303a1d1a4cd" },
        { uid: "e2433ff6d6852933862d3459c269ae29" },
      ],
    },

    services: {
      eyebrow: "Our services",
      title: "Communication services built for health and social services.",
      lead:
        "Video production, photography, awareness campaigns, communication to users, recruitment and digital content: we create tools that are clear, human and suited to your reality.",
      items: [
        {
          icon: "video",
          category: "Video production",
          navLabel: "Video",
          title: "Corporate and institutional video production",
          body:
            "Present your organization, your mission, your teams and your services with professional video production suited to the realities of the health and social services network.",
          examplesLabel: "Applications",
          examples: [
            "Institutional video",
            "Service presentation",
            "Team portraits",
            "Testimonials",
            "Videos for partners",
          ],
          image: classroomImage,
          imageAlt: "An interview with a professional being filmed in their workplace",
        },
        {
          icon: "camera",
          category: "Photography",
          navLabel: "Photo",
          title: "Professional photography",
          body:
            "Build an authentic, consistent image library that truly represents your teams, your services, your facilities and the people who bring your organization to life.",
          examplesLabel: "Applications",
          examples: [
            "Image library",
            "Portraits",
            "Work environment",
            "Advertising campaigns",
            "Annual reports",
            "Websites",
            "Media relations",
          ],
          image: portraitImage,
          imageAlt: "A portrait framed on the monitor during a session",
        },
        {
          icon: "chat",
          category: "Communication to users",
          navLabel: "Users",
          title: "Clear communication for users and their families",
          body:
            "Turn services, rights, instructions and complex care pathways into simple, accessible content that users and their families can follow.",
          examplesLabel: "Applications",
          examples: [
            "Access to services",
            "Users' rights",
            "Instructions and procedures",
            "Care pathways",
            "Explainer videos",
            "Plain language",
          ],
          image: roomImage,
          imageAlt: "A short video being filmed in a treatment room",
        },
        {
          icon: "megaphone",
          category: "Awareness",
          navLabel: "Awareness",
          title: "Awareness and prevention campaigns",
          body:
            "Make health and social issues understood with campaigns that are human, accessible and built to inform, raise awareness and prompt action.",
          examplesLabel: "Applications",
          examples: [
            "Prevention",
            "Public health",
            "Awareness",
            "Healthy habits",
            "Population campaigns",
            "Community initiatives",
          ],
          image: gatheringImage,
          imageAlt: "A scene with several people being filmed in a public space",
        },
        {
          icon: "people",
          category: "Recruitment",
          navLabel: "Recruitment",
          title: "Recruitment and employer brand",
          body:
            "Show what your workplace, your teams and your culture are really like, so candidates recognize themselves in your organization.",
          examplesLabel: "Applications",
          examples: [
            "Recruitment campaigns",
            "Job profiles",
            "Employee testimonials",
            "Team portraits",
            "Employer brand",
            "Work environment",
          ],
          image: teamImage,
          imageAlt: "A team gathered around a camera during a shoot",
        },
        {
          icon: "clipboard",
          category: "Training and internal communication",
          navLabel: "Training",
          title: "Training and internal communication",
          body:
            "Support onboarding, training and the flow of information with video and digital content designed for your employees, professionals and partners.",
          examplesLabel: "Applications",
          examples: [
            "Onboarding",
            "Clinical procedures",
            "Health and safety",
            "Internal policies",
            "Continuing education",
            "Management communications",
          ],
          image: meetingImage,
          imageAlt: "Three people in a working meeting around a project",
        },
        {
          icon: "heart",
          category: "Human stories",
          navLabel: "Stories",
          title: "Testimonials and human stories",
          body:
            "Give a voice to the people behind your mission, with testimonials filmed with sensitivity, respect and authenticity.",
          examplesLabel: "Applications",
          examples: [
            "Users",
            "Families",
            "Professionals",
            "Employees",
            "Volunteers",
            "Partners",
          ],
          image: crewImage,
          imageAlt: "Two people on a shoot, in a moment of listening",
        },
        {
          icon: "share",
          category: "Social media",
          navLabel: "Social media",
          title: "Photo and video content for social media",
          body:
            "Turn your shoots into short content suited to social platforms, to inform your community and extend the life of every production.",
          examplesLabel: "Applications",
          examples: [
            "Short videos",
            "Reels",
            "Vertical video",
            "Interview excerpts",
            "Portraits",
            "Educational content",
            "Photos",
            "Campaign variations",
          ],
          image: lightSetImage,
          imageAlt: "Two crew members setting up a scene",
        }
      ],
    },
    highlights: {
      eyebrow: "Common mandates",
      title: "Three situations we know inside out.",
      lead:
        "These are the requests that come up most often in the network. We know how to run them.",
      items: [
        {
          icon: "refresh",
          title: "Renewing your video library",
          body:
            "After a reorganization, your videos still carry your institution's former identity: old names, old logos, old contact details. They become unusable without a single bad frame in them.",
          points: [
            "A full inventory of your catalogue",
            "What can be fixed in editing: graphics, titles, contact details, voice-over",
            "What needs a partial reshoot",
            "What has to be redone",
            "Most videos can be recovered without filming again",
          ],
        },
        {
          icon: "scale",
          title: "Large-scale projects",
          body:
            "A campaign rolled out over several months, across several sites and audiences. We coordinate everything, and you deal with one contact.",
          points: [
            "Multiple sites and multiple teams",
            "A production schedule spread over several months",
            "Actors, motion design, accessible versions",
            "One single contact for the entire mandate",
            "Staggered deliveries to match your deadlines",
          ],
        },
        {
          icon: "budget",
          title: "A budget you have to defend internally",
          body:
            "You have to price a mandate before it is even defined, then commit it before the end of the fiscal year. We give you what you need to defend it.",
          points: [
            "A price range from the first conversation",
            "A breakdown of what makes the amount vary",
            "A figure you can use as is in an internal request",
            "The option to plan for the next budget cycle",
            "No commitment until the scope is clear",
          ],
        },
      ],
    },

    audiences: {
      eyebrow: "Who we work with",
      title: "Which kinds of organizations?",
      lead:
        "We can support a range of healthcare and public service organizations.",
      items: [
        "Health institutions and facilities",
        "Foundations",
        "Clinics and medical groups",
        "Associations and professional orders",
        "Community organizations",
        "Mental health and social services organizations",
        "Research centres",
        "Prevention and public health organizations",
        "Companies building solutions for the health sector",
      ],
    },

    approach: {
      eyebrow: "Our approach",
      title: "An approach adapted to your reality",
      lead: "Communications in healthcare call for a particular approach.",
      constraints: [
        "Complex subjects sometimes need to be made simple.",
        "Content has to be created in sensitive environments.",
        "You work with people who are not used to being on camera.",
        "Significant operational constraints must be respected.",
      ],
      bridge:
        "And above all, never losing sight of the person behind the message.",
      principles: [
        {
          icon: "heart",
          title: "Humanity",
          body:
            "We create simple, respectful and reassuring filming environments so that the people on camera can stay themselves.",
        },
        {
          icon: "idea",
          title: "Clarity",
          body:
            "We help you turn sometimes complex subjects into messages that are easy to understand.",
        },
        {
          icon: "clock",
          title: "Efficiency",
          body:
            "We prepare every production to limit the impact on your teams and your operations.",
        },
        {
          icon: "badge",
          title: "Quality",
          body:
            "Every piece of content is built to represent your organization professionally, in both the image and the message.",
        },
      ],
    },

    process: {
      eyebrow: "How it works",
      title: "Your team already has a lot to manage.",
      lead:
        "From strategy to delivery, our team takes charge of your production to keep the process simple for your teams.",
      steps: [
        {
          icon: "chat",
          title: "Understand",
          accentWord: "Listen",
          body:
            "We start by understanding your organization, your audience and the goal of your communication.",
        },
        {
          icon: "pen",
          title: "Design",
          accentWord: "Imagine",
          body:
            "Our team develops the concept, the messages, the interview questions and the structure of the content.",
        },
        {
          icon: "calendar",
          title: "Plan",
          accentWord: "Organize",
          body:
            "We coordinate the shoot, the participants, the schedules and the technical needs.",
        },
        {
          icon: "camera",
          title: "Produce",
          accentWord: "Capture",
          body: "Our team handles the video, photo and audio capture.",
        },
        {
          icon: "edit",
          title: "Edit",
          accentWord: "Assemble",
          body:
            "We turn the captured material into professional content adapted to your different platforms.",
        },
        {
          icon: "layers",
          title: "Adapt",
          accentWord: "Share",
          body:
            "When needed, we create several versions and formats to get the most out of your content.",
        },
      ],
    },

    multiplier: {
      eyebrow: "Return on production",
      title: "One shoot. Many pieces of content.",
      lead:
        "Your project should not stop at a single video. A well-planned production can generate:",
      outputs: [
        "1 main video",
        "3 to 10 short videos",
        "Dozens of photographs",
        "Excerpts for social media",
        "Individual testimonials",
        "Vertical and horizontal formats",
        "Content for your website",
        "Material for your recruitment or awareness campaigns",
      ],
      goal: "Get the most value out of every production day.",
    },

    midCta: {
      title: "You have the message. We find the best way to tell it.",
      questions: [
        "Are you preparing a campaign?",
        "Do you want to modernize your content?",
        "Do you need to present a new service?",
        "Are you looking to showcase your employees?",
        "Do you want to raise public awareness of an issue?",
        "Or do you simply have an idea you would like to turn into a project?",
      ],
      body:
        "Let's talk. Our team can propose an approach adapted to your objectives, your timeline and your budget.",
      composer: {
        prompt: "Check what applies to you",
        empty:
          "Select one or more needs: we will show the matching deliverables, and your selection will reach us with your request.",
        summaryTitle: "Your project",
        deliverables: "Possible deliverables",
        reset: "Clear all",
      },
    },

    demo: {
      eyebrow: "The work itself",
      title: "What it looks like, filmed inside an institution.",
      lead: "Not a showreel from 12 industries. Videos shot inside the network.",
      videos: [
        {
          kind: "demo",
          uid: "{{PLACEHOLDER_UID_BANDE_DEMO_SANTE}}",
          title: "Showreel — healthcare",
          durationSeconds: 60,
          posterAlt: "Excerpts from videos shot in health institutions",
          productionNotes: [
            "Filmed in an active unit, without interrupting care",
            "Small crew, a single power connection point",
            "Consent obtained before the first shot",
          ],
          transcript: "{{PLACEHOLDER_TRANSCRIPTION_BANDE_DEMO}}",
          captionsSrc: "{{PLACEHOLDER_VTT_BANDE_DEMO}}",
        },
        {
          kind: "case",
          uid: "{{PLACEHOLDER_UID_ETUDE_DE_CAS}}",
          title: "Filmed case study",
          durationSeconds: 120,
          posterAlt: "Communications lead of an institution being interviewed",
          productionNotes: [
            "The client tells the story and names the result",
            "Filmed in half a day, on location",
          ],
          transcript: "{{PLACEHOLDER_TRANSCRIPTION_ETUDE_DE_CAS}}",
          captionsSrc: "{{PLACEHOLDER_VTT_ETUDE_DE_CAS}}",
        },
      ],
    },

    faq: {
      eyebrow: "Frequently asked questions",
      title: "Frequently asked questions",
      items: [
        {
          question: "Can you support us from the very start of the project?",
          answer:
            "Yes. We can step in as early as the initial thinking, to help you define the concept, the messages, the formats and the content strategy.",
          status: "valide",
        },
        {
          question: "Can you work with our communications team?",
          answer:
            "Absolutely. We can act as an independent production team or as an extension of your communications, marketing or human resources department.",
          status: "valide",
        },
        {
          question: "Can several pieces of content be produced during one shoot?",
          answer:
            "Yes, and it is the approach we favour. We plan shoots so that several pieces of content come out of a single production day, which maximizes your investment.",
          status: "valide",
        },
        {
          question: "Can you film people who are not used to being on camera?",
          answer:
            "Yes. Our team takes the time to put participants at ease and create a natural environment. Interviews are run as a conversation rather than a performance in front of the camera.",
          status: "valide",
        },
        {
          question: "Can you produce content adapted to social media?",
          answer:
            "Yes. We can deliver different versions for your platforms: horizontal, vertical, short, long or advertising formats.",
          status: "valide",
        },
        {
          question: "How do you handle consent from the people filmed?",
          answer: "{{PLACEHOLDER_REPONSE_CONSENTEMENTS}}",
          status: "a-valider",
        },
      ],
    },

    finalCta: {
      title: "Your next project starts with a conversation.",
      body:
        "Simply tell us what you want to communicate. We will find the best way to turn it into content.",
      image: ctaImage,
    },

    problem: {
      eyebrow: "What we hear, every time",
      title: "Producing a video in the network is not just producing a video.",
      lead: "Filming is the easy part. The friction is elsewhere.",
      realities: [
        {
          icon: "budget",
          title: "The budget is set before the project exists",
          body: "Pricing a mandate months before knowing what it will contain.",
        },
        {
          icon: "stamp",
          title: "Every shoot goes through several approvals",
          body: "Communications, unit manager, management, union. And every consent form.",
        },
        {
          icon: "refresh",
          title: "Videos age quickly",
          body: "A name changes, and the video is unusable. Not one bad frame in it.",
        },
        {
          icon: "people",
          title: "The staff you film are working",
          body: "You cannot freeze a unit or delay care for a shot.",
        },
        {
          icon: "accessibility",
          title: "Accessibility is required in the tender",
          body:
            "Subtitles, transcripts, sometimes LSQ. It is planned during editing and priced from the start.",
        },
      ],
      closing:
        "These constraints are in our production plan, not in our surprises.",
    },

    mechanics: {
      eyebrow: "Production milestones",
      title: "One mandate, five milestones, no surprises.",
      lead: "At every step you know who approves what, and what you receive at the end.",
      steps: [
        {
          icon: "chat",
          title: "Framing",
          body: "One meeting to name the objective, the audience and the release date.",
          milestone: "You receive a price range and a schedule.",
        },
        {
          icon: "clipboard",
          title: "Preparation",
          body: "Script, scouting, consent forms, schedule confirmed with unit managers.",
          milestone: "Shooting plan approved before day one.",
        },
        {
          icon: "camera",
          title: "Filming",
          body: "Small crew, discreet equipment, schedule aligned with the unit.",
          milestone: "Footage backed up twice the same evening.",
        },
        {
          icon: "edit",
          title: "Editing",
          body: "A first cut, your feedback gathered in one pass, a corrected version.",
          milestone: "{{PLACEHOLDER_NOMBRE_RONDES_REVISION}}",
        },
        {
          icon: "delivery",
          title: "Delivery",
          body: "Final files, platform versions, subtitles and transcript.",
          milestone: "Delivery of the formats agreed at framing.",
        },
      ],
      deliverables: {
        title: "What you receive",
        items: [
          "The high-definition master file",
          "Versions for your platforms",
          "French subtitles in .vtt format",
          "The full text transcript",
          "Photos taken during the shoot",
        ],
      },
    },

    caseStudies: {
      eyebrow: "Proof",
      title: "One mandate, one number, one name.",
      lead:
        "Without a number provided by the client, it is not a case study. It is a portfolio.",
      items: [
        {
          organization: "{{PLACEHOLDER_ETUDE_ORGANISATION}}",
          context: "{{PLACEHOLDER_ETUDE_CONTEXTE}}",
          constraint: "{{PLACEHOLDER_ETUDE_CONTRAINTE}}",
          approach: "{{PLACEHOLDER_ETUDE_APPROCHE}}",
          deliverables: "{{PLACEHOLDER_ETUDE_LIVRABLES}}",
          result: {
            metric: "{{PLACEHOLDER_ETUDE_MESURE}}",
            value: "{{PLACEHOLDER_ETUDE_CHIFFRE}}",
            attribution: "{{PLACEHOLDER_ETUDE_SOURCE_DU_CHIFFRE}}",
          },
          testimonial: {
            quote: "{{PLACEHOLDER_TEMOIGNAGE_CITATION}}",
            name: "{{PLACEHOLDER_TEMOIGNAGE_NOM}}",
            role: "{{PLACEHOLDER_TEMOIGNAGE_TITRE}}",
            organization: "{{PLACEHOLDER_TEMOIGNAGE_ORGANISATION}}",
          },
        },
      ],
    },

    objections: {
      eyebrow: "The real questions",
      title: "What you were going to ask at the third meeting.",
      items: [
        {
          question: "How long from order to release?",
          answer: "{{PLACEHOLDER_REPONSE_DELAI_LIVRAISON}}",
          status: "a-valider",
        },
        {
          question: "Who owns the source files and the rights?",
          answer: "{{PLACEHOLDER_REPONSE_DROITS_ET_SOURCES}}",
          status: "a-valider",
        },
        {
          question: "Have you filmed in an environment like ours?",
          answer:
            "Yes. Our mandates cover hospitals, long-term care homes, seniors' residences, rehabilitation centres and community organizations.",
          status: "a-valider",
        },
        {
          question: "How does it work with our internal approvals?",
          answer:
            "We plan approvals as a production step, with a date for each sign-off. Feedback is gathered in a single pass per round.",
          status: "a-valider",
        },
        {
          question: "Do you deliver accessible versions?",
          answer: "{{PLACEHOLDER_REPONSE_ACCESSIBILITE_LIVRABLES}}",
          status: "a-valider",
        },
        {
          question: "Can you respond to a public tender?",
          answer: "{{PLACEHOLDER_REPONSE_APPELS_OFFRES}}",
          status: "a-valider",
        },
        {
          question: "Who exactly will be on set?",
          answer: "{{PLACEHOLDER_REPONSE_COMPOSITION_EQUIPE}}",
          status: "a-valider",
        },
        {
          question: "Our videos still carry the old identity. Do we reshoot everything?",
          answer:
            "Rarely. We start with an inventory of your video library: what can be fixed in editing, what needs partial reshooting, and what must be redone. Most videos can be recovered without filming again.",
          status: "a-valider",
        },
        {
          question: "We have no budget this year.",
          answer:
            "That is common, and it is not a problem. We can price it now so you have a defensible amount for the next budget cycle.",
          status: "a-valider",
        },
        {
          question: "How long do you keep our files?",
          answer: "{{PLACEHOLDER_REPONSE_ARCHIVAGE}}",
          status: "a-valider",
        },
      ],
    },

    investment: {
      eyebrow: "Investment",
      title: "What it costs, and what makes the amount vary.",
      lead:
        "A number for an internal request, before the project is even defined.",
      tiers: [
        {
          icon: "camera",
          label: "Single video",
          range: "{{PLACEHOLDER_FOURCHETTE_CAPSULE_UNIQUE}}",
          description: "One message, one location, one day on site.",
          status: "a-valider",
        },
        {
          icon: "layers",
          label: "Series of videos",
          range: "{{PLACEHOLDER_FOURCHETTE_SERIE}}",
          description: "Several pieces of content from the same shooting days.",
          status: "a-valider",
        },
        {
          icon: "refresh",
          label: "Video library renewal",
          range: "{{PLACEHOLDER_FOURCHETTE_VIDEOTHEQUE}}",
          description: "Catalogue inventory, updated graphics, targeted reshoots.",
          status: "a-valider",
        },
        {
          icon: "scale",
          label: "Large-scale project",
          range: "{{PLACEHOLDER_FOURCHETTE_ENVERGURE}}",
          description:
            "Multiple sites, actors, motion design, full accessible versions.",
          status: "a-valider",
        },
      ],
      drivers: [
        "The number of filming locations",
        "The number of shooting days",
        "The presence of actors or extras",
        "A Quebec Sign Language version",
        "Adding audio description",
        "Motion design and animation",
        "The number of platform versions",
        "The number of broadcast languages",
      ],
      note:
        "These ranges cover most of our mandates. One conversation is enough to narrow the number down.",
    },

    team: {
      eyebrow: "Who does the work",
      title: "One team, one address, our own equipment.",
      body:
        "No cascading subcontracting. The people you meet at the start are the people on set.",
      credentials: [
        {
          label: "Address",
          value: "74, rue Saint-Laurent, Beauharnois (Quebec) J6N 1V6",
        },
        { label: "Phone", value: "450 395-1777" },
        { label: "Quebec enterprise number", value: "{{PLACEHOLDER_NEQ}}" },
        { label: "In business since", value: "{{PLACEHOLDER_ANNEE_FONDATION}}" },
        { label: "Team size", value: "{{PLACEHOLDER_TAILLE_EQUIPE}}" },
        {
          label: "Liability insurance",
          value: "{{PLACEHOLDER_COUVERTURE_ASSURANCE}}",
        },
      ],
      images: [
        { src: crewImage, alt: "Two crew members framing a shot" },
        { src: classroomImage, alt: "Interview being filmed in an institution" },
        { src: roomImage, alt: "Filming in a treatment room" },
      ],
    },
  },
};
