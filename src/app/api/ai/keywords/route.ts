import { NextResponse } from "next/server";
import { cloudflareThumbnailSrc } from "@/lib/cloudflare";

type Payload = {
  cloudflareUid?: string;
  times?: number[];
  availableKeywords?: string[];
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u00a0]/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function uniqueNumbers(values: number[]) {
  const seen = new Set<number>();
  const result: number[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const cloudflareUid = body.cloudflareUid?.trim();
    const availableKeywords = Array.isArray(body.availableKeywords)
      ? body.availableKeywords.map((label) => label.trim()).filter(Boolean)
      : [];

    if (!cloudflareUid) {
      return NextResponse.json({ error: "cloudflareUid manquant." }, { status: 400 });
    }
    if (availableKeywords.length === 0) {
      return NextResponse.json({ error: "Liste de mots-clés manquante." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquant côté serveur." },
        { status: 500 },
      );
    }

    const defaultTimes = [1, 3, 6, 9, 12];
    const times = uniqueNumbers(
      (Array.isArray(body.times) && body.times.length > 0 ? body.times : defaultTimes)
        .map((value) => Math.max(0, Math.floor(value)))
        .slice(0, 5),
    );

    const system = [
      "Tu analyses des thumbnails vidéo pour proposer des mots-clés.",
      "Tu dois choisir des mots-clés existants parmi la liste fournie.",
      "Tu peux proposer de nouveaux mots-clés courts si aucun existant ne convient.",
      "Évite les doublons et les synonymes très proches.",
      "Réponds uniquement en JSON valide.",
    ].join(" ");

    const inputImages = times.map((time) => ({
      type: "input_image",
      image_url: cloudflareThumbnailSrc(cloudflareUid, time),
    }));

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        text: {
          format: {
            type: "json_schema",
            name: "keyword_suggestions",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                existing: { type: "array", items: { type: "string" } },
                new: { type: "array", items: { type: "string" } },
              },
              required: ["existing", "new"],
            },
          },
        },
        input: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  task: "Propose 3 à 6 mots-clés pertinents.",
                  available_keywords: availableKeywords,
                  rules: [
                    "existing doit être un sous-ensemble strict de available_keywords",
                    "new doit contenir des mots-clés courts en français",
                    "pas de doublons ou quasi doublons",
                  ],
                }),
              },
              ...inputImages,
            ],
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text || "Erreur OpenAI." }, { status: 500 });
    }

    const json = (await response.json()) as {
      output?: Array<{
        content?: Array<{ text?: string }>;
      }>;
      output_text?: string;
    };

    let raw = json.output_text?.trim() ?? "";
    if (!raw) {
      raw =
        json.output?.[0]?.content
          ?.map((chunk) => chunk.text ?? "")
          .join("")
          .trim() ?? "";
    }
    if (!raw) {
      return NextResponse.json(
        { error: "Réponse AI invalide. Réessaie." },
        { status: 500 },
      );
    }

    let parsed: { existing?: string[]; new?: string[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Réponse AI invalide. Réessaie." },
        { status: 500 },
      );
    }

    const availableByNormalized = new Map(
      availableKeywords.map((label) => [normalizeText(label), label]),
    );

    const existingRaw = Array.isArray(parsed.existing) ? parsed.existing : [];
    const existingNormalized = new Set<string>();
    const existingClean: string[] = [];
    for (const label of existingRaw) {
      const normalized = normalizeText(label ?? "");
      if (!normalized || existingNormalized.has(normalized)) continue;
      const canonical = availableByNormalized.get(normalized);
      if (!canonical) continue;
      existingNormalized.add(normalized);
      existingClean.push(canonical);
    }

    const newRaw = Array.isArray(parsed.new) ? parsed.new : [];
    const newNormalized = new Set<string>();
    const newClean: string[] = [];
    for (const label of newRaw) {
      const trimmed = (label ?? "").trim();
      const normalized = normalizeText(trimmed);
      if (!normalized) continue;
      if (availableByNormalized.has(normalized)) continue;
      if (existingNormalized.has(normalized)) continue;
      if (newNormalized.has(normalized)) continue;
      newNormalized.add(normalized);
      newClean.push(trimmed);
    }

    return NextResponse.json({
      suggestions: {
        existing: existingClean.slice(0, 8),
        new: newClean.slice(0, 8),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
