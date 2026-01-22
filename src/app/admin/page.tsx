"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { budgetLevels, formatCad, type BudgetLevel } from "@/lib/budget";
import { cloudflareThumbnailSrc } from "@/lib/cloudflare";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type { Taxonomy, TaxonomyKind, Video } from "@/lib/types";
import { AuthModal } from "@/components/AuthModal";

const keywordGroupKinds: TaxonomyKind[] = ["keyword", "style", "parametre"];

const taxonomyGroups: { kind: TaxonomyKind; label: string; kinds: TaxonomyKind[] }[] = [
  { kind: "type", label: "Type de vidéo", kinds: ["type"] },
  { kind: "objectif", label: "Objectifs", kinds: ["objectif"] },
  { kind: "keyword", label: "Mots clés", kinds: keywordGroupKinds },
  { kind: "feel", label: "Feel", kinds: ["feel"] },
];

const pendingCloudflarePrefix = "pending:";

type UploadStage = "queued" | "uploading" | "saving" | "done" | "error";

type RowUploadState = {
  status: UploadStage;
  progress: number;
  message?: string | null;
};

type BulkUploadItem = {
  id: string;
  file: File;
  video: Video | null;
  status: UploadStage;
  progress: number;
  message?: string | null;
};

type PendingMatchVideo = Pick<Video, "id" | "title" | "cloudflare_uid">;
type KeywordSuggestions = { existing: string[]; new: string[] };

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

function normalizeMatchKey(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

function normalizeFilename(filename: string) {
  const base = stripExtension(filename);
  const normalized = normalizeText(base);
  const withoutVersion = normalized.replace(/\b(?:v|version)\s*\d+\b/g, " ");
  return normalizeMatchKey(withoutVersion);
}

function formatDuration(seconds: number | null) {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function buildAiFrameTimes(baseSeconds: number | null) {
  const base =
    typeof baseSeconds === "number" && Number.isFinite(baseSeconds)
      ? Math.max(1, Math.floor(baseSeconds))
      : 1;
  const candidates = [base, base + 3, base + 6, base + 9, base + 12];
  const unique = new Set<number>();
  const times: number[] = [];
  for (const value of candidates) {
    if (unique.has(value)) continue;
    unique.add(value);
    times.push(value);
  }
  return times.slice(0, 5);
}

function splitTags(raw: string | null | undefined) {
  if (!raw) return [];
  return raw
    .split(/[|•·]/g)
    .flatMap((chunk) => chunk.split(/[,;/]/g))
    .flatMap((chunk) => chunk.split(/\s+\/\s+/g))
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function detectDelimiter(headerLine: string) {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = 0;
  for (const candidate of candidates) {
    const count = headerLine.split(candidate).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = candidate;
    }
  }
  return best;
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/);
  const delimiter = detectDelimiter(lines[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      field = "";
      const isEmpty = row.every((cell) => !cell.trim());
      if (!isEmpty) rows.push(row);
      row = [];
      continue;
    }

    if (char === "\r") continue;

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    const isEmpty = row.every((cell) => !cell.trim());
    if (!isEmpty) rows.push(row);
  }

  return rows;
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function parseBudgetRange(raw: string | null | undefined) {
  if (!raw) return { min: null, max: null };
  const matches = raw.match(/\d[\d\s]*/g);
  if (!matches || matches.length === 0) return { min: null, max: null };
  const numbers = matches
    .map((match) => Number.parseInt(match.replace(/\s+/g, ""), 10))
    .filter((value) => Number.isFinite(value));
  if (numbers.length === 0) return { min: null, max: null };
  const min = numbers[0];
  const max = numbers.length > 1 ? numbers[1] : numbers[0];
  return { min, max };
}

function coerceBudgetLevel(value: number | null) {
  if (!value || !Number.isFinite(value)) return null;
  let closest: BudgetLevel = budgetLevels[0];
  let bestDelta = Math.abs(value - closest);
  for (const level of budgetLevels) {
    const delta = Math.abs(value - level);
    if (delta < bestDelta) {
      bestDelta = delta;
      closest = level;
    }
  }
  return closest;
}

function isPendingVideoUid(uid: string) {
  return uid.startsWith(pendingCloudflarePrefix);
}

function uploadFileWithProgress(
  uploadURL: string,
  file: File,
  onProgress?: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadURL);

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(Math.min(100, Math.max(0, percent)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      const text = xhr.responseText || "Upload Cloudflare échoué.";
      reject(new Error(text));
    };

    xhr.onerror = () => {
      reject(new Error("Upload Cloudflare échoué."));
    };

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export default function AdminPage() {
  const supabase = useSupabaseClient();

  const pageSize = 50;
  const [authOpen, setAuthOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosMessage, setVideosMessage] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  const [newTaxKind, setNewTaxKind] = useState<TaxonomyKind>("type");
  const [newTaxLabel, setNewTaxLabel] = useState("");
  const [taxMessage, setTaxMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [budgetMinIndex, setBudgetMinIndex] = useState(0);
  const [budgetMaxIndex, setBudgetMaxIndex] = useState(budgetLevels.length - 1);
  const [thumbSeconds, setThumbSeconds] = useState<number>(1);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [selectedTaxonomyIds, setSelectedTaxonomyIds] = useState<Set<string>>(
    new Set(),
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "requesting" | "uploading" | "saving" | "done" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvState, setCsvState] = useState<"idle" | "parsing" | "saving" | "done" | "error">(
    "idle",
  );
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  const [rowUploads, setRowUploads] = useState<Record<string, RowUploadState>>({});
  const [bulkUploads, setBulkUploads] = useState<BulkUploadItem[]>([]);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [bulkDropActive, setBulkDropActive] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [durationRefreshState, setDurationRefreshState] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [durationRefreshMessage, setDurationRefreshMessage] = useState<string | null>(
    null,
  );
  const [recommendationSettingsText, setRecommendationSettingsText] = useState("");
  const [recommendationSettingsStatus, setRecommendationSettingsStatus] = useState<
    "idle" | "loading" | "saving" | "error" | "success"
  >("idle");
  const [recommendationSettingsMessage, setRecommendationSettingsMessage] = useState<
    string | null
  >(null);

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

  const refreshAdminState = useCallback(async () => {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setIsAdmin(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", auth.user.id)
      .single();
    setIsAdmin(profile?.role === "admin");
  }, [supabase]);

  const refreshTaxonomies = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("taxonomies")
      .select("id,kind,label")
      .order("label");
    setTaxonomies((data ?? []) as Taxonomy[]);
  }, [supabase]);

  const toggleFeatured = useCallback(
    async (video: Video) => {
      if (!supabase) return;
      const nextValue = !video.is_featured;
      setVideos((prev) =>
        prev.map((item) =>
          item.id === video.id ? { ...item, is_featured: nextValue } : item,
        ),
      );
      const { error } = await supabase
        .from("videos")
        .update({ is_featured: nextValue })
        .eq("id", video.id);
      if (error) {
        setVideos((prev) =>
          prev.map((item) =>
            item.id === video.id ? { ...item, is_featured: video.is_featured } : item,
          ),
        );
        setVideosMessage(error.message);
      }
    },
    [supabase],
  );

  const deleteTaxonomy = useCallback(
    async (taxonomy: Taxonomy) => {
      if (!supabase) return;
      const confirmed = window.confirm(
        `Supprimer "${taxonomy.label}" ? Il sera retiré de toutes les vidéos.`,
      );
      if (!confirmed) return;
      setTaxMessage(null);
      const { error } = await supabase.from("taxonomies").delete().eq("id", taxonomy.id);
      if (error) {
        setTaxMessage(error.message);
        return;
      }
      await refreshTaxonomies();
    },
    [refreshTaxonomies, supabase],
  );

  const refreshVideos = useCallback(async () => {
    if (!supabase) return;
    setVideosMessage(null);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    const [
      { data: rawVideos, error: videosError, count: videosCount },
      { data: rawTaxonomies, error: taxonomiesError },
    ] = await Promise.all([
      supabase
        .from("videos")
        .select(
          "id,title,cloudflare_uid,status,thumbnail_time_seconds,duration_seconds,budget_min,budget_max,is_featured,created_at",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("taxonomies").select("id,kind,label"),
    ]);

    let rawLinks: { video_id: string; taxonomy_id: string }[] = [];
    let linksError: { message?: string } | null = null;
    if (!videosError && (rawVideos ?? []).length > 0) {
      const { data, error } = await supabase
        .from("video_taxonomies")
        .select("video_id,taxonomy_id")
        .in(
          "video_id",
          (rawVideos ?? []).map((video) => video.id),
        );
      rawLinks = (data ?? []) as { video_id: string; taxonomy_id: string }[];
      linksError = error;
    }

    if (videosError || linksError || taxonomiesError) {
      setVideosMessage(
        videosError?.message ?? linksError?.message ?? taxonomiesError?.message ?? "Erreur",
      );
      setVideos([]);
      return;
    }

    const resolvedTaxonomies = (rawTaxonomies ?? []) as Taxonomy[];
    setTaxonomies(resolvedTaxonomies);
    setTotalVideos(videosCount ?? 0);

    const taxonomyById = new Map<string, Taxonomy>();
    for (const t of resolvedTaxonomies) taxonomyById.set(t.id, t);

    const taxonomyIdsByVideoId = new Map<string, string[]>();
    for (const row of (rawLinks ?? []) as { video_id: string; taxonomy_id: string }[]) {
      const list = taxonomyIdsByVideoId.get(row.video_id) ?? [];
      list.push(row.taxonomy_id);
      taxonomyIdsByVideoId.set(row.video_id, list);
    }

    const hydratedVideos: Video[] = ((rawVideos ?? []) as Omit<Video, "taxonomies">[]).map(
      (v) => ({
        ...v,
        taxonomies: (taxonomyIdsByVideoId.get(v.id) ?? [])
          .map((id) => taxonomyById.get(id))
          .filter(Boolean) as Taxonomy[],
      }),
    );

    setVideos(hydratedVideos);
  }, [supabase, currentPage, pageSize]);

  const refreshMissingDurations = useCallback(async () => {
    if (!supabase) return;
    if (!isAdmin) {
      setDurationRefreshState("error");
      setDurationRefreshMessage("Accès refusé (admin requis).");
      return;
    }
    const targets = videos.filter(
      (video) =>
        !isPendingVideoUid(video.cloudflare_uid) &&
        !Number.isFinite(video.duration_seconds),
    );
    if (targets.length === 0) {
      setDurationRefreshState("idle");
      setDurationRefreshMessage("Aucune durée manquante.");
      return;
    }
    setDurationRefreshState("loading");
    setDurationRefreshMessage(`Lecture de ${targets.length} vidéo(s)…`);
    let updatedCount = 0;
    try {
      for (const video of targets) {
        const duration = await fetchCloudflareDuration(video.cloudflare_uid);
        if (!Number.isFinite(duration)) continue;
        const { error } = await supabase
          .from("videos")
          .update({ duration_seconds: Math.max(0, Math.floor(duration ?? 0)) })
          .eq("id", video.id);
        if (!error) updatedCount += 1;
      }
      setDurationRefreshState("idle");
      setDurationRefreshMessage(
        `Durée(s) mise(s) à jour: ${updatedCount}/${targets.length}.`,
      );
      await refreshVideos();
    } catch (e) {
      setDurationRefreshState("error");
      setDurationRefreshMessage(e instanceof Error ? e.message : "Erreur");
    }
  }, [fetchCloudflareDuration, isAdmin, refreshVideos, supabase, videos]);

  useEffect(() => {
    if (!supabase) return;
    void refreshAdminState();
    void refreshTaxonomies();
    void refreshVideos();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void refreshAdminState();
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, refreshAdminState, refreshTaxonomies, refreshVideos]);

  useEffect(() => {
    if (!supabase || !isAdmin) return;
    setRecommendationSettingsStatus("loading");
    setRecommendationSettingsMessage(null);
    fetch("/api/admin/recommendations-settings")
      .then(async (response) => {
        const json = (await response.json()) as
          | { settings: unknown }
          | { error: string };
        if (!response.ok || "error" in json) {
          throw new Error("error" in json ? json.error : "Erreur");
        }
        setRecommendationSettingsText(JSON.stringify(json.settings, null, 2));
        setRecommendationSettingsStatus("idle");
      })
      .catch((error) => {
        setRecommendationSettingsStatus("error");
        setRecommendationSettingsMessage(
          error instanceof Error ? error.message : "Erreur chargement.",
        );
      });
  }, [supabase, isAdmin]);

  const totalPages = Math.max(1, Math.ceil(totalVideos / pageSize));
  const pendingVideos = useMemo(
    () => videos.filter((video) => isPendingVideoUid(video.cloudflare_uid)),
    [videos],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function addTaxonomy() {
    if (!supabase) return;
    setTaxMessage(null);
    const label = newTaxLabel.trim();
    if (!label) return;

    const { error } = await supabase
      .from("taxonomies")
      .insert({ kind: newTaxKind, label });
    if (error) {
      setTaxMessage(error.message);
      return;
    }

    setNewTaxLabel("");
    await refreshTaxonomies();
  }

  async function createDirectUpload() {
    if (!supabase) throw new Error("Supabase non initialisé.");
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("Non connecté.");

    const response = await fetch("/api/cloudflare/direct-upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const json = (await response.json()) as
      | { uploadURL: string; uid: string }
      | { error: string; details?: string };

    if (!response.ok || "error" in json) {
      const details = "details" in json ? `: ${json.details}` : "";
      throw new Error(("error" in json ? json.error : "Erreur") + details);
    }

    return json;
  }

  async function fetchCloudflareDuration(uid: string) {
    if (!supabase) throw new Error("Supabase non initialisé.");
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("Non connecté.");

    const response = await fetch(
      `/api/cloudflare/video-info?uid=${encodeURIComponent(uid)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const json = (await response.json()) as
      | { durationSeconds: number | null }
      | { error: string; details?: string };

    if (!response.ok || "error" in json) {
      const details = "details" in json ? `: ${json.details}` : "";
      throw new Error(("error" in json ? json.error : "Erreur") + details);
    }

    return json.durationSeconds ?? null;
  }

  async function uploadToCloudflare(
    uploadFile: File,
    onProgress?: (progress: number) => void,
  ) {
    const { uploadURL, uid } = await createDirectUpload();
    await uploadFileWithProgress(uploadURL, uploadFile, onProgress);
    return uid;
  }

  async function uploadVideo() {
    if (!supabase) return;
    setUploadMessage(null);
    setUploadState("requesting");
    setUploadProgress(null);

    if (!isAdmin) {
      setUploadState("error");
      setUploadMessage("Accès refusé (admin requis).");
      return;
    }
    if (!file) {
      setUploadState("error");
      setUploadMessage("Choisis un fichier vidéo.");
      return;
    }
    if (!title.trim()) {
      setUploadState("error");
      setUploadMessage("Titre requis.");
      return;
    }

    try {
      setUploadState("uploading");
      setUploadProgress(0);
      const uid = await uploadToCloudflare(file, (progress) => {
        setUploadProgress(progress);
      });
      let durationFromCloudflare: number | null = null;
      try {
        durationFromCloudflare = await fetchCloudflareDuration(uid);
        setDurationSeconds(durationFromCloudflare);
      } catch {
        durationFromCloudflare = null;
      }

      setUploadState("saving");
      const { data: inserted, error: videoError } = await supabase
        .from("videos")
        .insert({
          title: title.trim(),
          cloudflare_uid: uid,
          status: "processing",
          thumbnail_time_seconds: Number.isFinite(thumbSeconds)
            ? Math.max(0, Math.floor(thumbSeconds))
            : null,
          duration_seconds: Number.isFinite(durationFromCloudflare)
            ? Math.max(0, Math.floor(durationFromCloudflare ?? 0))
            : Number.isFinite(durationSeconds)
              ? Math.max(0, Math.floor(durationSeconds ?? 0))
              : null,
          budget_min: budgetLevels[budgetMinIndex],
          budget_max: budgetLevels[budgetMaxIndex],
        })
        .select("id")
        .single();

      if (videoError || !inserted?.id) {
        throw new Error(videoError?.message ?? "Erreur DB (videos)");
      }

      const taxonomyIds = Array.from(selectedTaxonomyIds);
      if (taxonomyIds.length > 0) {
        const rows = taxonomyIds.map((taxonomyId) => ({
          video_id: inserted.id,
          taxonomy_id: taxonomyId,
        }));
        const { error: linkError } = await supabase
          .from("video_taxonomies")
          .insert(rows);
        if (linkError) {
          throw new Error(linkError.message);
        }
      }

      setUploadState("done");
      setUploadMessage("Vidéo ajoutée. (Le statut 'ready' sera géré plus tard.)");
      setTitle("");
      setFile(null);
      setUploadProgress(null);
      setDurationSeconds(null);
      setSelectedTaxonomyIds(new Set());
      await refreshVideos();
    } catch (e) {
      setUploadState("error");
      setUploadMessage(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function importCsv() {
    if (!supabase) return;
    setCsvMessage(null);
    setCsvState("parsing");

    if (!isAdmin) {
      setCsvState("error");
      setCsvMessage("Accès refusé (admin requis).");
      return;
    }
    if (!csvFile) {
      setCsvState("error");
      setCsvMessage("Choisis un fichier CSV.");
      return;
    }

    try {
      const text = await csvFile.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        throw new Error("CSV vide ou sans données.");
      }

      const header = rows[0] ?? [];
      const normalizedHeader = header.map((cell) => normalizeText(cell));
      const resolveColumn = (aliases: string[]) =>
        normalizedHeader.findIndex((value) =>
          aliases.some((alias) => value === normalizeText(alias)),
        );

      const titleIndex = resolveColumn(["Nom", "Titre", "Name"]);
      const keywordsIndex = resolveColumn(["Keywords", "Mots clés", "Mots cles"]);
      const budgetIndex = resolveColumn(["Budget"]);
      const feelIndex = resolveColumn(["Feel"]);
      const styleIndex = resolveColumn(["Style"]);
      const objectifIndex = resolveColumn(["Objectifs", "Objectif"]);
      const typeIndex = resolveColumn(["Type de vidéo", "Type de video", "Type"]);

      const missingColumns = [];
      if (titleIndex === -1) missingColumns.push("Nom");
      if (keywordsIndex === -1) missingColumns.push("Keywords");
      if (budgetIndex === -1) missingColumns.push("Budget");
      if (feelIndex === -1) missingColumns.push("Feel");
      if (styleIndex === -1) missingColumns.push("Style");
      if (typeIndex === -1) missingColumns.push("Type de vidéo");

      if (missingColumns.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingColumns.join(", ")}`);
      }

      const entries = rows
        .slice(1)
        .map((row) => {
          const title = (row[titleIndex] ?? "").trim();
          if (!title) return null;

          const { min, max } = parseBudgetRange(row[budgetIndex]);
          const coercedMin = coerceBudgetLevel(min);
          const coercedMax = coerceBudgetLevel(max);
          let budgetMin = coercedMin ?? null;
          let budgetMax = coercedMax ?? null;
          if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
            [budgetMin, budgetMax] = [budgetMax, budgetMin];
          }

          return {
            title,
            budgetMin,
            budgetMax,
            keywords: splitTags(row[keywordsIndex]),
            feel: splitTags(row[feelIndex]),
            style: splitTags(row[styleIndex]),
            objectif: objectifIndex === -1 ? [] : splitTags(row[objectifIndex]),
            type: splitTags(row[typeIndex]),
            pendingUid: `${pendingCloudflarePrefix}${crypto.randomUUID()}`,
          };
        })
        .filter(Boolean) as {
        title: string;
        budgetMin: number | null;
        budgetMax: number | null;
        keywords: string[];
        feel: string[];
        style: string[];
        objectif: string[];
        type: string[];
        pendingUid: string;
      }[];

      if (entries.length === 0) {
        throw new Error("Aucune ligne valide dans le CSV.");
      }

      const { data: existingTaxonomies, error: existingError } = await supabase
        .from("taxonomies")
        .select("id,kind,label");
      if (existingError) throw new Error(existingError.message);

      const taxonomyMap = new Map<TaxonomyKind, Map<string, Taxonomy>>();
      for (const kind of Object.keys(groupedTaxonomies) as TaxonomyKind[]) {
        taxonomyMap.set(kind, new Map());
      }
      for (const t of (existingTaxonomies ?? []) as Taxonomy[]) {
        taxonomyMap.get(t.kind)?.set(normalizeText(t.label), t);
      }

      const missingTaxonomies: { kind: TaxonomyKind; label: string }[] = [];
      const queueMissing = (kind: TaxonomyKind, label: string) => {
        const normalized = normalizeText(label);
        const map = taxonomyMap.get(kind);
        if (!map || map.has(normalized)) return;
        missingTaxonomies.push({ kind, label });
        map.set(normalized, { id: normalized, kind, label });
      };

      for (const entry of entries) {
        entry.type.forEach((label) => queueMissing("type", label));
        entry.keywords.forEach((label) => queueMissing("keyword", label));
        entry.style.forEach((label) => queueMissing("style", label));
        entry.feel.forEach((label) => queueMissing("feel", label));
        entry.objectif.forEach((label) => queueMissing("objectif", label));
      }

      setCsvState("saving");

      let insertedTaxonomiesCount = 0;
      if (missingTaxonomies.length > 0) {
        const { data: insertedTaxonomies, error: taxError } = await supabase
          .from("taxonomies")
          .upsert(missingTaxonomies, { onConflict: "kind,label" })
          .select("id,kind,label");
        if (taxError) throw new Error(taxError.message);
        insertedTaxonomiesCount = insertedTaxonomies?.length ?? 0;
      }

      const { data: refreshedTaxonomies, error: refreshedError } = await supabase
        .from("taxonomies")
        .select("id,kind,label");
      if (refreshedError) throw new Error(refreshedError.message);
      setTaxonomies((refreshedTaxonomies ?? []) as Taxonomy[]);

      taxonomyMap.clear();
      for (const kind of Object.keys(groupedTaxonomies) as TaxonomyKind[]) {
        taxonomyMap.set(kind, new Map());
      }
      for (const t of (refreshedTaxonomies ?? []) as Taxonomy[]) {
        taxonomyMap.get(t.kind)?.set(normalizeText(t.label), t);
      }

      let totalVideosInserted = 0;
      let totalLinksInserted = 0;
      const entryBatches = chunkArray(entries, 50);
      for (const batch of entryBatches) {
        const videosToInsert = batch.map((entry) => ({
          title: entry.title,
          cloudflare_uid: entry.pendingUid,
          status: "processing",
          thumbnail_time_seconds: 1,
          budget_min: entry.budgetMin,
          budget_max: entry.budgetMax,
        }));

        const { data: insertedVideos, error: insertError } = await supabase
          .from("videos")
          .insert(videosToInsert)
          .select("id,cloudflare_uid");
        if (insertError) throw new Error(insertError.message);
        totalVideosInserted += insertedVideos?.length ?? 0;

        const idByPendingUid = new Map<string, string>();
        for (const row of insertedVideos ?? []) {
          idByPendingUid.set(row.cloudflare_uid as string, row.id as string);
        }

        const linkRows: { video_id: string; taxonomy_id: string }[] = [];
        for (const entry of batch) {
          const videoId = idByPendingUid.get(entry.pendingUid);
          if (!videoId) continue;
          const labelsByKind: [TaxonomyKind, string[]][] = [
            ["type", entry.type],
            ["keyword", entry.keywords],
            ["style", entry.style],
            ["feel", entry.feel],
            ["objectif", entry.objectif],
          ];

          const taxonomyIds = new Set<string>();
          for (const [kind, labels] of labelsByKind) {
            const map = taxonomyMap.get(kind);
            if (!map) continue;
            for (const label of labels) {
              const taxonomy = map.get(normalizeText(label));
              if (taxonomy) taxonomyIds.add(taxonomy.id);
            }
          }

          for (const taxonomyId of taxonomyIds) {
            linkRows.push({ video_id: videoId, taxonomy_id: taxonomyId });
          }
        }

        if (linkRows.length > 0) {
          const linkBatches = chunkArray(linkRows, 500);
          for (const linkBatch of linkBatches) {
            const { error: linkError } = await supabase
              .from("video_taxonomies")
              .insert(linkBatch);
            if (linkError) throw new Error(linkError.message);
            totalLinksInserted += linkBatch.length;
          }
        }
      }

      setCsvState("done");
      setCsvMessage(
        `Import terminé: ${entries.length} lignes, ${totalVideosInserted} vidéos, ${insertedTaxonomiesCount} tags ajoutés, ${totalLinksInserted} liens.`,
      );
      setCsvFile(null);
      await refreshVideos();
    } catch (e) {
      setCsvState("error");
      setCsvMessage(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function attachUploadToVideo(
    video: Video,
    uploadFile: File,
    options?: {
      onProgress?: (progress: number) => void;
      onStage?: (stage: "uploading" | "saving") => void;
    },
  ) {
    if (!supabase) return;
    if (!isAdmin) throw new Error("Accès refusé (admin requis).");

    options?.onStage?.("uploading");
    const uid = await uploadToCloudflare(uploadFile, options?.onProgress);

    options?.onStage?.("saving");
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        cloudflare_uid: uid,
        status: "processing",
        thumbnail_time_seconds: video.thumbnail_time_seconds ?? 1,
      })
      .eq("id", video.id);

    if (updateError) throw new Error(updateError.message);
  }

  async function deleteVideo(video: Video) {
    if (!supabase) return;
    if (!confirm(`Supprimer "${video.title}" de Supabase? (La vidéo restera sur Cloudflare)`)) {
      return;
    }
    setVideosMessage(null);
    const { error } = await supabase.from("videos").delete().eq("id", video.id);
    if (error) {
      setVideosMessage(error.message);
      return;
    }
    await refreshVideos();
  }

  const allTaxonomyIds = useMemo(() => new Set(taxonomies.map((t) => t.id)), [taxonomies]);

  function updateRowUpload(videoId: string, next: Partial<RowUploadState>) {
    setRowUploads((prev) => {
      const current = prev[videoId] ?? { status: "queued", progress: 0 };
      return {
        ...prev,
        [videoId]: {
          ...current,
          ...next,
        },
      };
    });
  }

  async function startRowUpload(video: Video, uploadFile: File) {
    if (!isAdmin) {
      updateRowUpload(video.id, {
        status: "error",
        progress: 0,
        message: "Accès refusé (admin requis).",
      });
      return;
    }
    updateRowUpload(video.id, {
      status: "uploading",
      progress: 0,
      message: null,
    });
    try {
      await attachUploadToVideo(video, uploadFile, {
        onProgress: (progress) => updateRowUpload(video.id, { progress }),
        onStage: (stage) =>
          updateRowUpload(video.id, {
            status: stage === "saving" ? "saving" : "uploading",
          }),
      });
      updateRowUpload(video.id, { status: "done", progress: 100 });
      await refreshVideos();
    } catch (e) {
      updateRowUpload(video.id, {
        status: "error",
        message: e instanceof Error ? e.message : "Erreur",
      });
    }
  }

  async function loadPendingVideosForMatch(): Promise<PendingMatchVideo[]> {
    if (!supabase) return pendingVideos;
    const { data, error } = await supabase
      .from("videos")
      .select("id,title,cloudflare_uid")
      .like("cloudflare_uid", `${pendingCloudflarePrefix}%`);
    if (error) {
      setBulkMessage(error.message);
      return pendingVideos;
    }
    return (data ?? []) as PendingMatchVideo[];
  }

  async function enqueueBulkUploads(files: File[]) {
    if (!files.length) return;
    setBulkMessage(null);
    if (!isAdmin) {
      setBulkMessage("Accès refusé (admin requis).");
      return;
    }

    const pendingMatches = await loadPendingVideosForMatch();
    const pendingByTitle = new Map<string, Video[]>();
    for (const video of pendingMatches) {
      const key = normalizeMatchKey(video.title);
      const list = pendingByTitle.get(key) ?? [];
      list.push(video as Video);
      pendingByTitle.set(key, list);
    }

    const newItems: BulkUploadItem[] = files.map((uploadFile) => {
      const key = normalizeFilename(uploadFile.name);
      const matches = pendingByTitle.get(key);
      const video = matches && matches.length > 0 ? matches.shift() ?? null : null;
      return {
        id: crypto.randomUUID(),
        file: uploadFile,
        video,
        status: video ? "queued" : "error",
        progress: 0,
        message: video
          ? null
          : "Aucune vidéo en attente trouvée pour ce nom de fichier.",
      };
    });

    setBulkUploads((prev) => [...newItems, ...prev]);

    for (const item of newItems) {
      if (!item.video) continue;
      void startBulkUpload(item);
    }
  }

  async function startBulkUpload(item: BulkUploadItem) {
    if (!item.video) return;
    setBulkUploads((prev) =>
      prev.map((entry) =>
        entry.id === item.id
          ? { ...entry, status: "uploading", progress: 0, message: null }
          : entry,
      ),
    );
    try {
      await attachUploadToVideo(item.video, item.file, {
        onProgress: (progress) =>
          setBulkUploads((prev) =>
            prev.map((entry) =>
              entry.id === item.id ? { ...entry, progress } : entry,
            ),
          ),
        onStage: (stage) =>
          setBulkUploads((prev) =>
            prev.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: stage === "saving" ? "saving" : "uploading" }
                : entry,
            ),
          ),
      });
      setBulkUploads((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, status: "done", progress: 100 } : entry,
        ),
      );
      await refreshVideos();
    } catch (e) {
      setBulkUploads((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                status: "error",
                message: e instanceof Error ? e.message : "Erreur",
              }
            : entry,
        ),
      );
    }
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-none items-center justify-between px-4 py-4 lg:px-6">
          <div>
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-xs text-zinc-400">
              Upload Cloudflare Stream + gestion des options
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
              href="/"
            >
              Retour
            </Link>
            <button
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
              type="button"
              onClick={() => setAuthOpen(true)}
            >
              Se connecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-none grid-cols-1 gap-4 p-4 lg:grid-cols-2 lg:p-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <h2 className="text-sm font-semibold">Statut</h2>
          <div className="mt-2 text-sm text-zinc-200">
            {isAdmin === null
              ? "Chargement…"
              : isAdmin
                ? "Connecté en admin ✅"
                : "Non admin (ou non connecté) ❌"}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Pour devenir admin: connecte-toi puis mets ton rôle à <code>admin</code>{" "}
            dans la table <code>profiles</code> (Supabase).
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <h2 className="text-sm font-semibold">Options (taxonomies)</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
              value={newTaxKind}
              onChange={(e) => setNewTaxKind(e.target.value as TaxonomyKind)}
            >
              {taxonomyGroups.map((group) => (
                <option key={group.kind} value={group.kind}>
                  {group.label}
                </option>
              ))}
            </select>
            <input
              className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              value={newTaxLabel}
              onChange={(e) => setNewTaxLabel(e.target.value)}
              placeholder="Ex: Publicité"
            />
            <button
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              type="button"
              onClick={() => void addTaxonomy()}
            >
              Ajouter
            </button>
          </div>
          {taxMessage ? (
            <div className="mt-2 text-sm text-red-600">{taxMessage}</div>
          ) : null}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {taxonomyGroups.map((group) => {
              const options = mergeTaxonomiesByKinds(groupedTaxonomies, group.kinds);
              return (
                <div
                  key={group.kind}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {group.label}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {options.length === 0 ? (
                      <div className="text-sm text-zinc-400">Aucune option</div>
                    ) : (
                      options.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-200"
                        >
                          {t.label}
                          <button
                            type="button"
                            onClick={() => void deleteTaxonomy(t)}
                            className="rounded-full px-1 text-[10px] text-zinc-300 hover:bg-white/10 hover:text-white"
                            aria-label={`Supprimer ${t.label}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Réglages références (local)</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-60"
                onClick={() => {
                  setRecommendationSettingsStatus("loading");
                  setRecommendationSettingsMessage(null);
                  fetch("/api/admin/recommendations-settings")
                    .then(async (response) => {
                      const json = (await response.json()) as
                        | { settings: unknown }
                        | { error: string };
                      if (!response.ok || "error" in json) {
                        throw new Error("error" in json ? json.error : "Erreur");
                      }
                      setRecommendationSettingsText(JSON.stringify(json.settings, null, 2));
                      setRecommendationSettingsStatus("idle");
                    })
                    .catch((error) => {
                      setRecommendationSettingsStatus("error");
                      setRecommendationSettingsMessage(
                        error instanceof Error ? error.message : "Erreur chargement.",
                      );
                    });
                }}
                disabled={recommendationSettingsStatus === "loading"}
              >
                Recharger
              </button>
              <button
                type="button"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(recommendationSettingsText || "{}");
                    setRecommendationSettingsStatus("saving");
                    setRecommendationSettingsMessage(null);
                    fetch("/api/admin/recommendations-settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ settings: parsed }),
                    })
                      .then(async (response) => {
                        const json = (await response.json()) as
                          | { ok: true }
                          | { error: string };
                        if (!response.ok || "error" in json) {
                          throw new Error("error" in json ? json.error : "Erreur");
                        }
                        setRecommendationSettingsStatus("success");
                      })
                      .catch((error) => {
                        setRecommendationSettingsStatus("error");
                        setRecommendationSettingsMessage(
                          error instanceof Error ? error.message : "Erreur sauvegarde.",
                        );
                      });
                  } catch (error) {
                    setRecommendationSettingsStatus("error");
                    setRecommendationSettingsMessage(
                      error instanceof Error ? error.message : "JSON invalide.",
                    );
                  }
                }}
                disabled={recommendationSettingsStatus === "saving"}
              >
                Sauvegarder
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Modifie le JSON local utilisé pour le filtrage des références (formulaire
            /request).
          </p>
          <textarea
            className="mt-4 h-72 w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-zinc-100 outline-none"
            value={recommendationSettingsText}
            onChange={(event) => setRecommendationSettingsText(event.target.value)}
            spellCheck={false}
          />
          {recommendationSettingsMessage ? (
            <div className="mt-2 text-xs text-red-400">{recommendationSettingsMessage}</div>
          ) : null}
          {recommendationSettingsStatus === "success" ? (
            <div className="mt-2 text-xs text-emerald-300">Sauvegardé ✅</div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur lg:col-span-2">
          <h2 className="text-sm font-semibold">Import CSV</h2>
          <p className="mt-2 text-xs text-zinc-400">
            Colonnes attendues: Nom, Keywords, Budget, Feel, Style, Type de vidéo.
            Objectifs (optionnel).
            Les vidéos sont créées en attente d&apos;upload.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            />
            <button
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              type="button"
              onClick={() => void importCsv()}
              disabled={csvState === "parsing" || csvState === "saving"}
            >
              {csvState === "parsing"
                ? "Lecture…"
                : csvState === "saving"
                  ? "Import…"
                  : "Importer CSV"}
            </button>
            {csvMessage ? (
              <div className={`text-sm ${csvState === "error" ? "text-red-400" : "text-zinc-200"}`}>
                {csvMessage}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur lg:col-span-2">
          <h2 className="text-sm font-semibold">Uploader une vidéo</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block">
                <div className="text-sm font-medium">Titre</div>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm font-medium">Budget min</div>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
                    value={budgetMinIndex}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setBudgetMinIndex(Math.min(next, budgetMaxIndex));
                    }}
                  >
                    {budgetLevels.map((b, idx) => (
                      <option key={b} value={idx}>
                        {formatCad(b)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm font-medium">Budget max</div>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
                    value={budgetMaxIndex}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setBudgetMaxIndex(Math.max(next, budgetMinIndex));
                    }}
                  >
                    {budgetLevels.map((b, idx) => (
                      <option key={b} value={idx}>
                        {formatCad(b)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <div className="text-sm font-medium">Thumbnail (secondes)</div>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100"
                  value={thumbSeconds}
                  onChange={(e) => setThumbSeconds(Number(e.target.value))}
                  type="number"
                  min={0}
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Durée (secondes)</div>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100"
                  value={durationSeconds ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDurationSeconds(raw === "" ? null : Number(raw));
                  }}
                  type="number"
                  min={0}
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium">Fichier vidéo</div>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <button
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                type="button"
                onClick={() => void uploadVideo()}
                disabled={uploadState === "requesting" || uploadState === "uploading" || uploadState === "saving"}
              >
                {uploadState === "requesting"
                  ? "Création URL…"
                  : uploadState === "uploading"
                    ? "Upload…"
                    : uploadState === "saving"
                      ? "Sauvegarde…"
                      : "Uploader"}
              </button>
              {uploadState === "uploading" && uploadProgress !== null ? (
                <div className="text-xs text-zinc-400">Upload: {uploadProgress}%</div>
              ) : null}
              {uploadMessage ? (
                <div
                  className={`text-sm ${uploadState === "error" ? "text-red-400" : "text-zinc-200"}`}
                >
                  {uploadMessage}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tags sélectionnés
              </div>
              <div className="mt-3 space-y-3">
                {taxonomyGroups.map((group) => {
                  const options = mergeTaxonomiesByKinds(groupedTaxonomies, group.kinds);
                  return (
                    <div key={group.kind}>
                      <div className="text-sm font-semibold">{group.label}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {options.length === 0 ? (
                          <div className="text-sm text-zinc-400">À venir</div>
                        ) : (
                          options.map((t) => {
                            const checked = selectedTaxonomyIds.has(t.id);
                            return (
                              <label
                                key={t.id}
                                className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                                  checked
                                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                                    : "border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
                                }`}
                              >
                                <input
                                  className="hidden"
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setSelectedTaxonomyIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(t.id)) next.delete(t.id);
                                      else next.add(t.id);
                                      return next;
                                    });
                                  }}
                                />
                                {t.label}
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Preview thumbnail (exemple)
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                Après upload, la grille utilisera:
              </div>
              <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
                <code>
                  {cloudflareThumbnailSrc("CLOUDFLARE_UID", thumbSeconds)}
                </code>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Vidéos</h2>
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                type="button"
                onClick={() => void refreshMissingDurations()}
                disabled={durationRefreshState === "loading"}
              >
                {durationRefreshState === "loading" ? "Durées…" : "Récupérer durées"}
              </button>
              <div className="text-xs text-zinc-400">
                Page {currentPage} / {totalPages} ({totalVideos})
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1}
              >
                Précédent
              </button>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
              >
                Suivant
              </button>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
                type="button"
                onClick={() => void refreshVideos()}
              >
                Rafraîchir
              </button>
            </div>
          </div>
          {durationRefreshMessage ? (
            <div
              className={`mt-2 text-xs ${
                durationRefreshState === "error" ? "text-red-400" : "text-zinc-400"
              }`}
            >
              {durationRefreshMessage}
            </div>
          ) : null}
          {videosMessage ? (
            <div className="mt-3 text-sm text-red-400">{videosMessage}</div>
          ) : null}

          {pendingVideos.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Upload rapide (drag &amp; drop)</div>
                  <div className="text-xs text-zinc-400">
                    Les noms de fichiers doivent correspondre aux titres des vidéos en
                    attente.
                  </div>
                </div>
                <button
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/20"
                  type="button"
                  onClick={() => bulkInputRef.current?.click()}
                >
                  Choisir des fichiers
                </button>
              </div>
              <input
                className="hidden"
                ref={bulkInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  void enqueueBulkUploads(files);
                  e.currentTarget.value = "";
                }}
              />
              <div
                className={`mt-4 flex min-h-[96px] cursor-pointer items-center justify-center rounded-2xl border border-white/10 px-4 text-sm text-zinc-400 transition ${
                  bulkDropActive ? "bg-white/10" : "bg-black/20"
                }`}
                onClick={() => bulkInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setBulkDropActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setBulkDropActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setBulkDropActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setBulkDropActive(false);
                  const files = Array.from(e.dataTransfer.files ?? []);
                  void enqueueBulkUploads(files);
                }}
              >
                Glisse tes fichiers vidéo ici
              </div>
              {bulkMessage ? (
                <div className="mt-2 text-sm text-red-400">{bulkMessage}</div>
              ) : null}
              {bulkUploads.length > 0 ? (
                <div className="mt-4 space-y-2 text-sm text-zinc-200">
                  {bulkUploads.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{item.file.name}</div>
                          <div className="text-xs text-zinc-400">
                            {item.video ? `→ ${item.video.title}` : "Aucune correspondance"}
                          </div>
                        </div>
                        <div className="text-xs uppercase tracking-wide text-zinc-400">
                          {item.status === "uploading"
                            ? "Upload"
                            : item.status === "saving"
                              ? "Sauvegarde"
                              : item.status === "done"
                                ? "OK"
                                : item.status === "error"
                                  ? "Erreur"
                                  : "En attente"}
                        </div>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "error" ? "bg-red-500/70" : "bg-emerald-500/70"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {item.status === "error"
                          ? item.message
                          : `${item.progress}%`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {videos.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-400">
              Aucune vidéo pour le moment.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead className="bg-black/30">
                  <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    <th className="px-3 py-2">Thumbnail</th>
                    <th className="px-3 py-2">Titre</th>
                    <th className="px-3 py-2">Budget</th>
                    <th className="px-3 py-2">Durée</th>
                    <th className="px-3 py-2">Favoris</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Objectifs</th>
                    <th className="px-3 py-2">Mots clés</th>
                    <th className="px-3 py-2">Feel</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {videos.map((v) => {
                    const byKind: Record<TaxonomyKind, Taxonomy[]> = {
                      type: [],
                      objectif: [],
                      keyword: [],
                      style: [],
                      feel: [],
                      parametre: [],
                    };
                    for (const t of v.taxonomies) byKind[t.kind].push(t);
                    for (const kind of Object.keys(byKind) as TaxonomyKind[]) {
                      byKind[kind].sort((a, b) => a.label.localeCompare(b.label, "fr"));
                    }

                    const budgetText =
                      v.budget_min && v.budget_max
                        ? `${formatCad(v.budget_min)}–${formatCad(v.budget_max)}`
                        : "—";
                    const durationText = formatDuration(v.duration_seconds);
                    const keywordGroupTags = mergeTaxonomiesByKinds(
                      byKind,
                      keywordGroupKinds,
                    );

                    return (
                      <tr
                        key={v.id}
                        className="cursor-pointer transition hover:bg-white/5"
                        onClick={() =>
                          setEditingVideo({
                            ...v,
                            taxonomies: v.taxonomies.filter((t) => allTaxonomyIds.has(t.id)),
                          })
                        }
                      >
                        <td className="px-3 py-2">
                          {isPendingVideoUid(v.cloudflare_uid) ? (
                            <div className="flex h-12 w-20 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-[10px] uppercase tracking-wide text-zinc-500">
                              À uploader
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                              <Image
                                className="h-12 w-20 object-cover"
                                src={cloudflareThumbnailSrc(
                                  v.cloudflare_uid,
                                  v.thumbnail_time_seconds,
                                )}
                                alt=""
                                width={160}
                                height={96}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="max-w-[320px] truncate font-semibold text-zinc-100">
                            {v.title}
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-400">
                            {isPendingVideoUid(v.cloudflare_uid)
                              ? "En attente d'upload"
                              : v.status === "ready"
                                ? "Ready"
                                : "Processing"}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-zinc-200">{budgetText}</td>
                        <td className="px-3 py-2 text-zinc-200">{durationText}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                              v.is_featured
                                ? "border-amber-300/50 bg-amber-400/20 text-amber-100"
                                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                            }`}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void toggleFeatured(v);
                            }}
                            aria-label={v.is_featured ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            {v.is_featured ? "★" : "☆"}
                          </button>
                        </td>
                        <TagsCell tags={byKind.type} />
                        <TagsCell tags={byKind.objectif} />
                        <TagsCell tags={keywordGroupTags} />
                        <TagsCell tags={byKind.feel} />
                        <td className="px-3 py-2 text-right">
                          <div className="flex flex-col items-end gap-2">
                            {isPendingVideoUid(v.cloudflare_uid) ? (
                              <RowUploadDropzone
                                video={v}
                                state={rowUploads[v.id]}
                                onUpload={(fileToUpload) => startRowUpload(v, fileToUpload)}
                              />
                            ) : null}
                            <button
                              className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                void deleteVideo(v);
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      {editingVideo ? (
        <EditVideoModal
          key={editingVideo.id}
          open
          onClose={() => setEditingVideo(null)}
          video={editingVideo}
          groupedTaxonomies={groupedTaxonomies}
          onSaved={async () => {
            setEditingVideo(null);
            await refreshVideos();
          }}
          refreshTaxonomies={refreshTaxonomies}
          onFetchDuration={fetchCloudflareDuration}
          supabase={supabase}
        />
      ) : null}
    </div>
  );
}

function EditVideoModal({
  open,
  onClose,
  video,
  groupedTaxonomies,
  onSaved,
  refreshTaxonomies,
  onFetchDuration,
  supabase,
}: {
  open: boolean;
  onClose: () => void;
  video: Video | null;
  groupedTaxonomies: Record<TaxonomyKind, Taxonomy[]>;
  onSaved: () => Promise<void> | void;
  refreshTaxonomies: () => Promise<void> | void;
  onFetchDuration: (uid: string) => Promise<number | null>;
  supabase: ReturnType<typeof useSupabaseClient> | null;
}) {
  const [title, setTitle] = useState(() => video?.title ?? "");
  const [thumbSeconds, setThumbSeconds] = useState<number>(
    () => video?.thumbnail_time_seconds ?? 1,
  );
  const [durationSeconds, setDurationSeconds] = useState<number | null>(
    () => video?.duration_seconds ?? null,
  );
  const [durationFetchStatus, setDurationFetchStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [durationFetchMessage, setDurationFetchMessage] = useState<string | null>(null);
  const [budgetMinIndex, setBudgetMinIndex] = useState(() => {
    if (!video?.budget_min) return 0;
    const idx = budgetLevels.indexOf(
      video.budget_min as (typeof budgetLevels)[number],
    );
    return idx >= 0 ? idx : 0;
  });
  const [budgetMaxIndex, setBudgetMaxIndex] = useState(() => {
    if (!video?.budget_max) return budgetLevels.length - 1;
    const idx = budgetLevels.indexOf(
      video.budget_max as (typeof budgetLevels)[number],
    );
    return idx >= 0 ? idx : budgetLevels.length - 1;
  });
  const [selectedTaxonomyIds, setSelectedTaxonomyIds] = useState<Set<string>>(
    () => new Set(video?.taxonomies.map((t) => t.id) ?? []),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "error">("idle");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<KeywordSuggestions | null>(null);
  const [aiSelectedExisting, setAiSelectedExisting] = useState<Set<string>>(
    new Set(),
  );
  const [aiSelectedNew, setAiSelectedNew] = useState<Set<string>>(new Set());
  const [aiFrames, setAiFrames] = useState<number[]>([]);
  const [aiApplyStatus, setAiApplyStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );
  const [aiApplyMessage, setAiApplyMessage] = useState<string | null>(null);

  const availableKeywordLabels = useMemo(
    () => groupedTaxonomies.keyword.map((t) => t.label),
    [groupedTaxonomies.keyword],
  );

  const keywordMap = useMemo(() => {
    const map = new Map<string, Taxonomy>();
    for (const taxonomy of groupedTaxonomies.keyword) {
      map.set(normalizeText(taxonomy.label), taxonomy);
    }
    return map;
  }, [groupedTaxonomies.keyword]);

  if (!open || !video) return null;

  async function requestAiKeywords() {
    if (aiStatus === "loading") return;
    if (!video) return;
    if (isPendingVideoUid(video.cloudflare_uid)) {
      setAiStatus("error");
      setAiMessage("La vidéo doit être uploadée avant l'analyse.");
      return;
    }
    setAiStatus("loading");
    setAiMessage(null);
    setAiApplyMessage(null);

    const times = buildAiFrameTimes(thumbSeconds);
    setAiFrames(times);
    try {
      const response = await fetch("/api/ai/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudflareUid: video.cloudflare_uid,
          times,
          availableKeywords: availableKeywordLabels,
        }),
      });
      const json = (await response.json()) as
        | { suggestions: KeywordSuggestions }
        | { error: string };

      if (!response.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Erreur AI");
      }

      const suggestions = json.suggestions ?? { existing: [], new: [] };
      setAiSuggestions(suggestions);
      setAiSelectedExisting(new Set(suggestions.existing));
      setAiSelectedNew(new Set(suggestions.new));
      setAiOpen(true);
      setAiStatus("idle");
    } catch (e) {
      setAiStatus("error");
      setAiMessage(e instanceof Error ? e.message : "Erreur AI");
    }
  }

  async function applyAiKeywords() {
    if (!supabase || !aiSuggestions) return;
    setAiApplyStatus("saving");
    setAiApplyMessage(null);

    const selectedExisting = Array.from(aiSelectedExisting);
    const selectedNew = Array.from(aiSelectedNew);
    const desiredIds = new Set<string>();
    const missingLabels: string[] = [];
    const missingNormalized = new Set<string>();

    for (const label of selectedExisting) {
      const taxonomy = keywordMap.get(normalizeText(label));
      if (taxonomy) desiredIds.add(taxonomy.id);
    }

    for (const label of selectedNew) {
      const trimmed = label.trim();
      if (!trimmed) continue;
      const normalized = normalizeText(trimmed);
      if (!normalized || missingNormalized.has(normalized)) continue;
      const existing = keywordMap.get(normalizeText(trimmed));
      if (existing) {
        desiredIds.add(existing.id);
      } else {
        missingNormalized.add(normalized);
        missingLabels.push(trimmed);
      }
    }

    try {
      if (missingLabels.length > 0) {
        const rows = missingLabels.map((label) => ({ kind: "keyword", label }));
        const { data: inserted, error: insertError } = await supabase
          .from("taxonomies")
          .upsert(rows, { onConflict: "kind,label" })
          .select("id,kind,label");
        if (insertError) throw insertError;
        for (const item of (inserted ?? []) as Taxonomy[]) {
          if (item.kind === "keyword") desiredIds.add(item.id);
        }
        await refreshTaxonomies();
      }

      setSelectedTaxonomyIds((prev) => {
        const next = new Set(prev);
        for (const id of desiredIds) next.add(id);
        return next;
      });

      setAiApplyStatus("idle");
      setAiOpen(false);
      setAiSuggestions(null);
      setAiSelectedExisting(new Set());
      setAiSelectedNew(new Set());
    } catch (e) {
      setAiApplyStatus("error");
      setAiApplyMessage(e instanceof Error ? e.message : "Erreur sauvegarde.");
    }
  }

  async function save() {
    if (!supabase) return;
    if (!video) return;
    setStatus("saving");
    setMessage(null);
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setStatus("error");
      setMessage("Titre requis.");
      return;
    }

    const { error: updateError } = await supabase
      .from("videos")
      .update({
        title: cleanTitle,
        thumbnail_time_seconds: Number.isFinite(thumbSeconds)
          ? Math.max(0, Math.floor(thumbSeconds))
          : null,
        duration_seconds: Number.isFinite(durationSeconds)
          ? Math.max(0, Math.floor(durationSeconds ?? 0))
          : null,
        budget_min: budgetLevels[budgetMinIndex],
        budget_max: budgetLevels[budgetMaxIndex],
      })
      .eq("id", video.id);

    if (updateError) {
      setStatus("error");
      setMessage(updateError.message);
      return;
    }

    const desired = Array.from(selectedTaxonomyIds);
    const { error: deleteError } = await supabase
      .from("video_taxonomies")
      .delete()
      .eq("video_id", video.id);
    if (deleteError) {
      setStatus("error");
      setMessage(deleteError.message);
      return;
    }

    if (desired.length > 0) {
      const rows = desired.map((taxonomyId) => ({
        video_id: video.id,
        taxonomy_id: taxonomyId,
      }));
      const { error: insertError } = await supabase
        .from("video_taxonomies")
        .insert(rows);
      if (insertError) {
        setStatus("error");
        setMessage(insertError.message);
        return;
      }
    }

    setStatus("idle");
    await onSaved();
  }

  async function handleFetchDuration() {
    if (!video) return;
    if (isPendingVideoUid(video.cloudflare_uid)) {
      setDurationFetchStatus("error");
      setDurationFetchMessage("La vidéo doit être uploadée avant l'analyse.");
      return;
    }
    setDurationFetchStatus("loading");
    setDurationFetchMessage(null);
    try {
      const duration = await onFetchDuration(video.cloudflare_uid);
      setDurationSeconds(duration);
      setDurationFetchStatus("idle");
    } catch (e) {
      setDurationFetchStatus("error");
      setDurationFetchMessage(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-6">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">Modifier</h2>
            <div className="mt-1 truncate text-xs text-zinc-400">
              UID: {video.cloudflare_uid}
            </div>
          </div>
          <button
            className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm font-medium text-zinc-200">Titre</div>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 placeholder:text-zinc-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm font-medium text-zinc-200">Budget min</div>
                <select
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
                  value={budgetMinIndex}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setBudgetMinIndex(Math.min(next, budgetMaxIndex));
                  }}
                >
                  {budgetLevels.map((b, idx) => (
                    <option key={b} value={idx}>
                      {formatCad(b)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <div className="text-sm font-medium text-zinc-200">Budget max</div>
                <select
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
                  value={budgetMaxIndex}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setBudgetMaxIndex(Math.max(next, budgetMinIndex));
                  }}
                >
                  {budgetLevels.map((b, idx) => (
                    <option key={b} value={idx}>
                      {formatCad(b)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium text-zinc-200">Thumbnail (secondes)</div>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100"
                value={thumbSeconds}
                onChange={(e) => setThumbSeconds(Number(e.target.value))}
                type="number"
                min={0}
              />
            </label>
            <label className="block">
              <div className="flex items-center justify-between gap-2 text-sm font-medium text-zinc-200">
                <span>Durée (secondes)</span>
                <button
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-60"
                  type="button"
                  onClick={() => void handleFetchDuration()}
                  disabled={durationFetchStatus === "loading" || !supabase}
                >
                  {durationFetchStatus === "loading"
                    ? "Lecture…"
                    : "Récupérer"}
                </button>
              </div>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-100"
                value={durationSeconds ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setDurationSeconds(raw === "" ? null : Number(raw));
                }}
                type="number"
                min={0}
              />
              {durationFetchMessage ? (
                <div className="mt-1 text-xs text-red-400">{durationFetchMessage}</div>
              ) : null}
            </label>

            {message ? (
              <div className="text-sm text-red-400">{message}</div>
            ) : null}

            <button
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              type="button"
              onClick={() => void save()}
              disabled={status === "saving" || !supabase}
            >
              {status === "saving" ? "Sauvegarde…" : "Sauvegarder"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tags
              </div>
              <button
                className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-white/20 disabled:opacity-50"
                type="button"
                onClick={() => void requestAiKeywords()}
                disabled={aiStatus === "loading" || !supabase}
              >
                {aiStatus === "loading" ? "Analyse…" : "Analyser mots-clés"}
              </button>
            </div>
            {aiMessage ? (
              <div className="mt-2 text-xs text-red-400">{aiMessage}</div>
            ) : null}
            <div className="mt-3 space-y-3">
              {taxonomyGroups.map((group) => {
                const options = mergeTaxonomiesByKinds(groupedTaxonomies, group.kinds);
                return (
                  <div key={group.kind}>
                    <div className="text-sm font-semibold">{group.label}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {options.length === 0 ? (
                        <div className="text-sm text-zinc-400">À venir</div>
                      ) : (
                        options.map((t) => {
                          const checked = selectedTaxonomyIds.has(t.id);
                          return (
                            <label
                              key={t.id}
                              className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                                checked
                                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                                  : "border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
                              }`}
                            >
                              <input
                                className="hidden"
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedTaxonomyIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(t.id)) next.delete(t.id);
                                    else next.add(t.id);
                                    return next;
                                  });
                                }}
                              />
                              {t.label}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Thumbnail
            </div>
            <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {isPendingVideoUid(video.cloudflare_uid) ? (
                <div className="flex aspect-video w-full items-center justify-center text-xs uppercase tracking-wide text-zinc-500">
                  En attente d&apos;upload
                </div>
              ) : (
                <Image
                  className="aspect-video w-full object-cover"
                  src={cloudflareThumbnailSrc(video.cloudflare_uid, thumbSeconds)}
                  alt=""
                  width={640}
                  height={360}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {aiOpen ? (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 p-6">
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">
                  Suggestions mots-clés
                </h3>
                <div className="mt-1 text-xs text-zinc-400">
                  Valide les tags proposés avant insertion.
                </div>
              </div>
              <button
                className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-white/10"
                onClick={() => setAiOpen(false)}
                type="button"
              >
                Fermer
              </button>
            </div>

            {aiFrames.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {aiFrames.map((time) => (
                  <div
                    key={time}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
                  >
                    <Image
                      className="aspect-video w-full object-cover"
                      src={cloudflareThumbnailSrc(video.cloudflare_uid, time)}
                      alt=""
                      width={240}
                      height={135}
                    />
                    <div className="px-2 py-1 text-center text-[10px] text-zinc-400">
                      {time}s
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Mots-clés existants
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(aiSuggestions?.existing ?? []).length === 0 ? (
                    <div className="text-sm text-zinc-400">Aucun proposé.</div>
                  ) : (
                    (aiSuggestions?.existing ?? []).map((label) => {
                      const checked = aiSelectedExisting.has(label);
                      return (
                        <label
                          key={label}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                            checked
                              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                              : "border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
                          }`}
                        >
                          <input
                            className="hidden"
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setAiSelectedExisting((prev) => {
                                const next = new Set(prev);
                                if (next.has(label)) next.delete(label);
                                else next.add(label);
                                return next;
                              });
                            }}
                          />
                          {label}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Nouveaux mots-clés
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(aiSuggestions?.new ?? []).length === 0 ? (
                    <div className="text-sm text-zinc-400">Aucun proposé.</div>
                  ) : (
                    (aiSuggestions?.new ?? []).map((label) => {
                      const checked = aiSelectedNew.has(label);
                      return (
                        <label
                          key={label}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                            checked
                              ? "border-amber-400/40 bg-amber-500/20 text-amber-100"
                              : "border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
                          }`}
                        >
                          <input
                            className="hidden"
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setAiSelectedNew((prev) => {
                                const next = new Set(prev);
                                if (next.has(label)) next.delete(label);
                                else next.add(label);
                                return next;
                              });
                            }}
                          />
                          {label}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {aiApplyMessage ? (
              <div className="mt-3 text-sm text-red-400">{aiApplyMessage}</div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
                type="button"
                onClick={() => setAiOpen(false)}
              >
                Annuler
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                type="button"
                onClick={() => void applyAiKeywords()}
                disabled={aiApplyStatus === "saving" || !supabase}
              >
                {aiApplyStatus === "saving" ? "Application…" : "Appliquer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TagsCell({ tags }: { tags: Taxonomy[] }) {
  if (tags.length === 0) {
    return <td className="px-3 py-2 text-zinc-500">—</td>;
  }

  const shown = tags.slice(0, 3);
  const remaining = tags.length - shown.length;

  return (
    <td className="px-3 py-2">
      <div className="flex max-w-[240px] flex-wrap gap-1">
        {shown.map((t) => (
          <span
            key={t.id}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200"
          >
            {t.label}
          </span>
        ))}
        {remaining > 0 ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-300">
            +{remaining}
          </span>
        ) : null}
      </div>
    </td>
  );
}

function RowUploadDropzone({
  video,
  state,
  onUpload,
}: {
  video: Video;
  state: RowUploadState | undefined;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const isUploading = state?.status === "uploading" || state?.status === "saving";

  return (
    <div className="w-full text-right">
      <input
        className="hidden"
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onUpload(selected);
          e.currentTarget.value = "";
        }}
      />
      <div
        className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
          dragActive
            ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
            : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
        } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isUploading) inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped && !isUploading) onUpload(dropped);
        }}
      >
        {isUploading
          ? state?.status === "saving"
            ? "Sauvegarde…"
            : `Upload… ${state?.progress ?? 0}%`
          : "Glisser / cliquer"}
      </div>
      {state?.status === "error" ? (
        <div className="mt-1 text-xs text-red-400">{state.message}</div>
      ) : null}
      {state?.status === "done" ? (
        <div className="mt-1 text-xs text-emerald-200">Upload OK ✅</div>
      ) : null}
    </div>
  );
}
