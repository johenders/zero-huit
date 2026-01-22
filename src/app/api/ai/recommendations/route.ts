import { NextResponse } from "next/server";
import { getSupabasePublicServerClient } from "@/lib/supabase/server";
import { loadRecommendationSettings } from "@/lib/recommendationsSettings";
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
  budget_min: number | null;
  budget_max: number | null;
  tags: Record<TaxonomyKind, string[]>;
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
    const durations = body.durations ?? [];
    const description = body.description ?? "";
    const objectives = Array.isArray(body.objectives) ? body.objectives : [];
    const audiences = Array.isArray(body.audiences) ? body.audiences : [];
    const excludeIds = Array.isArray(body.excludeIds) ? body.excludeIds : [];
    const limit = Math.max(1, Math.min(12, Number(body.limit ?? 6)));

    const supabase = getSupabasePublicServerClient();
    const [videosResult, taxonomiesResult, videoTaxonomiesResult] =
      await Promise.all([
        supabase
          .from("videos")
          .select(
            "id,title,cloudflare_uid,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,created_at",
          )
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
        budget_min: video.budget_min ?? null,
        budget_max: video.budget_max ?? null,
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

    const settings = await loadRecommendationSettings();
    const keywordLimit = Math.max(1, Math.min(8, Number(settings.keywordLimit ?? 4)));

    const keywordGroupLabels = (taxonomiesResult.data ?? [])
      .filter((t) => t.kind === "keyword" || t.kind === "style" || t.kind === "parametre")
      .map((t) => ({ label: t.label, normalized: normalize(t.label) }));

    const matchedKeywordLabels = new Set<string>();
    if (normalizedDescription.length > 8 && keywordGroupLabels.length > 0) {
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
                    "Tu choisis les mots-clés les plus pertinents à partir d'une liste. Réponds uniquement en JSON valide.",
                },
                {
                  role: "user",
                  content: JSON.stringify({
                    description,
                    available_keywords: keywordGroupLabels.map((entry) => entry.label),
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
              for (const label of (parsed.keywords ?? []).slice(0, keywordLimit)) {
                const normalized = normalize(label);
                const match = keywordGroupLabels.find(
                  (entry) => entry.normalized === normalized,
                );
                if (match) matchedKeywordLabels.add(match.label);
              }
            }
          }
        }
      } catch {
        // Fallback to basic string matching below.
      }
    }

    if (matchedKeywordLabels.size === 0) {
      for (const entry of keywordGroupLabels) {
        if (!entry.normalized) continue;
        if (paddedDescription.includes(` ${entry.normalized} `)) {
          matchedKeywordLabels.add(entry.label);
        }
      }
    }

    const activeDurationFilters = new Set(
      durations.filter((value) => value !== "incertain"),
    );
    const durationRanges: Array<{
      id: string;
      min: number;
      max: number | null;
    }> = [
      { id: "courte_video", min: 10, max: 30 },
      { id: "publicite", min: 30, max: 90 },
      { id: "film_publicitaire", min: 120, max: 240 },
      { id: "mini_documentaire", min: 300, max: null },
    ];

    const objectiveRules = settings.objectives ?? {};

    const hasOtherObjective = objectives.includes("autre");
    const allowedTypeNormalized = new Set<string>();
    const allowedObjectifNormalized = new Set<string>();
    const priorityObjectifNormalized = new Set<string>();

    if (!hasOtherObjective && objectives.length > 0) {
      for (const objective of objectives) {
        const rule = objectiveRules[objective];
        if (!rule) continue;
        for (const label of rule.types) allowedTypeNormalized.add(normalize(label));
        for (const label of rule.objectifs) {
          allowedObjectifNormalized.add(normalize(label));
        }
        for (const label of rule.priorityObjectifs) {
          priorityObjectifNormalized.add(normalize(label));
        }
      }
    }

    const audienceRemovals = settings.audiences ?? {};

    const hasOtherAudience = audiences.includes("autre");
    const removedTypeNormalized = new Set<string>();
    if (!hasOtherAudience && audiences.length > 0) {
      for (const audience of audiences) {
        const removed = audienceRemovals[audience] ?? [];
        for (const label of removed) removedTypeNormalized.add(normalize(label));
      }
    }

    const applyObjectiveFilters =
      allowedTypeNormalized.size > 0 || allowedObjectifNormalized.size > 0;

    const budgetRanges: Record<
      string,
      { min: number; max: number | null }
    > = {
      "2000-5000": { min: 2000, max: 5000 },
      "5000-10000": { min: 5000, max: 10000 },
      "10000-20000": { min: 10000, max: 20000 },
      "20000+": { min: 20000, max: null },
    };
    const budgetRange = body.budget ? budgetRanges[body.budget] ?? null : null;

    const videoById = new Map(visibleVideos.map((video) => [video.id, video]));

    const filteredEntries = availableEntries.filter((entry) => {
      if (applyObjectiveFilters) {
        const typeOk =
          allowedTypeNormalized.size === 0 ||
          entry.tags.type.some((label) =>
            allowedTypeNormalized.has(normalize(label)),
          );
        const objectifOk =
          allowedObjectifNormalized.size === 0 ||
          entry.tags.objectif.some((label) =>
            allowedObjectifNormalized.has(normalize(label)),
          );
        if (!typeOk || !objectifOk) return false;
      }

      if (removedTypeNormalized.size > 0) {
        const hasRemoved = entry.tags.type.some((label) =>
          removedTypeNormalized.has(normalize(label)),
        );
        if (hasRemoved) return false;
      }

      if (budgetRange) {
        const rawVideo = videoById.get(entry.id);
        if (!rawVideo) return false;
        const vMin = rawVideo.budget_min ?? rawVideo.budget_max ?? budgetRange.min;
        const vMax = rawVideo.budget_max ?? rawVideo.budget_min ?? budgetRange.max;
        const maxValue = budgetRange.max ?? Number.POSITIVE_INFINITY;
        const budgetOk = vMax >= budgetRange.min && vMin <= maxValue;
        if (!budgetOk) return false;
      }

      if (activeDurationFilters.size > 0) {
        const rawVideo = videoById.get(entry.id);
        if (!rawVideo) return false;
        const durationSeconds = rawVideo.duration_seconds ?? null;
        if (typeof durationSeconds !== "number") return false;
        const durationOk = durationRanges.some((range) => {
          if (!activeDurationFilters.has(range.id)) return false;
          const withinMin = durationSeconds >= range.min;
          const withinMax = range.max === null ? true : durationSeconds <= range.max;
          return withinMin && withinMax;
        });
        if (!durationOk) return false;
      }

      return true;
    });

    const scoreVideo = (entry: VideoEntry, rawVideo: Omit<Video, "taxonomies">) => {
      const keywordMatches = [
        ...entry.tags.keyword,
        ...entry.tags.style,
        ...entry.tags.parametre,
      ].filter((label) => matchedKeywordLabels.has(label)).length;

      const typeMatches =
        allowedTypeNormalized.size > 0
          ? entry.tags.type.filter((label) =>
              allowedTypeNormalized.has(normalize(label)),
            ).length
          : 0;

      const priorityObjectifMatch = entry.tags.objectif.some((label) =>
        priorityObjectifNormalized.has(normalize(label)),
      )
        ? 1
        : 0;
      const objectifMatches =
        allowedObjectifNormalized.size > 0
          ? entry.tags.objectif.filter((label) =>
              allowedObjectifNormalized.has(normalize(label)),
            ).length
          : 0;

      const durationSeconds = (rawVideo as { duration_seconds?: number | null })
        .duration_seconds;
      const durationMatch =
        typeof durationSeconds === "number" && activeDurationFilters.size > 0
          ? durationRanges.some((range) => {
              if (!activeDurationFilters.has(range.id)) return false;
              const withinMin = durationSeconds >= range.min;
              const withinMax =
                range.max === null ? true : durationSeconds <= range.max;
              return withinMin && withinMax;
            })
          : false;

      const budgetMatch =
        budgetRange && (rawVideo.budget_min !== null || rawVideo.budget_max !== null)
          ? (() => {
              const vMin = rawVideo.budget_min ?? rawVideo.budget_max ?? budgetRange.min;
              const vMax = rawVideo.budget_max ?? rawVideo.budget_min ?? budgetRange.max;
              const maxValue = budgetRange.max ?? Number.POSITIVE_INFINITY;
              return vMax >= budgetRange.min && vMin <= maxValue;
            })()
          : false;

      return {
        keywordMatches,
        typeMatches,
        priorityObjectifMatch,
        objectifMatches,
        durationMatch: durationMatch ? 1 : 0,
        budgetMatch: budgetMatch ? 1 : 0,
      };
    };

    const shouldFallback = settings.fallbackToBest ?? true;
    const candidates =
      filteredEntries.length > 0 || !shouldFallback
        ? filteredEntries
        : availableEntries;
    const scored = candidates
      .map((entry) => {
        const rawVideo = videoById.get(entry.id);
        if (!rawVideo) return null;
        return {
          entry,
          rawVideo,
          score: scoreVideo(entry, rawVideo),
        };
      })
      .filter(Boolean) as Array<{
      entry: VideoEntry;
      rawVideo: Omit<Video, "taxonomies">;
      score: {
        keywordMatches: number;
        typeMatches: number;
        priorityObjectifMatch: number;
        objectifMatches: number;
        durationMatch: number;
        budgetMatch: number;
      };
    }>;

    scored.sort((a, b) => {
      if (a.score.keywordMatches !== b.score.keywordMatches) {
        return b.score.keywordMatches - a.score.keywordMatches;
      }
      if (a.score.priorityObjectifMatch !== b.score.priorityObjectifMatch) {
        return b.score.priorityObjectifMatch - a.score.priorityObjectifMatch;
      }
      if (a.score.objectifMatches !== b.score.objectifMatches) {
        return b.score.objectifMatches - a.score.objectifMatches;
      }
      if (a.score.typeMatches !== b.score.typeMatches) {
        return b.score.typeMatches - a.score.typeMatches;
      }
      if (a.score.durationMatch !== b.score.durationMatch) {
        return b.score.durationMatch - a.score.durationMatch;
      }
      if (a.score.budgetMatch !== b.score.budgetMatch) {
        return b.score.budgetMatch - a.score.budgetMatch;
      }
      const aTime = Date.parse(a.rawVideo.created_at ?? "") || 0;
      const bTime = Date.parse(b.rawVideo.created_at ?? "") || 0;
      return bTime - aTime;
    });

    const topScored = scored.slice(0, limit);
    const selectedVideos = topScored.map(({ rawVideo }) => ({
      id: rawVideo.id,
      title: rawVideo.title,
      cloudflare_uid: rawVideo.cloudflare_uid,
      thumbnail_time_seconds: rawVideo.thumbnail_time_seconds ?? null,
      budget_min: rawVideo.budget_min ?? null,
      budget_max: rawVideo.budget_max ?? null,
    }));

    const debug =
      process.env.RECOMMENDATIONS_DEBUG === "true"
        ? {
            objectives,
            audiences,
            budget: body.budget ?? null,
            durations,
            matchedKeywordLabels: Array.from(matchedKeywordLabels),
            allowedTypes: Array.from(allowedTypeNormalized),
            allowedObjectifs: Array.from(allowedObjectifNormalized),
            priorityObjectifs: Array.from(priorityObjectifNormalized),
            removedTypes: Array.from(removedTypeNormalized),
            activeDurationFilters: Array.from(activeDurationFilters),
            keywordLimit,
            reasonsByVideoId: topScored.reduce<Record<string, string[]>>(
              (acc, { entry, rawVideo, score }) => {
                const reasons: string[] = [];
                if (score.keywordMatches > 0) reasons.push("Mots-clés");
                if (score.priorityObjectifMatch > 0)
                  reasons.push("Objectif prioritaire");
                if (score.objectifMatches > 0) reasons.push("Objectif");
                if (score.typeMatches > 0) reasons.push("Type");
                if (score.durationMatch > 0) reasons.push("Durée");
                if (score.budgetMatch > 0) reasons.push("Budget");
                if (rawVideo.is_featured) reasons.push("Favoris");
                acc[entry.id] = reasons;
                return acc;
              },
              {},
            ),
          }
        : null;

    return NextResponse.json({ videos: selectedVideos, debug });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
