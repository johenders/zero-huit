import { RequestApp } from "@/components/RequestApp";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demande de soumission — Zéro huit",
  description:
    "Formulaire pour démarrer un projet vidéo et recevoir une réponse rapide et personnalisée.",
  openGraph: {
    title: "Demande de soumission — Zéro huit",
    description:
      "Formulaire pour démarrer un projet vidéo et recevoir une réponse rapide et personnalisée.",
  },
  twitter: {
    title: "Demande de soumission — Zéro huit",
    description:
      "Formulaire pour démarrer un projet vidéo et recevoir une réponse rapide et personnalisée.",
  },
};

export default function RequestPage() {
  return <RequestApp />;
}
