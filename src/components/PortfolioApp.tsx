"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { budgetLevels, formatCad } from "@/lib/budget";
import { cloudflarePreviewIframeSrc } from "@/lib/cloudflare";
import Link from "next/link";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type {
  Project,
  ProjectDiffusion,
  ProjectObjective,
  Taxonomy,
  TaxonomyKind,
  Video,
} from "@/lib/types";
import { AppFooter } from "./AppFooter";
import { AuthModal } from "./AuthModal";
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

type ProjectDraft = {
  title: string;
  description: string;
  budget: string;
  videoType: string;
  objectives: ProjectObjective[];
  diffusions: ProjectDiffusion[];
  timeline: string;
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
  label: string;
  placeholder: string;
};

const filterFields: FilterFieldDefinition[] = [
  {
    id: "type",
    kinds: ["type"],
    label: "Type de vidéo",
    placeholder: "Publicité, capsule, documentaire...",
  },
  {
    id: "objectif",
    kinds: ["objectif"],
    label: "Objectifs",
    placeholder: "Promotionnelle, recrutement, notoriété...",
  },
  {
    id: "feel",
    kinds: ["feel"],
    label: "Ton",
    placeholder: "Dynamique, nostalgique, épique...",
  },
  {
    id: "keywords",
    kinds: keywordGroupKinds,
    label: "Mots clés",
    placeholder: "Restaurant, B-roll, voix off, événement...",
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

function newProjectDraft(): ProjectDraft {
  return {
    title: "",
    description: "",
    budget: "",
    videoType: "",
    objectives: [],
    diffusions: [],
    timeline: "",
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
  const supabase = useSupabaseClient();

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

  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    video: Video | null;
  }>({ open: false, video: null });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingFavoriteVideoId, setPendingFavoriteVideoId] = useState<
    string | null
  >(null);
  const [pendingFavoriteAnchor, setPendingFavoriteAnchor] = useState<{
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null>(null);

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<Project[]>([]);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [favoritePopover, setFavoritePopover] = useState<{
    open: boolean;
    video: Video | null;
    top: number;
    left: number;
  }>({ open: false, video: null, top: 0, left: 0 });
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [popoverStatus, setPopoverStatus] = useState<
    "idle" | "saving" | "error" | "success"
  >("idle");
  const [popoverMessage, setPopoverMessage] = useState<string | null>(null);
  const [popoverSuccessProjectId, setPopoverSuccessProjectId] = useState<
    string | null
  >(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error">("idle");
  const [aiMessage, setAiMessage] = useState<string | null>(null);

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
    if (!activeBudgetHandle) return;
    function handlePointerMove(event: PointerEvent) {
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
    if (!activeDurationHandle) return;
    function handlePointerMove(event: PointerEvent) {
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

  useEffect(() => {
    if (!supabase) return;
    let ignore = false;
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (ignore) return;
      setSessionEmail(data.session?.user.email ?? null);
    }
    void loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSessionEmail(nextSession?.user.email ?? null);
      },
    );

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let ignore = false;
    async function loadFavorites() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setFavorites(new Set());
        return;
      }

      const { data } = await supabase.from("favorites").select("video_id");
      if (ignore) return;
      const rows = (data ?? []) as { video_id: string }[];
      setFavorites(new Set(rows.map((r) => r.video_id)));
    }
    void loadFavorites();
    return () => {
      ignore = true;
    };
  }, [sessionEmail, supabase]);

  useEffect(() => {
    if (!supabase) return;
    let ignore = false;
    async function loadProjects() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setProjects([]);
        setProjectVideos([]);
        return;
      }
      const projectsResult = await supabase
        .from("projects")
        .select(
          "id,user_id,title,description,budget,video_type,objectives,diffusions,timeline,created_at",
        )
        .order("created_at", { ascending: false });
      if (ignore) return;
      setProjects((projectsResult.data ?? []) as Project[]);
    }
    void loadProjects();
    return () => {
      ignore = true;
    };
  }, [sessionEmail, supabase]);

  useEffect(() => {
    if (!favoritePopover.open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target || !popoverRef.current) return;
      if (!popoverRef.current.contains(target)) {
        setFavoritePopover({ open: false, video: null, top: 0, left: 0 });
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [favoritePopover.open]);

  const parseBudgetValue = useCallback((value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    if (!cleaned) return null;
    const parsed = Number.parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, []);

  const createProject = useCallback(
    async (draft: ProjectDraft) => {
      if (!supabase) return null;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return null;
      const payload = {
        user_id: userId,
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        budget: parseBudgetValue(draft.budget),
        video_type: draft.videoType.trim() || null,
        objectives: draft.objectives,
        diffusions: draft.diffusions,
        timeline: draft.timeline.trim() || null,
      };
      if (!payload.title) return null;
      const { data, error } = await supabase
        .from("projects")
        .insert(payload)
        .select(
          "id,user_id,title,description,budget,video_type,objectives,diffusions,timeline,created_at",
        )
        .single();
      if (error || !data) return null;
      const nextProject = data as Project;
      setProjects((prev) => [nextProject, ...prev]);
      return nextProject;
    },
    [parseBudgetValue, supabase],
  );

  const addVideoToProject = useCallback(
    async (projectId: string, videoId: string) => {
      if (!supabase) return false;
      const { error } = await supabase.from("project_videos").upsert(
        { project_id: projectId, video_id: videoId },
        { onConflict: "project_id,video_id" },
      );
      if (error) return false;
      return true;
    },
    [supabase],
  );

  const ensureFavorite = useCallback(
    async (videoId: string) => {
      if (!supabase) return false;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return false;
      if (favorites.has(videoId)) return true;
      const next = new Set(favorites);
      next.add(videoId);
      setFavorites(next);
      await supabase.from("favorites").insert({ user_id: userId, video_id: videoId });
      return true;
    },
    [favorites, supabase],
  );

  const openFavoritePopover = useCallback(
    (
      video: Video,
      anchorRect?: {
        top: number;
        left: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
      },
    ) => {
      const popoverWidth = 320;
      const padding = 12;
      let left = window.innerWidth - popoverWidth - padding;
      let top = 100;
      if (anchorRect) {
        left = Math.min(
          Math.max(padding, anchorRect.left),
          window.innerWidth - popoverWidth - padding,
        );
        top = Math.min(anchorRect.bottom + 8, window.innerHeight - 240);
      }
      setFavoritePopover({ open: true, video, top, left });
      setNewProjectOpen(false);
      setNewProjectName("");
      setPopoverStatus("idle");
      setPopoverMessage(null);
      setPopoverSuccessProjectId(null);
    },
    [],
  );

  const handleAddToProject = useCallback(
    async (projectId: string) => {
      if (!favoritePopover.video) return;
      setPopoverStatus("saving");
      setPopoverMessage(null);
      setPopoverSuccessProjectId(null);
      const favoriteOk = await ensureFavorite(favoritePopover.video.id);
      const videoOk = await addVideoToProject(projectId, favoritePopover.video.id);
      if (!favoriteOk || !videoOk) {
        setPopoverStatus("error");
        setPopoverMessage("Impossible d'ajouter la vidéo au projet.");
        return;
      }
      setPopoverStatus("success");
      setPopoverMessage("Vidéo ajoutée au projet.");
      setPopoverSuccessProjectId(projectId);
    },
    [addVideoToProject, ensureFavorite, favoritePopover.video],
  );

  const handleCreateProjectAndRedirect = useCallback(async () => {
    if (!favoritePopover.video) return;
    const title = newProjectName.trim();
    if (!title) {
      setPopoverStatus("error");
      setPopoverMessage("Ajoute un nom de projet.");
      return;
    }
    setPopoverStatus("saving");
    setPopoverMessage(null);
    setPopoverSuccessProjectId(null);
    const draft = newProjectDraft();
    draft.title = title;
    const project = await createProject(draft);
    if (!project) {
      setPopoverStatus("error");
      setPopoverMessage("Impossible de créer le projet.");
      return;
    }
    const favoriteOk = await ensureFavorite(favoritePopover.video.id);
    const videoOk = await addVideoToProject(project.id, favoritePopover.video.id);
    if (!favoriteOk || !videoOk) {
      setPopoverStatus("error");
      setPopoverMessage("Impossible d'ajouter la vidéo au projet.");
      return;
    }
    setPopoverStatus("success");
    setPopoverMessage("Projet créé et vidéo ajoutée.");
    setPopoverSuccessProjectId(project.id);
    setNewProjectOpen(false);
    setNewProjectName("");
  }, [
    addVideoToProject,
    createProject,
    ensureFavorite,
    favoritePopover.video,
    newProjectName,
  ]);

  async function toggleFavorite(
    videoId: string,
    event?: React.MouseEvent<HTMLButtonElement>,
  ) {
    const rect = event?.currentTarget?.getBoundingClientRect();
    const anchorRect = rect
      ? {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        }
      : null;
    if (!supabase) {
      setPendingFavoriteAnchor(anchorRect);
      setPendingFavoriteVideoId(videoId);
      setAuthModalOpen(true);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      setPendingFavoriteAnchor(anchorRect);
      setPendingFavoriteVideoId(videoId);
      setAuthModalOpen(true);
      return;
    }
    const userId = sessionData.session.user.id;

    const video = videoById.get(videoId) ?? null;
    if (video) openFavoritePopover(video, anchorRect);
  }


  return (
    <div className="min-h-screen text-zinc-100">
      <section className="border-b border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950/80 to-emerald-950/20">
        <div className="mx-auto flex min-h-[36vh] w-full max-w-4xl flex-col items-center justify-center gap-5 px-4 py-14 text-center lg:px-6">
          <h1 className="text-center text-4xl font-semibold text-white sm:text-5xl">
            Trouve des références{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              vidéo
            </span>{" "}
            rapidement.
          </h1>
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
                className="w-full bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder="Décris ton projet pour trouver des références"
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
              />
            </div>
            <button
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              type="submit"
              disabled={aiStatus === "loading"}
            >
              {aiStatus === "loading" ? (
                "Recherche…"
              ) : (
                <span className="flex items-center gap-2">
                  Rechercher
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    AI
                  </span>
                </span>
              )}
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
                Effacer
              </button>
            ) : null}
          </form>
          <div className="text-xs text-zinc-400">
            Ex: Vidéo promo pour un resto | Captation d&apos;événement sportif | Capsule
            RH pour une équipe tech
          </div>
          {aiMessage ? (
            <div
              className={`text-xs ${
                aiStatus === "error" ? "text-red-400" : "text-zinc-300"
              }`}
            >
              {aiMessage}
            </div>
          ) : null}
        </div>
      </section>

      <main className="mx-auto w-full max-w-none space-y-4 p-4 lg:p-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            {filterFields.map((field) => {
              const selectedCount = field.kinds.reduce(
                (count, kind) => count + filters.selected[kind].size,
                0,
              );
              const isActive = activeFilterPanel === field.id;
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
                  <span>{field.label}</span>
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
              <span>Budget</span>
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
              <span>Durée</span>
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
            <button
              className="ml-auto px-1 py-1 text-sm font-medium text-zinc-300 hover:text-white"
              type="button"
              onClick={() => setFilters(newDefaultFilters())}
            >
              Réinitialiser
            </button>
          </div>

          {filterFields.map((field) => {
            const isActive = activeFilterPanel === field.id;
            const options = mergeTaxonomiesByKinds(groupedTaxonomies, field.kinds);
            return (
              <div
                key={field.id}
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  isActive ? "mt-4 max-h-72 opacity-100" : "max-h-0 opacity-0"
                }`}
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
                                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
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
            }`}
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
            }`}
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
      {favoritePopover.open ? (
        <div
          ref={popoverRef}
          className="fixed z-50 w-80 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl shadow-black/40 backdrop-blur"
          style={{ top: favoritePopover.top, left: favoritePopover.left }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">Enregistrer dans…</div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
              onClick={() =>
                setFavoritePopover({ open: false, video: null, top: 0, left: 0 })
              }
            >
              Fermer
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {projects.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-400">
                Aucun projet pour le moment.
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/10"
                  onClick={() => void handleAddToProject(project.id)}
                  disabled={popoverStatus === "saving"}
                >
                  <span className="truncate">{project.title}</span>
                  <span className="text-xs text-zinc-500">Privée</span>
                </button>
              ))
            )}
          </div>
          <div className="mt-3">
            {!newProjectOpen ? (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
                onClick={() => setNewProjectOpen(true)}
              >
                + Nouveau projet
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  placeholder="Nom du projet"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={popoverStatus === "saving"}
                  onClick={() => void handleCreateProjectAndRedirect()}
                >
                  {popoverStatus === "saving" ? "Création…" : "Créer le projet"}
                </button>
              </div>
            )}
            {popoverMessage ? (
              <div
                className={`mt-2 flex items-center gap-2 text-xs ${
                  popoverStatus === "success" ? "text-emerald-300" : "text-red-400"
                }`}
              >
                {popoverStatus === "success" ? <span>✓</span> : null}
                <span>{popoverMessage}</span>
                {popoverStatus === "success" && popoverSuccessProjectId ? (
                  <Link
                    href={`/projects?project=${popoverSuccessProjectId}`}
                    className="text-xs font-semibold text-emerald-200 hover:text-emerald-100"
                  >
                    Voir le projet
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignedIn={async () => {
          if (!pendingFavoriteVideoId) return;
          const videoId = pendingFavoriteVideoId;
          setPendingFavoriteVideoId(null);
          const video = videoById.get(videoId) ?? null;
          if (video) openFavoritePopover(video, pendingFavoriteAnchor ?? undefined);
          setPendingFavoriteAnchor(null);
        }}
      />
      <AppFooter />
    </div>
  );
}
