"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { budgetLevels, formatCad } from "@/lib/budget";
import { cloudflarePreviewIframeSrc } from "@/lib/cloudflare";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";
import bg from "../../assets/bg/bg_portfolio.jpg";
import type {
  Taxonomy,
  TaxonomyKind,
  Video,
} from "@/lib/types";
import { AppFooter } from "./AppFooter";
import { VideoCard } from "./VideoCard";
import { VideoModal } from "./VideoModal";

type Props = {
  initialVideos: Video[];
  taxonomies: Taxonomy[];
};

type Filters = {
  selected: Record<TaxonomyKind, Set<string>>;
  budgetMinIndex: number;
  budgetMaxIndex: number;
  durationMinIndex: number;
  durationMaxIndex: number;
};

const taxonomyKinds: { kind: TaxonomyKind; label: string }[] = [
  { kind: "type", label: "Type de vidéo" },
  { kind: "objectif", label: "Objectifs" },
  { kind: "keyword", label: "Mots clés" },
  { kind: "style", label: "Style" },
  { kind: "feel", label: "Feel" },
  { kind: "parametre", label: "Paramètres" },
];

const keywordGroupKinds: TaxonomyKind[] = ["keyword", "style", "parametre"];

type FilterFieldDefinition = {
  id: string;
  kinds: TaxonomyKind[];
  labelKey: string;
  placeholderKey: string;
};

const filterFields: FilterFieldDefinition[] = [
  {
    id: "type",
    kinds: ["type"],
    labelKey: "portfolio.filters.type",
    placeholderKey: "portfolio.filters.type.placeholder",
  },
  {
    id: "objectif",
    kinds: ["objectif"],
    labelKey: "portfolio.filters.objectif",
    placeholderKey: "portfolio.filters.objectif.placeholder",
  },
  {
    id: "feel",
    kinds: ["feel"],
    labelKey: "portfolio.filters.feel",
    placeholderKey: "portfolio.filters.feel.placeholder",
  },
  {
    id: "keywords",
    kinds: keywordGroupKinds,
    labelKey: "portfolio.filters.keywords",
    placeholderKey: "portfolio.filters.keywords.placeholder",
  },
];

function newDefaultFilters(): Filters {
  return {
    selected: {
      type: new Set(),
      objectif: new Set(),
      keyword: new Set(),
      style: new Set(),
      feel: new Set(),
      parametre: new Set(),
    },
    budgetMinIndex: 0,
    budgetMaxIndex: budgetLevels.length - 1,
    durationMinIndex: 0,
    durationMaxIndex: durationLevels.length - 1,
  };
}

function toggleArrayValue<T extends string>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

const INITIAL_BATCH_SIZE = 20;
const BATCH_SIZE = 20;
const durationLevels = [0, 30, 60, 90, 120, 180, 240, 300, 420, 600, 900];

function formatDurationSeconds(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function mergeTaxonomiesByKinds(
  groupedTaxonomies: Record<TaxonomyKind, Taxonomy[]>,
  kinds: TaxonomyKind[],
) {
  const merged = kinds.flatMap((kind) => groupedTaxonomies[kind]);
  return merged.sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

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

function parseBudgetValues(prompt: string) {
  const values: number[] = [];
  const regex = /(\d[\d\s]*(?:[.,]\d+)?)(?:\s*([kK]))?/g;
  for (const match of prompt.matchAll(regex)) {
    const raw = match[1] ?? "";
    const hasK = Boolean(match[2]);
    const cleaned = raw.replace(/\s+/g, "").replace(",", ".");
    const parsed = Number.parseFloat(cleaned);
    if (!Number.isFinite(parsed)) continue;
    const value = hasK ? parsed * 1000 : parsed;
    if (value < 1000) continue;
    values.push(value);
  }
  return values;
}

export function PortfolioApp({ initialVideos, taxonomies }: Props) {
  const { locale, t } = useI18n();

  const [filters, setFilters] = useState<Filters>(() => newDefaultFilters());
  const [videos] = useState<Video[]>(initialVideos);
  const [activeBudgetHandle, setActiveBudgetHandle] = useState<"min" | "max" | null>(
    null,
  );
  const budgetTrackRef = useRef<HTMLDivElement>(null);
  const [activeDurationHandle, setActiveDurationHandle] = useState<
    "min" | "max" | null
  >(null);
  const durationTrackRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const [activeFilterPanel, setActiveFilterPanel] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    video: Video | null;
  }>({ open: false, video: null });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error">("idle");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const aiInputRef = useRef<HTMLInputElement | null>(null);

  const filterLabelToneById: Record<string, string> = {
    type: "text-indigo-200",
    objectif: "text-blue-200",
    feel: "text-purple-200",
    keywords: "text-emerald-200",
    budget: "text-rose-200",
    duration: "text-yellow-200",
  };

  const optionToneByKind: Record<TaxonomyKind, string> = {
    type: "border-indigo-400/40 bg-indigo-500/20 text-indigo-100",
    objectif: "border-blue-400/40 bg-blue-500/20 text-blue-100",
    keyword: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
    style: "border-rose-400/40 bg-rose-500/20 text-rose-100",
    feel: "border-purple-400/40 bg-purple-500/20 text-purple-100",
    parametre: "border-yellow-400/40 bg-yellow-500/20 text-yellow-100",
  };

  const getOptionTone = (kind: TaxonomyKind) =>
    optionToneByKind[kind] ??
    "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10";

  const toggleTaxonomy = useCallback((item: Taxonomy) => {
    const { kind, id } = item;
    setFilters((prev) => {
      const next = newDefaultFilters();
      next.budgetMinIndex = prev.budgetMinIndex;
      next.budgetMaxIndex = prev.budgetMaxIndex;
      next.durationMinIndex = prev.durationMinIndex;
      next.durationMaxIndex = prev.durationMaxIndex;
      for (const k of Object.keys(prev.selected) as TaxonomyKind[]) {
        next.selected[k] = new Set(prev.selected[k]);
      }
      if (next.selected[kind].has(id)) {
        next.selected[kind].delete(id);
      } else {
        next.selected[kind].add(id);
      }
      return next;
    });
  }, []);

  const togglePanel = useCallback((id: string) => {
    setActiveFilterPanel((prev) => (prev === id ? null : id));
  }, []);

  const groupedTaxonomies = useMemo(() => {
    const groups: Record<TaxonomyKind, Taxonomy[]> = {
      type: [],
      objectif: [],
      keyword: [],
      style: [],
      feel: [],
      parametre: [],
    };
    for (const t of taxonomies) groups[t.kind].push(t);
    for (const kind of Object.keys(groups) as TaxonomyKind[]) {
      groups[kind].sort((a, b) => a.label.localeCompare(b.label, "fr"));
    }
    return groups;
  }, [taxonomies]);

  const taxonomyByNormalizedLabel = useMemo(() => {
    const map = new Map<string, Taxonomy>();
    for (const t of taxonomies) {
      map.set(normalizeText(t.label), t);
    }
    return map;
  }, [taxonomies]);

  const taxonomyLabelsByKind = useMemo(() => {
    const data: Record<TaxonomyKind, string[]> = {
      type: [],
      objectif: [],
      keyword: [],
      style: [],
      feel: [],
      parametre: [],
    };
    for (const kind of Object.keys(groupedTaxonomies) as TaxonomyKind[]) {
      data[kind] = groupedTaxonomies[kind].map((t) => t.label);
    }
    return data;
  }, [groupedTaxonomies]);

  const applyAiSelection = useCallback(
    (selection: Partial<Record<TaxonomyKind, string[]>>) => {
      setFilters((prev) => {
        const next = newDefaultFilters();
        next.budgetMinIndex = prev.budgetMinIndex;
        next.budgetMaxIndex = prev.budgetMaxIndex;
        next.durationMinIndex = prev.durationMinIndex;
        next.durationMaxIndex = prev.durationMaxIndex;
        for (const kind of Object.keys(next.selected) as TaxonomyKind[]) {
          const labels = selection[kind] ?? [];
          for (const label of labels) {
            const taxonomy = taxonomyByNormalizedLabel.get(normalizeText(label));
            if (taxonomy) next.selected[kind].add(taxonomy.id);
          }
        }
        return next;
      });
    },
    [taxonomyByNormalizedLabel],
  );

  const applyBudgetFromPrompt = useCallback((prompt: string) => {
    const values = parseBudgetValues(prompt);
    if (values.length === 0) return;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const closestIndex = (value: number) => {
      let bestIndex = 0;
      let bestDelta = Math.abs(budgetLevels[0] - value);
      for (let i = 1; i < budgetLevels.length; i += 1) {
        const delta = Math.abs(budgetLevels[i] - value);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestIndex = i;
        }
      }
      return bestIndex;
    };
    const minIndexRaw = closestIndex(minValue);
    const maxIndexRaw = closestIndex(maxValue);
    const minIndex = Math.max(0, minIndexRaw - 1);
    const maxIndex = Math.min(budgetLevels.length - 1, maxIndexRaw);
    setFilters((prev) => ({
      ...prev,
      budgetMinIndex: Math.min(minIndex, maxIndex),
      budgetMaxIndex: Math.max(minIndex, maxIndex),
    }));
  }, []);

  async function handleAiFilter() {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      setAiStatus("error");
      setAiMessage("Décris ton projet pour lancer l'analyse.");
      return;
    }
    setAiStatus("loading");
    setAiMessage(null);
    try {
      const response = await fetch("/api/ai/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          taxonomies: taxonomyLabelsByKind,
        }),
      });
      const json = (await response.json()) as
        | { selection: Partial<Record<TaxonomyKind, string[]>> }
        | { error: string };
      if (!response.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Erreur AI");
      }
      applyAiSelection(json.selection);
      applyBudgetFromPrompt(prompt);
      setAiStatus("idle");
      setAiMessage("Filtres appliqués.");
    } catch (e) {
      setAiStatus("error");
      setAiMessage(e instanceof Error ? e.message : "Erreur AI");
    }
  }

  useEffect(() => {
    if (!aiSearchOpen) return;
    aiInputRef.current?.focus();
  }, [aiSearchOpen]);

  const headerOffset = 120;

  const rankedVideos = useMemo(() => {
    const fallbackPriority: Array<
      | { kind: TaxonomyKind }
      | { kind: "budget" }
      | { kind: "duration" }
    > = [
      { kind: "keyword" },
      { kind: "type" },
      { kind: "budget" },
      { kind: "duration" },
      { kind: "objectif" },
      { kind: "feel" },
      { kind: "style" },
      { kind: "parametre" },
    ];
    const minBudget = budgetLevels[filters.budgetMinIndex];
    const maxBudget = budgetLevels[filters.budgetMaxIndex];
    const wantsBudget =
      filters.budgetMinIndex !== 0 ||
      filters.budgetMaxIndex !== budgetLevels.length - 1;
    const minDuration = durationLevels[filters.durationMinIndex];
    const maxDuration = durationLevels[filters.durationMaxIndex];
    const wantsDuration =
      filters.durationMinIndex !== 0 ||
      filters.durationMaxIndex !== durationLevels.length - 1;
    const wantsAnyTaxonomy = (Object.keys(filters.selected) as TaxonomyKind[]).some(
      (kind) => filters.selected[kind].size > 0,
    );
    const hasActiveFilters = wantsBudget || wantsDuration || wantsAnyTaxonomy;

    const scored = videos.map((video, index) => {
      const matchesByKind: Record<TaxonomyKind, number> = {
        type: 0,
        objectif: 0,
        keyword: 0,
        style: 0,
        feel: 0,
        parametre: 0,
      };
      for (const t of video.taxonomies) {
        const wanted = filters.selected[t.kind];
        if (wanted.size > 0 && wanted.has(t.id)) matchesByKind[t.kind] += 1;
      }

      let budgetMatch = 0;
      if (wantsBudget) {
        const vMin = video.budget_min ?? null;
        const vMax = video.budget_max ?? null;
        if (vMin !== null || vMax !== null) {
          const effectiveMin = vMin ?? vMax ?? minBudget;
          const effectiveMax = vMax ?? vMin ?? maxBudget;
          if (effectiveMax >= minBudget && effectiveMin <= maxBudget) {
            budgetMatch = 1;
          }
        }
      }

      let durationMatch = 0;
      if (wantsDuration) {
        const duration = video.duration_seconds ?? null;
        if (duration !== null) {
          if (duration >= minDuration && duration <= maxDuration) {
            durationMatch = 1;
          }
        }
      }

      const fullTaxonomyMatch = (Object.keys(filters.selected) as TaxonomyKind[]).every(
        (kind) => {
          const wanted = filters.selected[kind];
          if (wanted.size === 0) return true;
          return matchesByKind[kind] > 0;
        },
      );
      const fullBudgetMatch = !wantsBudget || budgetMatch === 1;
      const fullDurationMatch = !wantsDuration || durationMatch === 1;
      const isFullMatch = fullTaxonomyMatch && fullBudgetMatch && fullDurationMatch;

      const fallbackRank = fallbackPriority.findIndex((item) => {
        if (item.kind === "budget") return wantsBudget && budgetMatch === 1;
        if (item.kind === "duration") return wantsDuration && durationMatch === 1;
        return filters.selected[item.kind].size > 0 && matchesByKind[item.kind] > 0;
      });

      return {
        video,
        matchesByKind,
        budgetMatch,
        durationMatch,
        isFullMatch,
        fallbackRank: fallbackRank === -1 ? fallbackPriority.length : fallbackRank,
        index,
      };
    });

    const fullMatches = scored
      .filter((item) => item.isFullMatch || !hasActiveFilters)
      .sort((a, b) => {
        const order: TaxonomyKind[] = [
          "keyword",
          "type",
          "objectif",
          "feel",
          "style",
          "parametre",
        ];
        for (const kind of order) {
          if (a.matchesByKind[kind] !== b.matchesByKind[kind]) {
            return b.matchesByKind[kind] - a.matchesByKind[kind];
          }
        }
        if (a.budgetMatch !== b.budgetMatch) return b.budgetMatch - a.budgetMatch;
        if (a.durationMatch !== b.durationMatch) return b.durationMatch - a.durationMatch;
        return a.index - b.index;
      });

    const fallbackMatches = scored
      .filter((item) => hasActiveFilters && !item.isFullMatch)
      .sort((a, b) => {
        if (a.fallbackRank !== b.fallbackRank) {
          return a.fallbackRank - b.fallbackRank;
        }
        const order: TaxonomyKind[] = [
          "keyword",
          "type",
          "objectif",
          "feel",
          "style",
          "parametre",
        ];
        for (const kind of order) {
          if (a.matchesByKind[kind] !== b.matchesByKind[kind]) {
            return b.matchesByKind[kind] - a.matchesByKind[kind];
          }
        }
        if (a.budgetMatch !== b.budgetMatch) return b.budgetMatch - a.budgetMatch;
        if (a.durationMatch !== b.durationMatch) return b.durationMatch - a.durationMatch;
        return a.index - b.index;
      });

    const ordered = [...fullMatches, ...fallbackMatches].map((item) => item.video);

    return {
      videos: ordered,
      fullMatchCount: fullMatches.length,
      hasActiveFilters,
    };
  }, [filters, videos]);

  const videoById = useMemo(() => {
    const map = new Map<string, Video>();
    for (const video of videos) map.set(video.id, video);
    return map;
  }, [videos]);

  const preloadedVideos = useMemo(
    () => rankedVideos.videos.slice(0, INITIAL_BATCH_SIZE),
    [rankedVideos],
  );

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [filters]);

  const budgetMinPercent =
    (filters.budgetMinIndex / (budgetLevels.length - 1)) * 100;
  const budgetMaxPercent =
    (filters.budgetMaxIndex / (budgetLevels.length - 1)) * 100;
  const durationMinPercent =
    (filters.durationMinIndex / (durationLevels.length - 1)) * 100;
  const durationMaxPercent =
    (filters.durationMaxIndex / (durationLevels.length - 1)) * 100;

  const clampBudgetIndex = useCallback(
    (value: number) => {
      const maxIndex = budgetLevels.length - 1;
      return Math.min(maxIndex, Math.max(0, value));
    },
    [budgetLevels.length],
  );

  const clampDurationIndex = useCallback((value: number) => {
    const maxIndex = durationLevels.length - 1;
    return Math.min(maxIndex, Math.max(0, value));
  }, []);

  const getBudgetIndexFromClientX = useCallback(
    (clientX: number) => {
      const track = budgetTrackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      const ratio = (clientX - rect.left) / rect.width;
      const index = Math.round(ratio * (budgetLevels.length - 1));
      return clampBudgetIndex(index);
    },
    [budgetLevels.length, clampBudgetIndex],
  );

  const getDurationIndexFromClientX = useCallback(
    (clientX: number) => {
      const track = durationTrackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      const ratio = (clientX - rect.left) / rect.width;
      const index = Math.round(ratio * (durationLevels.length - 1));
      return clampDurationIndex(index);
    },
    [clampDurationIndex],
  );

  const updateBudgetFromPointer = useCallback(
    (clientX: number, handle: "min" | "max") => {
      const index = getBudgetIndexFromClientX(clientX);
      setFilters((prev) => {
        if (handle === "min") {
          return {
            ...prev,
            budgetMinIndex: Math.min(index, prev.budgetMaxIndex),
          };
        }
        return {
          ...prev,
          budgetMaxIndex: Math.max(index, prev.budgetMinIndex),
        };
      });
    },
    [getBudgetIndexFromClientX],
  );

  const updateDurationFromPointer = useCallback(
    (clientX: number, handle: "min" | "max") => {
      const index = getDurationIndexFromClientX(clientX);
      setFilters((prev) => {
        if (handle === "min") {
          return {
            ...prev,
            durationMinIndex: Math.min(index, prev.durationMaxIndex),
          };
        }
        return {
          ...prev,
          durationMaxIndex: Math.max(index, prev.durationMinIndex),
        };
      });
    },
    [getDurationIndexFromClientX],
  );

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!activeBudgetHandle) return;
      updateBudgetFromPointer(event.clientX, activeBudgetHandle);
    }
    function handlePointerUp() {
      setActiveBudgetHandle(null);
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeBudgetHandle, updateBudgetFromPointer]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!activeDurationHandle) return;
      updateDurationFromPointer(event.clientX, activeDurationHandle);
    }
    function handlePointerUp() {
      setActiveDurationHandle(null);
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeDurationHandle, updateDurationFromPointer]);


  return (
    <div className="min-h-screen text-zinc-100">
      <section
        className="relative min-h-[49vh] w-full overflow-hidden"
        style={{ marginTop: `-${headerOffset}px`, paddingTop: `${headerOffset}px` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${bg.src})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/55" />
        <div className="relative mx-auto flex min-h-[49vh] max-w-7xl flex-col justify-center gap-10 px-6 py-20 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.45em] text-zinc-300">
              {t("portfolio.header.kicker")}
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {t("portfolio.header.title")}{" "}
              <span className="bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] bg-clip-text text-transparent">
                {t("portfolio.header.title.highlight")}
              </span>
              .
            </h1>
          </div>
          <div className="max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
            <p>{t("portfolio.header.body")}</p>
            <Link
              href={withLocaleHref(locale, "/services")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-300"
            >
              {t("portfolio.header.cta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-none space-y-4 p-4 lg:p-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="mb-0 pl-1 text-base font-semibold text-zinc-300">
            {t("portfolio.filters.title")}{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              {t("portfolio.filters.title.highlight")}
            </span>
            .
          </div>
          <div className="mt-3 sm:hidden">
            <button
              type="button"
              onClick={() => {
                setActiveFilterPanel(null);
                setAiSearchOpen(false);
                setMobileFiltersOpen((prev) => !prev);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200"
              aria-expanded={mobileFiltersOpen}
            >
              <span>Filtres</span>
              <span
                className={`text-lg text-zinc-400 transition-transform ${
                  mobileFiltersOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
          </div>
          <div
            className={`mt-3 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:flex-wrap sm:items-center ${
              mobileFiltersOpen ? "block" : "hidden sm:flex"
            }`}
          >
            <div className="flex flex-wrap gap-3 sm:contents">
              {filterFields.map((field) => {
                const selectedCount = field.kinds.reduce(
                  (count, kind) => count + filters.selected[kind].size,
                  0,
                );
                const isActive = activeFilterPanel === field.id;
                const labelTone = filterLabelToneById[field.id] ?? "";
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => togglePanel(field.id)}
                    className={`relative flex items-center gap-2 px-1 py-1 text-sm font-medium transition ${
                      isActive ? "text-white" : "text-zinc-300 hover:text-white"
                    }`}
                    aria-expanded={isActive}
                  >
                    <span className={labelTone}>{t(field.labelKey)}</span>
                    {selectedCount > 0 ? (
                      <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 shadow">
                        {selectedCount}
                      </span>
                    ) : null}
                    <span
                      className={`text-lg text-zinc-400 transition-transform ${
                        isActive ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => togglePanel("budget")}
                className={`relative flex items-center gap-2 px-1 py-1 text-sm font-medium transition ${
                  activeFilterPanel === "budget"
                    ? "text-white"
                    : "text-zinc-300 hover:text-white"
                }`}
                aria-expanded={activeFilterPanel === "budget"}
              >
                <span className={filterLabelToneById.budget}>
                  {t("portfolio.filters.budget")}
                </span>
                {filters.budgetMinIndex !== 0 ||
                filters.budgetMaxIndex !== budgetLevels.length - 1 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 shadow">
                    1
                  </span>
                ) : null}
                <span
                  className={`text-lg text-zinc-400 transition-transform ${
                    activeFilterPanel === "budget" ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
              <button
                type="button"
                onClick={() => togglePanel("duration")}
                className={`relative flex items-center gap-2 px-1 py-1 text-sm font-medium transition ${
                  activeFilterPanel === "duration"
                    ? "text-white"
                    : "text-zinc-300 hover:text-white"
                }`}
                aria-expanded={activeFilterPanel === "duration"}
              >
                <span className={filterLabelToneById.duration}>
                  {t("portfolio.filters.duration")}
                </span>
                {filters.durationMinIndex !== 0 ||
                filters.durationMaxIndex !== durationLevels.length - 1 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 shadow">
                    1
                  </span>
                ) : null}
                <span
                  className={`text-lg text-zinc-400 transition-transform ${
                    activeFilterPanel === "duration" ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:ml-auto sm:flex-nowrap">
              <button
                className="px-1 py-2 text-xs font-semibold text-zinc-300 hover:text-white sm:self-center"
                type="button"
                onClick={() => setFilters(newDefaultFilters())}
              >
                {t("portfolio.filters.reset")}
              </button>
              <button
                className={`relative inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold leading-none transition sm:w-auto ${
                  aiSearchOpen
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                    : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
                }`}
                type="button"
                onClick={() => {
                  setActiveFilterPanel(null);
                  setAiSearchOpen((prev) => !prev);
                }}
                aria-expanded={aiSearchOpen}
              >
                {t("portfolio.filters.ai")}
                <span className="rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-900">
                  AI
                </span>
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              aiSearchOpen ? "mt-4 max-h-48 opacity-100" : "max-h-0 opacity-0"
            } ${mobileFiltersOpen ? "" : "sm:block hidden"}`}
          >
            <div className={aiSearchOpen ? "pointer-events-auto" : "pointer-events-none"}>
              <form
                className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleAiFilter();
                }}
              >
                <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-base text-zinc-100">
                  <svg
                    aria-hidden
                    className="h-5 w-5 text-zinc-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={aiInputRef}
                    className="w-full bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder={t("portfolio.filters.ai.placeholder")}
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                  />
                </div>
                <button
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  type="submit"
                  disabled={aiStatus === "loading"}
                >
                  {aiStatus === "loading"
                    ? t("portfolio.filters.ai.loading")
                    : t("portfolio.filters.ai.apply")}
                </button>
                {aiPrompt ? (
                  <button
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                    type="button"
                    onClick={() => {
                      setAiPrompt("");
                      setAiStatus("idle");
                      setAiMessage(null);
                    }}
                  >
                    {t("portfolio.filters.ai.clear")}
                  </button>
                ) : null}
              </form>
              <div className="mt-2 text-xs text-zinc-400">
                Ex: Vidéo promo pour un resto | Captation d&apos;événement sportif | Capsule
                RH pour une équipe tech
              </div>
              {aiMessage ? (
                <div
                  className={`mt-2 text-xs ${
                    aiStatus === "error" ? "text-red-400" : "text-zinc-300"
                  }`}
                >
                  {aiMessage}
                </div>
              ) : null}
            </div>
          </div>

          {filterFields.map((field) => {
              const isActive = activeFilterPanel === field.id;
              const options = mergeTaxonomiesByKinds(groupedTaxonomies, field.kinds);
              return (
                <div
                  key={field.id}
                  className={`overflow-hidden transition-all duration-200 ease-out ${
                    isActive ? "mt-4 max-h-72 opacity-100" : "max-h-0 opacity-0"
                  } ${mobileFiltersOpen ? "" : "sm:block hidden"}`}
                >
                  <div className={isActive ? "pointer-events-auto" : "pointer-events-none"}>
                    {options.length === 0 ? (
                      <div className="text-sm text-zinc-400">Aucune option.</div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {options.map((option) => {
                          const selected = filters.selected[option.kind].has(option.id);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => toggleTaxonomy(option)}
                              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                                selected
                                  ? getOptionTone(option.kind)
                                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              activeFilterPanel === "budget" ? "mt-4 max-h-40 opacity-100" : "max-h-0 opacity-0"
            } ${mobileFiltersOpen ? "" : "sm:block hidden"}`}
          >
            <div
              className={`w-full max-w-full px-2 sm:max-w-[25%] ${
                activeFilterPanel === "budget" ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <div className="text-sm text-zinc-200 whitespace-nowrap">
                {formatCad(budgetLevels[filters.budgetMinIndex])} –{" "}
                {formatCad(budgetLevels[filters.budgetMaxIndex])}
              </div>
              <div
                ref={budgetTrackRef}
                className="relative mt-3 h-7"
                onPointerDown={(event) => {
                  const nextIndex = getBudgetIndexFromClientX(event.clientX);
                  const distToMin = Math.abs(nextIndex - filters.budgetMinIndex);
                  const distToMax = Math.abs(nextIndex - filters.budgetMaxIndex);
                  const handle = distToMin <= distToMax ? "min" : "max";
                  setActiveBudgetHandle(handle);
                  updateBudgetFromPointer(event.clientX, handle);
                }}
              >
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
                <div
                  className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{
                    left: `${budgetMinPercent}%`,
                    width: `${Math.max(0, budgetMaxPercent - budgetMinPercent)}%`,
                  }}
                />
                <button
                  type="button"
                  aria-label="Budget minimum"
                  className="absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/70 bg-emerald-400 shadow"
                  style={{ left: `${budgetMinPercent}%` }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveBudgetHandle("min");
                    updateBudgetFromPointer(event.clientX, "min");
                  }}
                />
                <button
                  type="button"
                  aria-label="Budget maximum"
                  className="absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/70 bg-cyan-400 shadow"
                  style={{ left: `${budgetMaxPercent}%` }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveBudgetHandle("max");
                    updateBudgetFromPointer(event.clientX, "max");
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              activeFilterPanel === "duration"
                ? "mt-4 max-h-40 opacity-100"
                : "max-h-0 opacity-0"
            } ${mobileFiltersOpen ? "" : "sm:block hidden"}`}
          >
            <div
              className={`w-full max-w-full px-2 sm:max-w-[25%] ${
                activeFilterPanel === "duration"
                  ? "pointer-events-auto"
                  : "pointer-events-none"
              }`}
            >
              <div className="text-sm text-zinc-200 whitespace-nowrap">
                {formatDurationSeconds(durationLevels[filters.durationMinIndex])} –{" "}
                {formatDurationSeconds(durationLevels[filters.durationMaxIndex])}
              </div>
              <div
                ref={durationTrackRef}
                className="relative mt-3 h-7"
                onPointerDown={(event) => {
                  const nextIndex = getDurationIndexFromClientX(event.clientX);
                  const distToMin = Math.abs(nextIndex - filters.durationMinIndex);
                  const distToMax = Math.abs(nextIndex - filters.durationMaxIndex);
                  const handle = distToMin <= distToMax ? "min" : "max";
                  setActiveDurationHandle(handle);
                  updateDurationFromPointer(event.clientX, handle);
                }}
              >
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
                <div
                  className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300"
                  style={{
                    left: `${durationMinPercent}%`,
                    width: `${Math.max(0, durationMaxPercent - durationMinPercent)}%`,
                  }}
                />
                <button
                  type="button"
                  aria-label="Durée minimum"
                  className="absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200/70 bg-orange-400 shadow"
                  style={{ left: `${durationMinPercent}%` }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveDurationHandle("min");
                    updateDurationFromPointer(event.clientX, "min");
                  }}
                />
                <button
                  type="button"
                  aria-label="Durée maximum"
                  className="absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/70 bg-amber-300 shadow"
                  style={{ left: `${durationMaxPercent}%` }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveDurationHandle("max");
                    updateDurationFromPointer(event.clientX, "max");
                  }}
                />
              </div>
            </div>
          </div>

        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              Vidéos ({videos.length})
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {rankedVideos.videos.slice(0, visibleCount).map((video, index) => (
                <div key={video.id} className="contents">
                  {rankedVideos.hasActiveFilters &&
                  index === rankedVideos.fullMatchCount ? (
                    <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-zinc-300">
                      {rankedVideos.fullMatchCount === 0
                        ? "Il n'y a aucun vidéos avec les filtres choisis."
                        : "Il n'y a pas d'autres vidéos avec les filtres choisis."}
                    </div>
                  ) : null}
                  <VideoCard
                    video={video}
                    prewarmPreview={index < 6}
                    onOpen={(nextVideo) => setVideoModal({ open: true, video: nextVideo })}
                  />
                </div>
              ))}
          </div>
          {visibleCount < rankedVideos.videos.length ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + BATCH_SIZE, rankedVideos.videos.length),
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
              >
                Afficher plus
              </button>
            </div>
          ) : null}
        </section>

      </main>

      <div
        className="pointer-events-none h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      >
        {preloadedVideos.map((video) => (
          <iframe
            key={video.id}
            className="h-0 w-0"
            src={cloudflarePreviewIframeSrc(
              video.cloudflare_uid,
              video.thumbnail_time_seconds ?? 1,
            )}
            allow="autoplay"
            loading="eager"
            title={`preload-${video.id}`}
          />
        ))}
      </div>

      <VideoModal
        open={videoModal.open}
        video={videoModal.video}
        onClose={() => setVideoModal({ open: false, video: null })}
      />
      <AppFooter />
    </div>
  );
}
