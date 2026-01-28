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
      "Au-del\u00e0 des slogans : faire vivre votre culture organisationnelle en images",
    excerpt:
      "Des rep\u00e8res visuels et un storytelling align\u00e9s sur vos valeurs pour renforcer l'adh\u00e9sion.",
    dateLabel: "2 d\u00e9cembre 2025",
    author: "Jean-Benoit Monni\u00e8re",
    image: production,
    slug: "production-video-montreal",
    href: "/articles/production-video-montreal",
  },
  {
    title:
      "Miser sur l'humain : une vid\u00e9o RH transformera la r\u00e9tention de vos employ\u00e9s",
    excerpt:
      "Recruter, int\u00e9grer et mobiliser : pourquoi le format vid\u00e9o fait la diff\u00e9rence.",
    dateLabel: "25 novembre 2025",
    author: "Jean-Benoit Monni\u00e8re",
    image: postProduction,
    slug: "comment-bien-realiser-une-video-corporative",
    href: "/articles/comment-bien-realiser-une-video-corporative",
  },
  {
    title: "La vid\u00e9o corporative : rentable, m\u00eame pour une PME.",
    excerpt:
      "ROI, notori\u00e9t\u00e9 et conversion : trois raisons d'investir dans une production locale.",
    dateLabel: "19 novembre 2025",
    author: "Jean-Benoit Monni\u00e8re",
    image: batisse,
    slug: "combien-coute-une-production-video",
    href: "/articles/combien-coute-une-production-video",
  },
];
