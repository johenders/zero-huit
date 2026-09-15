import type { StaticImageData } from "next/image";

import batisse from "../../assets/batisse.jpg";
import production from "../../assets/services/production.jpg";
import postProduction from "../../assets/services/post_production.jpg";

export type ArticleCard = {
  title: string;
  excerpt: string;
  dateLabel: string;
  author: string;
  image: StaticImageData;
  slug: string;
  href: string;
};

export const fallbackArticles: ArticleCard[] = [
  {
    title:
      "Au-delà des slogans : faire vivre votre culture organisationnelle en images",
    excerpt:
      "Des repères visuels et un storytelling alignés sur vos valeurs pour renforcer l'adhésion.",
    dateLabel: "2 décembre 2025",
    author: "Jean-Benoit Monnière",
    image: production,
    slug: "au-dela-des-slogans-faire-vivre-votre-culture-organisationnelle-en-images",
    href: "/nouvelles/au-dela-des-slogans-faire-vivre-votre-culture-organisationnelle-en-images",
  },
  {
    title:
      "Miser sur l'humain : une vidéo RH transformera la rétention de vos employés",
    excerpt:
      "Recruter, intégrer et mobiliser : pourquoi le format vidéo fait la différence.",
    dateLabel: "25 novembre 2025",
    author: "Jean-Benoit Monnière",
    image: postProduction,
    slug: "miser-sur-l-humain-une-video-rh-transformera-la-retention-de-vos-employes",
    href: "/nouvelles/miser-sur-l-humain-une-video-rh-transformera-la-retention-de-vos-employes",
  },
  {
    title: "La vidéo corporative : rentable, même pour une PME.",
    excerpt:
      "ROI, notoriété et conversion : trois raisons d'investir dans une production locale.",
    dateLabel: "19 novembre 2025",
    author: "Jean-Benoit Monnière",
    image: batisse,
    slug: "la-video-corporative-rentable-meme-pour-une-pme",
    href: "/nouvelles/la-video-corporative-rentable-meme-pour-une-pme",
  },
];
