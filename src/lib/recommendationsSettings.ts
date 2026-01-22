export type ObjectiveRule = {
  types: string[];
  objectifs: string[];
  priorityObjectifs: string[];
};

export type RecommendationSettings = {
  keywordLimit?: number;
  fallbackToBest?: boolean;
  objectives?: Record<string, ObjectiveRule>;
  audiences?: Record<string, string[]>;
};

export const defaultRecommendationSettings: RecommendationSettings = {
  keywordLimit: 4,
  fallbackToBest: true,
  objectives: {
    promotion: {
      types: ["Animation 3D", "Corpo", "Publicité", "Story", "Événement"],
      objectifs: ["Communautaire", "Événementiel", "Notoriété", "Promotionnelle"],
      priorityObjectifs: ["Promotionnelle"],
    },
    recrutement: {
      types: ["Corpo", "Publicité", "Capsule", "Story"],
      objectifs: [
        "Communautaire",
        "Informatif",
        "Notoriété",
        "Promotionnelle",
        "Recrutement",
      ],
      priorityObjectifs: ["Recrutement"],
    },
    informatif: {
      types: [
        "Animation 3D",
        "Capsule",
        "Corpo",
        "Documentaire",
        "Événement",
        "Podcast",
        "Story",
      ],
      objectifs: [
        "Communautaire",
        "Éducatif",
        "Événementiel",
        "Informatif",
        "Recrutement",
      ],
      priorityObjectifs: ["Informatif"],
    },
    divertissement: {
      types: [
        "Capsule",
        "Captation",
        "Court métrage",
        "Documentaire",
        "Événement",
        "Podcast",
        "Story",
        "Vidéoclip",
      ],
      objectifs: ["Divertissement", "Événementiel"],
      priorityObjectifs: ["Divertissement"],
    },
  },
  audiences: {
    clients_potentiels: [
      "Captation",
      "Court métrage",
      "Documentaire",
      "Événement",
      "Vidéoclip",
    ],
    clients_actuels: [
      "Captation",
      "Court métrage",
      "Documentaire",
      "Événement",
      "Vidéoclip",
    ],
    interne: ["Captation", "Court métrage", "Vidéoclip"],
    evenement: ["Story", "Podcast", "Court métrage"],
  },
};

export async function loadRecommendationSettings() {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "recommendations-settings.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as RecommendationSettings;
    return {
      ...defaultRecommendationSettings,
      ...parsed,
      objectives: parsed.objectives ?? defaultRecommendationSettings.objectives,
      audiences: parsed.audiences ?? defaultRecommendationSettings.audiences,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ENOENT")) {
      return defaultRecommendationSettings;
    }
    throw error;
  }
}
