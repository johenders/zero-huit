import { NextResponse } from "next/server";
import type { TaxonomyKind } from "@/lib/types";

type Payload = {
  prompt?: string;
  taxonomies?: Record<TaxonomyKind, string[]>;
};

const taxonomyKinds: TaxonomyKind[] = [
  "type",
  "objectif",
  "keyword",
  "style",
  "feel",
  "parametre",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const prompt = body.prompt?.trim();
    const taxonomies = body.taxonomies;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt manquant." }, { status: 400 });
    }
    if (!taxonomies) {
      return NextResponse.json({ error: "Taxonomies manquantes." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquant côté serveur." },
        { status: 500 },
      );
    }

    const system = [
      "Tu es un assistant qui mappe une description de projet vidéo vers des tags existants.",
      "Réponds uniquement en JSON valide.",
      "Respecte strictement les tags fournis.",
      "Si rien ne correspond pour une catégorie, renvoie un tableau vide.",
    ].join(" ");

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
            name: "tag_selection",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { type: "array", items: { type: "string" } },
                objectif: { type: "array", items: { type: "string" } },
                keyword: { type: "array", items: { type: "string" } },
                style: { type: "array", items: { type: "string" } },
                feel: { type: "array", items: { type: "string" } },
                parametre: { type: "array", items: { type: "string" } },
              },
              required: [
                "type",
                "objectif",
                "keyword",
                "style",
                "feel",
                "parametre",
              ],
            },
          },
        },
        input: [
          { role: "system", content: system },
          {
            role: "user",
            content: JSON.stringify({
              description: prompt,
              available_tags: taxonomies,
              output_format: {
                type: "string[]",
                objectif: "string[]",
                keyword: "string[]",
                style: "string[]",
                feel: "string[]",
                parametre: "string[]",
              },
            }),
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

    let parsed: Partial<Record<TaxonomyKind, string[]>> = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Réponse AI invalide. Réessaie." },
        { status: 500 },
      );
    }

    const selection: Partial<Record<TaxonomyKind, string[]>> = {};
    for (const kind of taxonomyKinds) {
      const values = Array.isArray(parsed[kind]) ? parsed[kind] : [];
      selection[kind] = values.slice(0, 12);
    }

    return NextResponse.json({ selection });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
