import { NextResponse } from "next/server";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import type { Taxonomy, TaxonomyKind, Video } from "@/lib/types";

type Payload = {
  objectives?: string[];
  audiences?: string[];
  budget?: string | null;
  durations?: string[];
  description?: string;
  excludeIds?: string[];
  limit?: number;
};

type VideoEntry = {
  id: string;
  title: string;
  tags: Record<TaxonomyKind, string[]>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const description = body.description ?? "";
    const objectives = Array.isArray(body.objectives) ? body.objectives : [];
    const excludeIds = Array.isArray(body.excludeIds) ? body.excludeIds : [];
    const limit = Math.max(1, Math.min(12, Number(body.limit ?? 6)));

    const supabase = getSupabasePublicServerClient();
    const [videosResult, taxonomiesResult, videoTaxonomiesResult] =
      await Promise.all([
        supabase
          .from("videos")
          .select(
            "id,title,cloudflare_uid,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,featured_rating,is_showcased,is_published,created_at",
          )
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
        supabase.from("taxonomies").select("id,kind,label"),
        supabase.from("video_taxonomies").select("video_id,taxonomy_id"),
      ]);

    const anyError =
      videosResult.error ?? taxonomiesResult.error ?? videoTaxonomiesResult.error;
    if (anyError) {
      return NextResponse.json(
        { error: anyError.message ?? "Erreur Supabase." },
        { status: 500 },
      );
    }

    const taxonomyById = new Map<string, Taxonomy>();
    for (const t of (taxonomiesResult.data ?? []) as Taxonomy[]) {
      taxonomyById.set(t.id, t);
    }

    const taxonomyIdsByVideoId = new Map<string, string[]>();
    for (const row of (videoTaxonomiesResult.data ?? []) as {
      video_id: string;
      taxonomy_id: string;
    }[]) {
      const list = taxonomyIdsByVideoId.get(row.video_id) ?? [];
      list.push(row.taxonomy_id);
      taxonomyIdsByVideoId.set(row.video_id, list);
    }

    const videos = (videosResult.data ?? []) as Omit<Video, "taxonomies">[];
    const visibleVideos = videos.filter(
      (video) => !video.cloudflare_uid.startsWith("pending:"),
    );
    const entries: VideoEntry[] = visibleVideos.slice(0, 200).map((video) => {
      const tagsByKind: Record<TaxonomyKind, string[]> = {
        type: [],
        objectif: [],
        keyword: [],
        style: [],
        feel: [],
        parametre: [],
      };
      const taxonomyIds = taxonomyIdsByVideoId.get(video.id) ?? [];
      for (const id of taxonomyIds) {
        const taxonomy = taxonomyById.get(id);
        if (taxonomy) tagsByKind[taxonomy.kind].push(taxonomy.label);
      }
      return {
        id: video.id,
        title: video.title,
        tags: tagsByKind,
      };
    });

    const excluded = new Set(excludeIds);
    const availableEntries = entries.filter((entry) => !excluded.has(entry.id));

    if (availableEntries.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u00a0]/g, " ")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    const normalizedDescription = normalize(description);
    const paddedDescription = ` ${normalizedDescription} `;

    const selectedObjectiveLabels = new Set(
      objectives
        .map((objective) => {
          const taxonomy = taxonomyById.get(objective);
          return taxonomy?.kind === "objectif" ? taxonomy.label : objective;
        })
        .map((label) => normalize(label))
        .filter((label) => label && label !== "autre" && label !== "je ne sais pas"),
    );

    const keywordLimit = 6;
    const keywordsByNormalizedLabel = new Map<string, string>();
    for (const taxonomy of (taxonomiesResult.data ?? []) as Taxonomy[]) {
      if (taxonomy.kind !== "keyword") continue;
      const normalized = normalize(taxonomy.label);
      if (!normalized) continue;
      keywordsByNormalizedLabel.set(normalized, taxonomy.label);
    }
    const keywordOptions = Array.from(keywordsByNormalizedLabel.entries()).map(
      ([normalized, label]) => ({ label, normalized }),
    );

    const matchedKeywordLabels = new Set<string>();
    const keywordWeights = new Map<string, number>();
    const addAvailableKeyword = (targets: string[], weight: number) => {
      for (const target of targets.map(normalize)) {
        const exact = keywordsByNormalizedLabel.get(target);
        if (exact) {
          matchedKeywordLabels.add(exact);
          keywordWeights.set(
            normalize(exact),
            Math.max(keywordWeights.get(normalize(exact)) ?? 0, weight),
          );
          continue;
        }
        const partial = keywordOptions.find(
          (entry) =>
            entry.normalized.includes(target) || target.includes(entry.normalized),
        );
        if (partial) {
          matchedKeywordLabels.add(partial.label);
          keywordWeights.set(
            partial.normalized,
            Math.max(keywordWeights.get(partial.normalized) ?? 0, weight),
          );
        }
      }
    };

    if (/\bgolf\b/.test(paddedDescription)) {
      addAvailableKeyword(["golf"], 100);
    }
    if (
      /\b(tournoi|tournois|gala|festival|conference|congres|salon|lancement|evenement|evenementiel)\b/.test(
        paddedDescription,
      )
    ) {
      addAvailableKeyword(["événement", "événementiel"], 85);
    }
    if (/\b(renovation|renover|construction|chantier|contracteur)\b/.test(paddedDescription)) {
      addAvailableKeyword(["construction", "rénovation"], 100);
    }
    if (/\b(immobilier|maison|condo|propriete|courtier)\b/.test(paddedDescription)) {
      addAvailableKeyword(["immobilier"], 95);
    }
    if (/\b(restaurant|resto|chef|menu|cuisine|traiteur)\b/.test(paddedDescription)) {
      addAvailableKeyword(["restauration", "restaurant"], 95);
    }

    if (normalizedDescription.length > 8 && keywordOptions.length > 0) {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
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
                  name: "keyword_selection",
                  schema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      keywords: { type: "array", items: { type: "string" } },
                    },
                    required: ["keywords"],
                  },
                },
              },
              input: [
                {
                  role: "system",
                  content:
                    "Tu choisis les mots-clés de portfolio les plus pertinents à partir d'une liste. Inclus les mots-clés qui correspondent directement ou indirectement au secteur, au contexte ou au type d'activité décrit. Réponds uniquement en JSON valide.",
                },
                {
                  role: "user",
                  content: JSON.stringify({
                    description,
                    available_keywords: keywordOptions.map((entry) => entry.label),
                    rules: [`Choisis au plus ${keywordLimit} mots-clés existants.`],
                  }),
                },
              ],
              temperature: 0.2,
            }),
          });

          if (response.ok) {
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
            if (raw) {
              const parsed = JSON.parse(raw) as { keywords?: string[] };
              for (const [index, label] of (parsed.keywords ?? [])
                .slice(0, keywordLimit)
                .entries()) {
                const normalized = normalize(label);
                const match = keywordOptions.find(
                  (entry) => entry.normalized === normalized,
                );
                if (match) {
                  const weight = Math.max(25, 80 - index * 10);
                  matchedKeywordLabels.add(match.label);
                  keywordWeights.set(
                    match.normalized,
                    Math.max(keywordWeights.get(match.normalized) ?? 0, weight),
                  );
                }
              }
            }
          }
        }
      } catch {
        // Fallback to basic string matching below.
      }
    }

    if (matchedKeywordLabels.size === 0) {
      for (const entry of keywordOptions) {
        if (!entry.normalized) continue;
        if (paddedDescription.includes(` ${entry.normalized} `)) {
          matchedKeywordLabels.add(entry.label);
          keywordWeights.set(
            entry.normalized,
            Math.max(keywordWeights.get(entry.normalized) ?? 0, 70),
          );
        }
      }
    }

    const videoById = new Map(visibleVideos.map((video) => [video.id, video]));
    const matchedKeywordNormalizedLabels = new Set(
      Array.from(matchedKeywordLabels).map((label) => normalize(label)),
    );
    const scored = availableEntries
      .map((entry) => {
        const rawVideo = videoById.get(entry.id);
        if (!rawVideo) return null;
        return {
          entry,
          rawVideo,
          matchedKeywords: entry.tags.keyword.filter((label) =>
            matchedKeywordNormalizedLabels.has(normalize(label)),
          ),
          keywordScore: entry.tags.keyword.reduce(
            (score, label) => score + (keywordWeights.get(normalize(label)) ?? 0),
            0,
          ),
          objectiveMatches:
            selectedObjectiveLabels.size === 0
              ? 0
              : entry.tags.objectif.filter((label) =>
                  selectedObjectiveLabels.has(normalize(label)),
                ).length,
        };
      })
      .filter(Boolean) as Array<{
      entry: VideoEntry;
      rawVideo: Omit<Video, "taxonomies">;
      matchedKeywords: string[];
      keywordScore: number;
      objectiveMatches: number;
    }>;
    const hasSelectedKeywords = matchedKeywordNormalizedLabels.size > 0;

    const sortByKeywordsThenRecent = (items: typeof scored) =>
      [...items].sort((a, b) => {
        if (a.keywordScore !== b.keywordScore) {
          return b.keywordScore - a.keywordScore;
        }
        if (a.matchedKeywords.length !== b.matchedKeywords.length) {
          return b.matchedKeywords.length - a.matchedKeywords.length;
        }
        if (a.objectiveMatches !== b.objectiveMatches) {
          return b.objectiveMatches - a.objectiveMatches;
        }
        const aTime = Date.parse(a.rawVideo.created_at ?? "") || 0;
        const bTime = Date.parse(b.rawVideo.created_at ?? "") || 0;
        return bTime - aTime;
      });
    const sortByRecent = (items: typeof scored) =>
      [...items].sort((a, b) => {
        const aTime = Date.parse(a.rawVideo.created_at ?? "") || 0;
        const bTime = Date.parse(b.rawVideo.created_at ?? "") || 0;
        return bTime - aTime;
      });

    const allKeywordMatches = sortByKeywordsThenRecent(
      scored.filter(
        (item) =>
          hasSelectedKeywords &&
          item.matchedKeywords.length === matchedKeywordNormalizedLabels.size,
      ),
    );
    const partialKeywordMatches = sortByKeywordsThenRecent(
      scored.filter(
        (item) =>
          item.matchedKeywords.length > 0 &&
          item.matchedKeywords.length < matchedKeywordNormalizedLabels.size,
      ),
    );
    const objectiveMatches = sortByRecent(
      scored.filter(
        (item) =>
          item.matchedKeywords.length === 0 &&
          selectedObjectiveLabels.size > 0 &&
          item.objectiveMatches > 0,
      ),
    );
    const favoriteMatches = sortByRecent(
      scored.filter((item) => item.rawVideo.is_featured),
    );
    const otherMatches = sortByRecent(scored);

    const selectedIds = new Set<string>();
    const topScored: typeof scored = [];
    const appendCandidates = (items: typeof scored) => {
      for (const item of items) {
        if (topScored.length >= limit) return;
        if (selectedIds.has(item.entry.id)) continue;
        selectedIds.add(item.entry.id);
        topScored.push(item);
      }
    };

    appendCandidates(allKeywordMatches);
    appendCandidates(partialKeywordMatches);
    appendCandidates(objectiveMatches);
    appendCandidates(favoriteMatches);
    appendCandidates(otherMatches);

    topScored.sort((a, b) => {
      const tier = (item: (typeof topScored)[number]) => {
        if (
          hasSelectedKeywords &&
          item.matchedKeywords.length === matchedKeywordNormalizedLabels.size
        ) {
          return 0;
        }
        if (item.matchedKeywords.length > 0) {
          return 1;
        }
        if (selectedObjectiveLabels.size > 0 && item.objectiveMatches > 0) {
          return 2;
        }
        if (item.rawVideo.is_featured) return 3;
        return 4;
      };
      const tierDiff = tier(a) - tier(b);
      if (tierDiff !== 0) return tierDiff;
      if (a.keywordScore !== b.keywordScore) {
        return b.keywordScore - a.keywordScore;
      }
      if (a.matchedKeywords.length !== b.matchedKeywords.length) {
        return b.matchedKeywords.length - a.matchedKeywords.length;
      }
      const aTime = Date.parse(a.rawVideo.created_at ?? "") || 0;
      const bTime = Date.parse(b.rawVideo.created_at ?? "") || 0;
      return bTime - aTime;
    });
    const selectedVideos = topScored.map(({ rawVideo }) => ({
      id: rawVideo.id,
      title: rawVideo.title,
      cloudflare_uid: rawVideo.cloudflare_uid,
      thumbnail_time_seconds: rawVideo.thumbnail_time_seconds ?? null,
      budget_min: rawVideo.budget_min ?? null,
      budget_max: rawVideo.budget_max ?? null,
    }));
    const reasonsByVideoId = topScored.reduce<Record<string, string[]>>(
      (acc, { entry, rawVideo, matchedKeywords }) => {
        const reasons: string[] = [];
        const matchedObjectives = entry.tags.objectif.filter((label) =>
          selectedObjectiveLabels.has(normalize(label)),
        );
        if (matchedKeywords.length > 0) {
          reasons.push(`Mots clés: ${Array.from(new Set(matchedKeywords)).join(", ")}`);
        }
        if (matchedObjectives.length > 0) {
          reasons.push(`Objectifs: ${Array.from(new Set(matchedObjectives)).join(", ")}`);
        }
        if (reasons.length === 0 && rawVideo.is_featured) {
          reasons.push("Favoris");
        }
        acc[entry.id] = reasons;
        return acc;
      },
      {},
    );

    const debug =
      process.env.RECOMMENDATIONS_DEBUG === "true"
        ? {
            objectives,
            matchedKeywordLabels: Array.from(matchedKeywordLabels),
            allowedObjectifs: Array.from(selectedObjectiveLabels),
            keywordLimit,
            reasonsByVideoId,
          }
        : null;

    return NextResponse.json({
      videos: selectedVideos,
      matchedKeywordLabels: Array.from(matchedKeywordLabels),
      reasonsByVideoId,
      debug,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
