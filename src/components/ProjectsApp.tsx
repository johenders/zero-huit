"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { formatCad } from "@/lib/budget";
import { cloudflarePreviewIframeSrc } from "@/lib/cloudflare";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import type {
  Project,
  ProjectDiffusion,
  ProjectObjective,
  Video,
} from "@/lib/types";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppFooter } from "./AppFooter";
import { AuthModal } from "./AuthModal";
import { VideoCard } from "./VideoCard";
import { VideoModal } from "./VideoModal";

type Props = {
  initialVideos: Video[];
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

type ProjectVideoRow = {
  project_id: string;
  video_id: string;
};

const objectiveOptions: Array<{ id: ProjectObjective; label: string }> = [
  { id: "promotion", label: "Promotion" },
  { id: "recrutement", label: "Recrutement" },
  { id: "informatif", label: "Informatif" },
  { id: "divertissement", label: "Divertissement" },
  { id: "autre", label: "Autre" },
];

const diffusionOptions: Array<{ id: ProjectDiffusion; label: string }> = [
  { id: "reseaux_sociaux", label: "Réseaux Sociaux" },
  { id: "web", label: "Web" },
  { id: "tv", label: "TV" },
  { id: "interne", label: "Interne" },
  { id: "autre", label: "Autre" },
];

const budgetValueMap: Record<string, number> = {
  "2000-5000": 2000,
  "5000-10000": 5000,
  "10000-20000": 10000,
  "20000+": 20000,
};

function budgetOptionFromValue(value: number | null) {
  if (value === null) return "";
  if (value >= 20000) return "20000+";
  if (value >= 10000) return "10000-20000";
  if (value >= 5000) return "5000-10000";
  if (value >= 2000) return "2000-5000";
  return "";
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

export function ProjectsApp({ initialVideos }: Props) {
  const supabase = useSupabaseClient();
  const searchParams = useSearchParams();

  const [videos] = useState<Video[]>(initialVideos);
  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    video: Video | null;
  }>({ open: false, video: null });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingFavoriteVideoId, setPendingFavoriteVideoId] = useState<
    string | null
  >(null);

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectVideos, setProjectVideos] = useState<ProjectVideoRow[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState(false);
  const [projectEditDraft, setProjectEditDraft] = useState<ProjectDraft>(() =>
    newProjectDraft(),
  );
  const [projectEditStatus, setProjectEditStatus] = useState<
    "idle" | "saving" | "error" | "success"
  >("idle");
  const [projectEditMessage, setProjectEditMessage] = useState<string | null>(
    null,
  );
  const [removePrompt, setRemovePrompt] = useState<{
    open: boolean;
    video: Video | null;
  }>({ open: false, video: null });
  const [projectDeletePrompt, setProjectDeletePrompt] = useState(false);
  const [projectPicker, setProjectPicker] = useState<{
    open: boolean;
    video: Video | null;
  }>({ open: false, video: null });
  const [projectPickerSelection, setProjectPickerSelection] = useState<
    string | null
  >(null);
  const [projectPickerDraft, setProjectPickerDraft] = useState<ProjectDraft>(() =>
    newProjectDraft(),
  );
  const [projectPickerStatus, setProjectPickerStatus] = useState<
    "idle" | "saving" | "error"
  >("idle");
  const [projectPickerMessage, setProjectPickerMessage] = useState<string | null>(
    null,
  );

  const videoById = useMemo(() => {
    const map = new Map<string, Video>();
    for (const video of videos) map.set(video.id, video);
    return map;
  }, [videos]);

  const projectVideoIdsByProjectId = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const row of projectVideos) {
      const list = map[row.project_id] ?? [];
      list.push(row.video_id);
      map[row.project_id] = list;
    }
    return map;
  }, [projectVideos]);

  const objectiveLabelById = useMemo(
    () => new Map(objectiveOptions.map((option) => [option.id, option.label])),
    [],
  );

  const diffusionLabelById = useMemo(
    () => new Map(diffusionOptions.map((option) => [option.id, option.label])),
    [],
  );

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
    const projectId = searchParams.get("project");
    if (!projectId) return;
    setCreateMode(false);
    setActiveProjectId(projectId);
  }, [searchParams]);

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
      const [projectsResult, projectVideosResult] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id,user_id,title,description,budget,video_type,objectives,diffusions,timeline,created_at",
          )
          .order("created_at", { ascending: false }),
        supabase.from("project_videos").select("project_id,video_id"),
      ]);
      if (ignore) return;
      setProjects((projectsResult.data ?? []) as Project[]);
      setProjectVideos((projectVideosResult.data ?? []) as ProjectVideoRow[]);
      const firstProjectId = projectsResult.data?.[0]?.id ?? null;
      setActiveProjectId((prev) =>
        createMode ? prev : prev ?? firstProjectId,
      );
    }
    void loadProjects();
    return () => {
      ignore = true;
    };
  }, [createMode, sessionEmail, supabase]);

  const parseBudgetValue = useCallback((value: string) => {
    if (value in budgetValueMap) return budgetValueMap[value];
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
      setProjectVideos((prev) => {
        if (prev.some((row) => row.project_id === projectId && row.video_id === videoId)) {
          return prev;
        }
        return [...prev, { project_id: projectId, video_id: videoId }];
      });
      return true;
    },
    [supabase],
  );

  const removeVideoFromProject = useCallback(
    async (projectId: string, videoId: string) => {
      if (!supabase) return false;
      const { error } = await supabase
        .from("project_videos")
        .delete()
        .eq("project_id", projectId)
        .eq("video_id", videoId);
      if (error) return false;
      setProjectVideos((prev) =>
        prev.filter(
          (row) => !(row.project_id === projectId && row.video_id === videoId),
        ),
      );
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

  async function toggleFavorite(videoId: string) {
    if (!supabase) {
      setPendingFavoriteVideoId(videoId);
      setAuthModalOpen(true);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      setPendingFavoriteVideoId(videoId);
      setAuthModalOpen(true);
      return;
    }
    const userId = sessionData.session.user.id;

    const next = new Set(favorites);
    if (next.has(videoId)) {
      next.delete(videoId);
      setFavorites(next);
      await supabase.from("favorites").delete().eq("video_id", videoId);
      return;
    }

    const video = videoById.get(videoId) ?? null;
    setProjectPicker({ open: true, video });
    setProjectPickerSelection(projects[0]?.id ?? null);
    setProjectPickerDraft(newProjectDraft());
    setProjectPickerStatus("idle");
    setProjectPickerMessage(null);
  }

  const handleProjectFavoriteClick = useCallback(
    (videoId: string, _event?: React.MouseEvent<HTMLButtonElement>) => {
      if (!activeProjectId) {
        void toggleFavorite(videoId);
        return;
      }
      const video = videoById.get(videoId) ?? null;
      setRemovePrompt({ open: true, video });
    },
    [activeProjectId, toggleFavorite, videoById],
  );

  const handleCreateProject = useCallback(async () => {
    setProjectEditStatus("saving");
    setProjectEditMessage(null);
    const project = await createProject(projectEditDraft);
    if (!project) {
      setProjectEditStatus("error");
      setProjectEditMessage("Impossible de créer le projet.");
      return;
    }
    setProjectEditStatus("success");
    setProjectEditMessage("Projet créé.");
    setActiveProjectId(project.id);
    setCreateMode(false);
  }, [createProject, projectEditDraft]);

  const updateProject = useCallback(
    async (projectId: string, draft: ProjectDraft) => {
      if (!supabase) return null;
      const payload = {
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
        .update(payload)
        .eq("id", projectId)
        .select(
          "id,user_id,title,description,budget,video_type,objectives,diffusions,timeline,created_at",
        )
        .single();
      if (error || !data) return null;
      const updated = data as Project;
      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? updated : project)),
      );
      return updated;
    },
    [parseBudgetValue, supabase],
  );

  const handleUpdateProject = useCallback(async () => {
    if (!activeProjectId) return;
    setProjectEditStatus("saving");
    setProjectEditMessage(null);
    const updated = await updateProject(activeProjectId, projectEditDraft);
    if (!updated) {
      setProjectEditStatus("error");
      setProjectEditMessage("Impossible de mettre à jour le projet.");
      return;
    }
    setProjectEditStatus("success");
    setProjectEditMessage("Projet mis à jour.");
  }, [activeProjectId, projectEditDraft, updateProject]);

  const deleteProject = useCallback(async () => {
    if (!activeProjectId || !supabase) return;
    const { error } = await supabase.from("projects").delete().eq("id", activeProjectId);
    if (error) {
      setProjectEditStatus("error");
      setProjectEditMessage("Impossible de supprimer le projet.");
      return;
    }
    setProjects((prev) => prev.filter((project) => project.id !== activeProjectId));
    setProjectVideos((prev) =>
      prev.filter((row) => row.project_id !== activeProjectId),
    );
    setActiveProjectId(null);
    setProjectDeletePrompt(false);
  }, [activeProjectId, supabase]);

  const handleAssignVideoToProject = useCallback(async () => {
    if (!projectPicker.video) return;
    setProjectPickerStatus("saving");
    setProjectPickerMessage(null);
    let projectId = projectPickerSelection;
    if (!projectId) {
      const created = await createProject(projectPickerDraft);
      if (!created) {
        setProjectPickerStatus("error");
        setProjectPickerMessage("Impossible de créer le projet.");
        return;
      }
      projectId = created.id;
    }
    const favoriteOk = await ensureFavorite(projectPicker.video.id);
    const videoOk = await addVideoToProject(projectId, projectPicker.video.id);
    if (!favoriteOk || !videoOk) {
      setProjectPickerStatus("error");
      setProjectPickerMessage("Impossible d'ajouter la vidéo au projet.");
      return;
    }
    setProjectPickerStatus("idle");
    setProjectPickerMessage(null);
    setProjectPicker({ open: false, video: null });
  }, [
    addVideoToProject,
    createProject,
    ensureFavorite,
    projectPickerDraft,
    projectPickerSelection,
    projectPicker.video,
  ]);

  const handleRemoveVideoFromProject = useCallback(async () => {
    if (!activeProjectId || !removePrompt.video) return;
    const ok = await removeVideoFromProject(activeProjectId, removePrompt.video.id);
    if (ok) {
      setRemovePrompt({ open: false, video: null });
    }
  }, [activeProjectId, removePrompt.video, removeVideoFromProject]);


  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const activeProjectVideoIds = activeProject
    ? projectVideoIdsByProjectId[activeProject.id] ?? []
    : [];
  const activeProjectVideos = activeProjectVideoIds
    .map((id) => videoById.get(id))
    .filter(Boolean) as Video[];

  useEffect(() => {
    if (!activeProject || createMode) return;
    setProjectEditDraft({
      title: activeProject.title,
      description: activeProject.description ?? "",
      budget: budgetOptionFromValue(activeProject.budget),
      videoType: activeProject.video_type ?? "",
      objectives: activeProject.objectives ?? [],
      diffusions: activeProject.diffusions ?? [],
      timeline: activeProject.timeline ?? "",
    });
    setProjectEditStatus("idle");
    setProjectEditMessage(null);
  }, [activeProject, createMode]);

  return (
    <div className="min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-none p-4 lg:p-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Mes projets</h2>
            {sessionEmail ? (
              <div className="text-sm text-zinc-400">
                {projects.length} projet{projects.length > 1 ? "s" : ""}
              </div>
            ) : null}
          </div>

          {!sessionEmail ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
              Connecte-toi pour créer des projets et organiser tes favoris.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,1.55fr)]">
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                    Aucun projet pour le moment.
                  </div>
                ) : (
                  projects.map((project) => {
                    const selected = project.id === activeProjectId;
                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setCreateMode(false);
                          setActiveProjectId(project.id);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-emerald-400/40 bg-emerald-500/10"
                            : "border-white/10 bg-black/30 hover:bg-white/5"
                        }`}
                      >
                        <div className="text-base font-semibold text-zinc-100">
                          {project.title}
                        </div>
                        {project.description ? (
                          <div className="mt-1 text-sm text-zinc-400">
                            {project.description}
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                )}
                <button
                  type="button"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-zinc-200 hover:bg-white/10"
                  onClick={() => {
                    setCreateMode(true);
                    setActiveProjectId(null);
                    setProjectEditDraft(newProjectDraft());
                    setProjectEditStatus("idle");
                    setProjectEditMessage(null);
                  }}
                >
                  + Nouveau projet
                </button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                {activeProject || createMode ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-zinc-200">
                        {createMode
                          ? "Nouveau projet"
                          : `Vidéos · ${activeProject?.title ?? ""}`}
                      </div>
                      {!createMode ? (
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <div>
                            {activeProjectVideos.length} vidéo
                            {activeProjectVideos.length > 1 ? "s" : ""}
                          </div>
                          {activeProject ? (
                            <Link
                              href={`/request?project=${activeProject.id}`}
                              className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200 transition hover:border-amber-300/70 hover:bg-amber-300/20"
                            >
                              Demander une soumission
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <form
                      className="mt-3 space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (createMode) {
                          void handleCreateProject();
                        } else {
                          void handleUpdateProject();
                        }
                      }}
                    >
                      <div className="space-y-2 text-sm text-zinc-300">
                        <div>
                          <span className="text-zinc-500">Titre :</span>{" "}
                          <input
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                            value={projectEditDraft.title}
                            onChange={(event) =>
                              setProjectEditDraft((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <span className="text-zinc-500">Description :</span>{" "}
                          <textarea
                            className="mt-1 min-h-[96px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                            value={projectEditDraft.description}
                            onChange={(event) =>
                              setProjectEditDraft((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Références :
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {createMode ? (
                          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-500">
                            Les vidéos apparaîtront après la création du projet.
                          </div>
                        ) : activeProjectVideos.length === 0 ? (
                          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-500">
                            Aucune vidéo associée.
                          </div>
                        ) : (
                          activeProjectVideos.map((video) => (
                            <VideoCard
                              key={`${activeProject?.id ?? "draft"}-${video.id}`}
                              video={video}
                              onOpen={(nextVideo) =>
                                setVideoModal({ open: true, video: nextVideo })
                              }
                            />
                          ))
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-zinc-300">
                        <div>
                          <span className="text-zinc-500">Type de vidéo :</span>{" "}
                          <select
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none"
                            value={projectEditDraft.videoType}
                            onChange={(event) =>
                              setProjectEditDraft((prev) => ({
                                ...prev,
                                videoType: event.target.value,
                              }))
                            }
                          >
                            <option value="">Choisir…</option>
                            <option value="Vidéo corporative">Vidéo corporative</option>
                            <option value="Publicité">Publicité</option>
                            <option value="Événement">Événement</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Captation">Captation</option>
                            <option value="Vidéoclip">Vidéoclip</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-zinc-500">Budget :</span>{" "}
                          <select
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none"
                            value={projectEditDraft.budget}
                            onChange={(event) =>
                              setProjectEditDraft((prev) => ({
                                ...prev,
                                budget: event.target.value,
                              }))
                            }
                          >
                            <option value="">Choisir…</option>
                            <option value="2000-5000">2 000$ à 5 000$</option>
                            <option value="5000-10000">5 000$ à 10 000$</option>
                            <option value="10000-20000">10 000$ à 20 000$</option>
                            <option value="20000+">20 000$ et +</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-zinc-500">Objectifs :</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {objectiveOptions.map((option) => {
                              const selected = projectEditDraft.objectives.includes(
                                option.id,
                              );
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    setProjectEditDraft((prev) => ({
                                      ...prev,
                                      objectives: toggleArrayValue(
                                        prev.objectives,
                                        option.id,
                                      ),
                                    }))
                                  }
                                  className={`rounded-full border px-2 py-1 text-xs font-semibold ${
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
                        <div>
                          <span className="text-zinc-500">Diffusion :</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {diffusionOptions.map((option) => {
                              const selected = projectEditDraft.diffusions.includes(
                                option.id,
                              );
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    setProjectEditDraft((prev) => ({
                                      ...prev,
                                      diffusions: toggleArrayValue(
                                        prev.diffusions,
                                        option.id,
                                      ),
                                    }))
                                  }
                                  className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                                    selected
                                      ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-100"
                                      : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <span className="text-zinc-500">Échéancier :</span>{" "}
                          <input
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                            value={projectEditDraft.timeline}
                            onChange={(event) =>
                              setProjectEditDraft((prev) => ({
                                ...prev,
                                timeline: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            disabled={projectEditStatus === "saving"}
                          >
                            {projectEditStatus === "saving"
                              ? "Enregistrement…"
                              : createMode
                                ? "Créer le projet"
                                : "Mettre à jour"}
                          </button>
                          {projectEditMessage ? (
                            <span
                              className={`text-xs ${
                                projectEditStatus === "error"
                                  ? "text-red-400"
                                  : "text-zinc-300"
                              }`}
                            >
                              {projectEditMessage}
                            </span>
                          ) : null}
                        </div>
                        {!createMode ? (
                          <button
                            type="button"
                            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
                            onClick={() => setProjectDeletePrompt(true)}
                          >
                            🗑 Supprimer
                          </button>
                        ) : null}
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-sm text-zinc-400">
                    Sélectionne un projet pour voir ses vidéos.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <div
        className="pointer-events-none h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      >
        {videos.slice(0, 20).map((video) => (
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
      {removePrompt.open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">
            <div className="text-base font-semibold text-white">
              Retirer la vidéo du projet ?
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              {removePrompt.video?.title ?? "Cette vidéo"} sera supprimée du projet
              sélectionné.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
                onClick={() => setRemovePrompt({ open: false, video: null })}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                onClick={() => void handleRemoveVideoFromProject()}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {projectPicker.open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between gap-4 bg-zinc-950 px-4 py-3">
              <div className="truncate text-sm font-medium text-white">
                Ajouter aux projets
              </div>
              <button
                className="rounded-md px-2 py-1 text-sm text-zinc-200 hover:bg-white/10"
                onClick={() => setProjectPicker({ open: false, video: null })}
                type="button"
              >
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-zinc-950/70 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-200">
                  Projets existants
                </div>
                {projects.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-400">
                    Aucun projet pour le moment.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => {
                      const selected = projectPickerSelection === project.id;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => setProjectPickerSelection(project.id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                            selected
                              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                              : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate">{project.title}</span>
                          {selected ? <span className="text-xs">Sélectionné</span> : null}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                        projectPickerSelection === null
                          ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-100"
                          : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      }`}
                      onClick={() => setProjectPickerSelection(null)}
                    >
                      + Créer un nouveau projet
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-200">
                  Nouveau projet
                </div>
                <div className="space-y-2">
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder="Titre"
                    value={projectPickerDraft.title}
                    onChange={(event) =>
                      setProjectPickerDraft((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <textarea
                    className="min-h-[84px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder="Description du projet"
                    value={projectPickerDraft.description}
                    onChange={(event) =>
                      setProjectPickerDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder="Budget"
                    value={projectPickerDraft.budget}
                    onChange={(event) =>
                      setProjectPickerDraft((prev) => ({
                        ...prev,
                        budget: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder="Type de vidéo"
                    value={projectPickerDraft.videoType}
                    onChange={(event) =>
                      setProjectPickerDraft((prev) => ({
                        ...prev,
                        videoType: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    placeholder="Échéancier"
                    value={projectPickerDraft.timeline}
                    onChange={(event) =>
                      setProjectPickerDraft((prev) => ({
                        ...prev,
                        timeline: event.target.value,
                      }))
                    }
                  />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Objectifs
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {objectiveOptions.map((option) => {
                        const selected = projectPickerDraft.objectives.includes(
                          option.id,
                        );
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setProjectPickerDraft((prev) => ({
                                ...prev,
                                objectives: toggleArrayValue(
                                  prev.objectives,
                                  option.id,
                                ),
                              }))
                            }
                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
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
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Diffusion
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {diffusionOptions.map((option) => {
                        const selected = projectPickerDraft.diffusions.includes(
                          option.id,
                        );
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setProjectPickerDraft((prev) => ({
                                ...prev,
                                diffusions: toggleArrayValue(
                                  prev.diffusions,
                                  option.id,
                                ),
                              }))
                            }
                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                              selected
                                ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-100"
                                : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    disabled={projectPickerStatus === "saving"}
                    onClick={() => void handleAssignVideoToProject()}
                  >
                    {projectPickerStatus === "saving"
                      ? "Ajout…"
                      : "Ajouter la vidéo"}
                  </button>
                  {projectPickerMessage ? (
                    <span className="text-xs text-red-400">
                      {projectPickerMessage}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
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
          setProjectPicker({ open: true, video });
          setProjectPickerSelection(projects[0]?.id ?? null);
          setProjectPickerDraft(newProjectDraft());
          setProjectPickerStatus("idle");
          setProjectPickerMessage(null);
        }}
      />
      {projectDeletePrompt ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">
            <div className="text-base font-semibold text-white">
              Supprimer ce projet ?
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Ce projet et ses associations de vidéos seront supprimés.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
                onClick={() => setProjectDeletePrompt(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                onClick={() => void deleteProject()}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <AppFooter />
    </div>
  );
}
