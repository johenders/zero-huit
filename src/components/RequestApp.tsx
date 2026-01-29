"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cloudflareIframeSrc, cloudflareThumbnailSrc } from "@/lib/cloudflare";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";
import type {
  Project,
  ProjectDiffusion,
  ProjectObjective,
} from "@/lib/types";
import { AuthModal } from "./AuthModal";
import levPhoto from "../../assets/Lev.jpg";

type ObjectiveOption = {
  id: ProjectObjective;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

type ProjectPrefill = Pick<Project, "id" | "title" | "objectives">;

type Audience =
  | "clients_potentiels"
  | "clients_actuels"
  | "interne"
  | "evenement"
  | "autre";


type DeliverableFormat = "horizontal" | "vertical" | "carre";

type DeliverableKey =
  | "courte_video"
  | "publicite"
  | "film_publicitaire"
  | "mini_documentaire"
  | "incertain";

type Upsell =
  | "photos_professionnelles"
  | "animation_logo"
  | "non_merci";

type BudgetOptionId =
  | "2000-5000"
  | "5000-10000"
  | "10000-20000"
  | "20000+"
  | "unknown";

type TimelineOptionId = "asap" | "1_month" | "1_3_months" | "relaxed";

type ReferralOptionId =
  | "client_actuel"
  | "bouche_a_oreille"
  | "agence"
  | "adwords"
  | "reseaux_sociaux"
  | "seo"
  | "amis";

type AudienceOption = {
  id: Audience;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

type DiffusionOption = {
  id: ProjectDiffusion;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

type DeliverableOption = {
  id: DeliverableKey;
  labelKey: string;
  descriptionKey: string;
};

type UpsellOption = {
  id: Upsell;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
};

type BudgetOption = {
  id: BudgetOptionId;
  labelKey: string;
};

type TimelineOption = {
  id: TimelineOptionId;
  labelKey: string;
  descriptionKey: string;
};

type ReferralOption = {
  id: ReferralOptionId;
  labelKey: string;
};

const objectiveOptions: ObjectiveOption[] = [
  {
    id: "promotion",
    labelKey: "request.objective.promotion.label",
    descriptionKey: "request.objective.promotion.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 10V6a2 2 0 0 1 2-2h4" />
        <path d="M20 14v4a2 2 0 0 1-2 2h-4" />
        <path d="M4 14h16" />
        <path d="M14 4l6 6" />
        <path d="M10 20l-6-6" />
      </svg>
    ),
  },
  {
    id: "recrutement",
    labelKey: "request.objective.recrutement.label",
    descriptionKey: "request.objective.recrutement.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M16 11h5" />
        <path d="M18.5 8.5v5" />
      </svg>
    ),
  },
  {
    id: "informatif",
    labelKey: "request.objective.informatif.label",
    descriptionKey: "request.objective.informatif.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6h16" />
        <path d="M4 10h16" />
        <path d="M4 14h10" />
        <path d="M4 18h7" />
      </svg>
    ),
  },
  {
    id: "divertissement",
    labelKey: "request.objective.divertissement.label",
    descriptionKey: "request.objective.divertissement.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 8h.01" />
        <path d="M17 8h.01" />
        <path d="M8 14c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: "autre",
    labelKey: "request.objective.autre.label",
    descriptionKey: "request.objective.autre.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6v12" />
        <path d="M6 12h12" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

const audienceOptions: AudienceOption[] = [
  {
    id: "clients_potentiels",
    labelKey: "request.audience.clients_potentiels.label",
    descriptionKey: "request.audience.clients_potentiels.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 8h10" />
        <path d="M4 12h7" />
        <path d="M4 16h4" />
        <circle cx="18" cy="9" r="3" />
        <path d="M16 20a4 4 0 0 1 8 0" />
      </svg>
    ),
  },
  {
    id: "clients_actuels",
    labelKey: "request.audience.clients_actuels.label",
    descriptionKey: "request.audience.clients_actuels.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="9" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
        <path d="M17 4l2 2" />
        <path d="M21 8l-2 2" />
      </svg>
    ),
  },
  {
    id: "interne",
    labelKey: "request.audience.interne.label",
    descriptionKey: "request.audience.interne.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h18" />
        <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        <path d="M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
      </svg>
    ),
  },
  {
    id: "evenement",
    labelKey: "request.audience.evenement.label",
    descriptionKey: "request.audience.evenement.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5h16" />
        <path d="M4 19h16" />
        <path d="M7 5v14" />
        <path d="M17 5v14" />
        <path d="M10 9l4 3-4 3z" />
      </svg>
    ),
  },
  {
    id: "autre",
    labelKey: "request.audience.autre.label",
    descriptionKey: "request.audience.autre.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6v12" />
        <path d="M6 12h12" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

const diffusionOptions: DiffusionOption[] = [
  {
    id: "reseaux_sociaux",
    labelKey: "request.diffusion.reseaux_sociaux.label",
    descriptionKey: "request.diffusion.reseaux_sociaux.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="12" r="3" />
        <circle cx="17" cy="6" r="3" />
        <circle cx="17" cy="18" r="3" />
        <path d="M10 11l4-3" />
        <path d="M10 13l4 3" />
      </svg>
    ),
  },
  {
    id: "web",
    labelKey: "request.diffusion.web.label",
    descriptionKey: "request.diffusion.web.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M2.5 12h19" />
        <path d="M12 2.5c2.5 2.8 2.5 16.2 0 19" />
      </svg>
    ),
  },
  {
    id: "tv",
    labelKey: "request.diffusion.tv.label",
    descriptionKey: "request.diffusion.tv.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M8 3l4 4 4-4" />
      </svg>
    ),
  },
  {
    id: "interne",
    labelKey: "request.diffusion.interne.label",
    descriptionKey: "request.diffusion.interne.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
      </svg>
    ),
  },
  {
    id: "autre",
    labelKey: "request.diffusion.autre.label",
    descriptionKey: "request.diffusion.autre.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6v12" />
        <path d="M6 12h12" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];


const deliverableOptions: DeliverableOption[] = [
  {
    id: "courte_video",
    labelKey: "request.deliverable.courte_video.label",
    descriptionKey: "request.deliverable.courte_video.desc",
  },
  {
    id: "publicite",
    labelKey: "request.deliverable.publicite.label",
    descriptionKey: "request.deliverable.publicite.desc",
  },
  {
    id: "film_publicitaire",
    labelKey: "request.deliverable.film_publicitaire.label",
    descriptionKey: "request.deliverable.film_publicitaire.desc",
  },
  {
    id: "mini_documentaire",
    labelKey: "request.deliverable.mini_documentaire.label",
    descriptionKey: "request.deliverable.mini_documentaire.desc",
  },
  {
    id: "incertain",
    labelKey: "request.deliverable.incertain.label",
    descriptionKey: "request.deliverable.incertain.desc",
  },
];

const upsellOptions: UpsellOption[] = [
  {
    id: "photos_professionnelles",
    labelKey: "request.upsell.photos_professionnelles.label",
    descriptionKey: "request.upsell.photos_professionnelles.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7h4l2-2h4l2 2h4" />
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
  {
    id: "animation_logo",
    labelKey: "request.upsell.animation_logo.label",
    descriptionKey: "request.upsell.animation_logo.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7z" />
        <path d="M12 8l3 3-3 3-3-3z" />
      </svg>
    ),
  },
  {
    id: "non_merci",
    labelKey: "request.upsell.non_merci.label",
    descriptionKey: "request.upsell.non_merci.desc",
    icon: (
      <svg
        aria-hidden
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 8l8 8" />
        <path d="M16 8l-8 8" />
      </svg>
    ),
  },
];

const budgetOptions: BudgetOption[] = [
  { id: "2000-5000", labelKey: "request.budget.2000-5000" },
  { id: "5000-10000", labelKey: "request.budget.5000-10000" },
  { id: "10000-20000", labelKey: "request.budget.10000-20000" },
  { id: "20000+", labelKey: "request.budget.20000plus" },
  { id: "unknown", labelKey: "request.budget.unknown" },
];

const timelineOptions: TimelineOption[] = [
  {
    id: "asap",
    labelKey: "request.timeline.asap.label",
    descriptionKey: "request.timeline.asap.desc",
  },
  {
    id: "1_month",
    labelKey: "request.timeline.1_month.label",
    descriptionKey: "request.timeline.1_month.desc",
  },
  {
    id: "1_3_months",
    labelKey: "request.timeline.1_3_months.label",
    descriptionKey: "request.timeline.1_3_months.desc",
  },
  {
    id: "relaxed",
    labelKey: "request.timeline.relaxed.label",
    descriptionKey: "request.timeline.relaxed.desc",
  },
];

const referralOptions: ReferralOption[] = [
  { id: "client_actuel", labelKey: "request.referral.client_actuel" },
  { id: "bouche_a_oreille", labelKey: "request.referral.bouche_a_oreille" },
  { id: "agence", labelKey: "request.referral.agence" },
  { id: "adwords", labelKey: "request.referral.adwords" },
  { id: "reseaux_sociaux", labelKey: "request.referral.reseaux_sociaux" },
  { id: "amis", labelKey: "request.referral.amis" },
  { id: "seo", labelKey: "request.referral.seo" },
];

function toggleArrayValue<T extends string>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function RequestApp() {
  const supabase = useSupabaseClient();
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedReferenceId = searchParams.get("referenceId");
  const preselectAppliedRef = useRef(false);
  const projectId = searchParams.get("project");

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [objectives, setObjectives] = useState<ProjectObjective[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [diffusions, setDiffusions] = useState<ProjectDiffusion[]>([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [shootingLocations, setShootingLocations] = useState("");
  const [deliverables, setDeliverables] = useState<
    Record<Exclude<DeliverableKey, "incertain">, number>
  >({
    courte_video: 0,
    publicite: 0,
    film_publicitaire: 0,
    mini_documentaire: 0,
  });
  const [deliverableFormatsByKey, setDeliverableFormatsByKey] = useState<
    Partial<Record<Exclude<DeliverableKey, "incertain">, DeliverableFormat[]>>
  >({});
  const [deliverableUnknown, setDeliverableUnknown] = useState(false);
  const [needsSubtitles, setNeedsSubtitles] = useState<null | boolean>(null);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [budgetChoice, setBudgetChoice] = useState<BudgetOptionId | "">("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timelineChoice, setTimelineChoice] = useState<TimelineOptionId | "">(
    "",
  );
  const [referralChoice, setReferralChoice] = useState<ReferralOptionId | "">(
    "",
  );
  const [referenceStatus, setReferenceStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [referenceMessage, setReferenceMessage] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");
  const [referenceDebug, setReferenceDebug] = useState<{
    objectives?: string[];
    audiences?: string[];
    budget?: string | null;
    durations?: string[];
    matchedKeywordLabels?: string[];
    allowedTypes?: string[];
    allowedObjectifs?: string[];
    priorityObjectifs?: string[];
    removedTypes?: string[];
    activeDurationFilters?: string[];
    reasonsByVideoId?: Record<string, string[]>;
  } | null>(null);
  const [referenceVideos, setReferenceVideos] = useState<
    Array<{
      id: string;
      title: string;
      cloudflare_uid: string;
      thumbnail_time_seconds: number | null;
      budget_min: number | null;
      budget_max: number | null;
    }>
  >([]);
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [referenceModal, setReferenceModal] = useState<{
    open: boolean;
    video: { id: string; title: string; cloudflare_uid: string } | null;
  }>({ open: false, video: null });
  const [project, setProject] = useState<ProjectPrefill | null>(null);
  const [projectStatus, setProjectStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const hasStarted =
    Boolean(
      name.trim() ||
        company.trim() ||
        email.trim() ||
        phone.trim() ||
        projectDescription.trim() ||
        shootingLocations.trim() ||
        objectives.length ||
        audiences.length ||
        diffusions.length ||
        Object.values(deliverables).some((value) => value > 0) ||
        Object.values(deliverableFormatsByKey).some(
          (formats) => formats && formats.length > 0,
        ) ||
        deliverableUnknown ||
        needsSubtitles !== null ||
        upsells.length ||
        budgetChoice ||
        timelineChoice ||
        referralChoice ||
        selectedReferenceIds.size > 0,
    ) || step > 0;

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setProjectStatus("idle");
      setProjectMessage(null);
      return;
    }

    let ignore = false;
    async function loadProject() {
      setProjectStatus("loading");
      setProjectMessage(null);
      const { data, error } = await supabase
        .from("projects")
        .select("id,title,objectives")
        .eq("id", projectId)
        .maybeSingle();
      if (ignore) return;
      if (error || !data) {
        setProject(null);
        setProjectStatus("error");
        setProjectMessage(
          error?.message ?? t("request.project.error"),
        );
        return;
      }
      setProject(data as ProjectPrefill);
      if (Array.isArray(data.objectives) && data.objectives.length > 0) {
        setObjectives(data.objectives as ProjectObjective[]);
      }
      setProjectStatus("idle");
    }

    void loadProject();
    return () => {
      ignore = true;
    };
  }, [projectId, supabase, t]);

  useEffect(() => {
    const selectedDurations = Object.entries(deliverables)
      .filter(([, quantity]) => quantity > 0)
      .map(([key]) => key);
    const hasCriteria =
      Boolean(budgetChoice && budgetChoice !== "unknown") ||
      objectives.length > 0 ||
      audiences.length > 0 ||
      selectedDurations.length > 0 ||
      projectDescription.trim().length > 12;
    if (!hasCriteria) return;

    setReferenceStatus("loading");
    setReferenceMessage(null);
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            budget: budgetChoice === "unknown" ? null : budgetChoice || null,
            objectives,
            audiences,
            durations: deliverableUnknown ? ["incertain"] : selectedDurations,
            description: projectDescription,
            excludeIds: [],
            limit: 6,
          }),
        });
        const json = (await response.json()) as
          | {
              videos: typeof referenceVideos;
              debug?: {
                objectives?: string[];
                audiences?: string[];
                budget?: string | null;
                durations?: string[];
                matchedKeywordLabels?: string[];
                allowedTypes?: string[];
                allowedObjectifs?: string[];
                priorityObjectifs?: string[];
                removedTypes?: string[];
                activeDurationFilters?: string[];
                reasonsByVideoId?: Record<string, string[]>;
              } | null;
            }
          | { error: string };
        if (!response.ok || "error" in json) {
          throw new Error("error" in json ? json.error : t("request.ai.error"));
        }
        setReferenceVideos(json.videos);
        setReferenceDebug("debug" in json ? json.debug ?? null : null);
        setSelectedReferenceIds(new Set());
        setReferenceStatus("idle");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setReferenceStatus("error");
        setReferenceMessage(
          error instanceof Error ? error.message : t("request.ai.error"),
        );
      }
    }, 650);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    budgetChoice,
    deliverableUnknown,
    deliverables,
    objectives,
    projectDescription,
    audiences,
    t,
  ]);

  useEffect(() => {
    if (!preselectedReferenceId || preselectAppliedRef.current) return;
    if (!referenceVideos.some((video) => video.id === preselectedReferenceId)) return;
    setSelectedReferenceIds((prev) => {
      if (prev.has(preselectedReferenceId)) return prev;
      const next = new Set(prev);
      next.add(preselectedReferenceId);
      return next;
    });
    preselectAppliedRef.current = true;
  }, [preselectedReferenceId, referenceVideos]);

  async function handleLoadMoreReferences() {
    if (referenceStatus === "loading") return;
    setReferenceStatus("loading");
    setReferenceMessage(null);
    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: budgetChoice === "unknown" ? null : budgetChoice || null,
          objectives,
          audiences,
          durations: deliverableUnknown
            ? ["incertain"]
            : Object.entries(deliverables)
                .filter(([, quantity]) => quantity > 0)
                .map(([key]) => key),
          description: projectDescription,
          excludeIds: referenceVideos.map((video) => video.id),
          limit: 6,
        }),
      });
      const json = (await response.json()) as
        | {
            videos: typeof referenceVideos;
            debug?: {
              objectives?: string[];
              audiences?: string[];
              budget?: string | null;
              durations?: string[];
              matchedKeywordLabels?: string[];
              allowedTypes?: string[];
              allowedObjectifs?: string[];
              priorityObjectifs?: string[];
              removedTypes?: string[];
              activeDurationFilters?: string[];
              reasonsByVideoId?: Record<string, string[]>;
            } | null;
          }
        | { error: string };
      if (!response.ok || "error" in json) {
        throw new Error("error" in json ? json.error : t("request.ai.error"));
      }
      setReferenceVideos((prev) => [...prev, ...json.videos]);
      if ("debug" in json && json.debug) setReferenceDebug(json.debug);
      setReferenceStatus("idle");
    } catch (error) {
      setReferenceStatus("error");
      setReferenceMessage(
        error instanceof Error ? error.message : t("request.ai.error"),
      );
    }
  }

  const canGoNext =
    step === 0 ? Boolean(name.trim() && company.trim() && email.trim()) : true;

  return (
    <div className="min-h-screen text-zinc-100">
      <main className="relative flex min-h-screen flex-col overflow-hidden px-4 pb-24 pt-10 lg:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-rose-500/25 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <button
          className="absolute right-6 top-6 z-20 rounded-full border border-white/10 bg-black/40 p-2 text-white hover:bg-white/10"
          type="button"
          aria-label={t("request.exit.aria")}
          onClick={() => {
            if (hasStarted) {
              const ok = confirm(t("request.exit.confirm"));
              if (!ok) return;
            }
            router.push(withLocaleHref(locale, "/"));
          }}
        >
          <svg
            aria-hidden
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
          {submissionStatus === "sent" ? (
            <div className="w-full max-w-3xl space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-[2px] motion-safe:animate-[successPop_600ms_ease-out]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-black/80 text-3xl text-white">
                  ✓
                </div>
              </div>
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.sent.title")}
              </h1>
              <p className="text-sm text-zinc-300">
                {t("request.sent.subtitle")}
              </p>
              <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 text-left sm:flex-row sm:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src={levPhoto}
                    alt="Lev Rapoport"
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="space-y-1 text-sm text-zinc-200">
                  <div className="text-base font-semibold text-white">Lev Rapoport</div>
                  <div>{t("request.sent.role")}</div>
                  <div>lev@zerohuit.ca</div>
                  <div>450.395.1777 poste 4</div>
                </div>
              </div>
              <div className="flex justify-center">
                <a
                  href={withLocaleHref(locale, "/")}
                  className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200 hover:bg-white/10"
                >
                  {t("request.sent.back")}
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
                <span>{t("request.title")}</span>
                <span className="h-px w-6 bg-white/10" />
                <span>
                  {t("request.step.label")} {step + 1} / 12
                </span>
              </div>

          {project ? (
            <div className="mb-8 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-200">
              {t("request.prefill")} {project.title}
            </div>
          ) : null}

          {projectStatus === "error" && projectMessage ? (
            <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {projectMessage}
            </div>
          ) : null}

          {step === 0 ? (
            <form
              className="w-full space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                if (canGoNext) setStep(1);
              }}
            >
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step1.title")}
              </h1>
              <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
                <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step1.name.label")}
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("request.step1.name.placeholder")}
                    className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </label>
                <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step1.company.label")}
                  </span>
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder={t("request.step1.company.placeholder")}
                    className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </label>
                <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step1.email.label")}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("request.step1.email.placeholder")}
                    autoComplete="email"
                    className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </label>
                <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step1.phone.label")}
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={t("request.step1.phone.placeholder")}
                    autoComplete="tel"
                    className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </label>
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={!canGoNext}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </form>
          ) : step === 1 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step2.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step2.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                {objectiveOptions.map((option) => {
                  const selected = objectives.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setObjectives((prev) =>
                          toggleArrayValue(prev, option.id),
                        )
                      }
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-amber-300/60 bg-amber-300/10 text-amber-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                          selected
                            ? "border-amber-300/60 bg-amber-300/20 text-amber-200"
                            : "border-white/10 bg-white/5 text-zinc-300 group-hover:border-white/30"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {t(option.labelKey)}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {t(option.descriptionKey)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step3.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step3.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                {audienceOptions.map((option) => {
                  const selected = audiences.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setAudiences((prev) =>
                          toggleArrayValue(prev, option.id),
                        )
                      }
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                          selected
                            ? "border-cyan-300/60 bg-cyan-300/20 text-cyan-200"
                            : "border-white/10 bg-white/5 text-zinc-300 group-hover:border-white/30"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {t(option.labelKey)}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {t(option.descriptionKey)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step4.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step4.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                {diffusionOptions.map((option) => {
                  const selected = diffusions.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setDiffusions((prev) =>
                          toggleArrayValue(prev, option.id),
                        )
                      }
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                          selected
                            ? "border-emerald-300/60 bg-emerald-300/20 text-emerald-200"
                            : "border-white/10 bg-white/5 text-zinc-300 group-hover:border-white/30"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {t(option.labelKey)}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {t(option.descriptionKey)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step5.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step5.subtitle")}
              </p>
              <div className="mx-auto mt-6 w-full max-w-3xl space-y-5 text-left">
                <label className="block space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step5.description.label")}
                  </span>
                  <textarea
                    value={projectDescription}
                    onChange={(event) => setProjectDescription(event.target.value)}
                    placeholder={t("request.step5.description.placeholder")}
                    className="min-h-[160px] w-full resize-none bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </label>
                <label className="block space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                  <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step5.locations.label")}
                  </span>
                  <input
                    value={shootingLocations}
                    onChange={(event) => setShootingLocations(event.target.value)}
                    placeholder={t("request.step5.locations.placeholder")}
                    className="w-full bg-transparent text-lg font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </label>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 5 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step6.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step6.subtitle")}
              </p>
              <div className="mx-auto mt-6 w-full max-w-4xl space-y-4 text-left">
                {deliverableOptions.map((option) => {
                  if (option.id === "incertain") {
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setDeliverableUnknown((prev) => {
                            const next = !prev;
                            if (next) {
                              setDeliverables({
                                courte_video: 0,
                                publicite: 0,
                                film_publicitaire: 0,
                                mini_documentaire: 0,
                              });
                              setDeliverableFormatsByKey({});
                            }
                            return next;
                          });
                        }}
                        className={`group flex w-full items-center justify-between gap-4 rounded-2xl border p-5 transition ${
                          deliverableUnknown
                            ? "border-amber-300/60 bg-amber-300/10 text-amber-100"
                            : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                        }`}
                      >
                        <div>
                          <div className="text-lg font-semibold">
                            {t(option.labelKey)}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {t(option.descriptionKey)}
                          </div>
                        </div>
                        <div
                          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                            deliverableUnknown
                              ? "border-amber-300/60 text-amber-100"
                              : "border-white/10 text-zinc-500"
                          }`}
                        >
                          {deliverableUnknown
                            ? t("request.step6.unknown.selected")
                            : t("request.step6.unknown.option")}
                        </div>
                      </button>
                    );
                  }

                  const deliverableKey = option.id as Exclude<
                    DeliverableKey,
                    "incertain"
                  >;
                  const quantity = deliverables[deliverableKey];
                  const formats = deliverableFormatsByKey[deliverableKey] ?? [];
                  const selected = quantity > 0;
                  const formatButton = (value: DeliverableFormat, label: string) => (
                    <button
                      type="button"
                      onClick={() =>
                        setDeliverableFormatsByKey((prev) => ({
                          ...prev,
                          [deliverableKey]: toggleArrayValue(
                            prev[deliverableKey] ?? [],
                            value,
                          ),
                        }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                        formats.includes(value)
                          ? "border-emerald-300/70 bg-emerald-300/20 text-emerald-100"
                          : "border-white/10 text-zinc-400 hover:border-white/30"
                      }`}
                    >
                      {label}
                    </button>
                  );

                  return (
                    <div
                      key={option.id}
                      className={`rounded-2xl border p-5 transition ${
                        selected
                          ? "border-emerald-300/50 bg-emerald-300/10"
                          : "border-white/10 bg-black/30"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-zinc-100">
                            {t(option.labelKey)}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {t(option.descriptionKey)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDeliverables((prev) => ({
                                ...prev,
                                [deliverableKey]: Math.max(
                                  0,
                                  prev[deliverableKey] - 1,
                                ),
                              }))
                            }
                            className="h-9 w-9 rounded-full border border-white/10 text-xl text-zinc-200 hover:bg-white/10"
                            aria-label={`${t("request.step6.remove")} ${t(option.labelKey)}`}
                          >
                            -
                          </button>
                          <div className="min-w-[32px] text-center text-lg font-semibold text-white">
                            {quantity}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDeliverables((prev) => ({
                                ...prev,
                                [deliverableKey]: prev[deliverableKey] + 1,
                              }));
                              setDeliverableUnknown(false);
                            }}
                            className="h-9 w-9 rounded-full border border-white/10 text-xl text-zinc-200 hover:bg-white/10"
                            aria-label={`${t("request.step6.add")} ${t(option.labelKey)}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {formatButton("horizontal", t("request.step6.format.horizontal"))}
                        {formatButton("vertical", t("request.step6.format.vertical"))}
                        {formatButton("carre", t("request.step6.format.square"))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mx-auto mt-8 w-full max-w-4xl space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-left">
                <div className="text-sm font-semibold text-zinc-200">
                  {t("request.step6.subtitles.title")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: true, label: t("request.yes") },
                    { value: false, label: t("request.no") },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setNeedsSubtitles(option.value)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                        needsSubtitles === option.value
                          ? "border-fuchsia-300/70 bg-fuchsia-300/20 text-fuchsia-100"
                          : "border-white/10 text-zinc-400 hover:border-white/30"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 6 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step7.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step7.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                {upsellOptions.map((option) => {
                  const selected = upsells.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setUpsells((prev) => {
                          if (option.id === "non_merci") {
                            return prev.includes("non_merci")
                              ? []
                              : ["non_merci"];
                          }
                          const next = toggleArrayValue(prev, option.id);
                          return next.filter((item) => item !== "non_merci");
                        })
                      }
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-sky-300/60 bg-sky-300/10 text-sky-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                          selected
                            ? "border-sky-300/60 bg-sky-300/20 text-sky-200"
                            : "border-white/10 bg-white/5 text-zinc-300 group-hover:border-white/30"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {t(option.labelKey)}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {t(option.descriptionKey)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 7 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step8.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step8.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
                {budgetOptions.map((option) => {
                  const selected = budgetChoice === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBudgetChoice(option.id)}
                      className={`rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      {t(option.labelKey)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(8)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 8 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step9.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step9.subtitle")}
              </p>
              {referenceDebug ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-left text-xs text-zinc-200">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    {t("request.step9.debug")}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-[11px] text-zinc-500">
                        {t("request.step9.debug.step1")}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.objectives")}:{" "}
                        {(referenceDebug.objectives ?? []).join(", ") || "—"}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.allowedTypes")}:{" "}
                        {(referenceDebug.allowedTypes ?? []).join(", ") || "—"}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.allowedObjectives")}:{" "}
                        {(referenceDebug.allowedObjectifs ?? []).join(", ") || "—"}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.priorityObjectives")}:{" "}
                        {(referenceDebug.priorityObjectifs ?? []).join(", ") || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-500">
                        {t("request.step9.debug.step2")}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.audiences")}:{" "}
                        {(referenceDebug.audiences ?? []).join(", ") || "—"}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.removedTypes")}:{" "}
                        {(referenceDebug.removedTypes ?? []).join(", ") || "—"}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.budget")}: {referenceDebug.budget ?? "—"}
                      </div>
                      <div className="mt-1">
                        {t("request.step9.debug.durations")}:{" "}
                        {(referenceDebug.activeDurationFilters ?? []).join(", ") ||
                          (referenceDebug.durations ?? []).join(", ") ||
                          "—"}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] text-zinc-500">
                        {t("request.step9.debug.keywords")}
                      </div>
                      <div className="mt-1">
                        {(referenceDebug.matchedKeywordLabels ?? []).join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {referenceStatus === "loading" && referenceVideos.length === 0 ? (
                <div className="mt-8 flex items-center justify-center">
                  <span className="inline-flex h-8 w-8 animate-spin rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 p-[2px]">
                    <span className="h-full w-full rounded-full bg-black/60" />
                  </span>
                </div>
              ) : null}
              {referenceStatus === "error" ? (
                <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {referenceMessage ?? t("request.step9.error")}
                </div>
              ) : null}
              {referenceVideos.length === 0 && referenceStatus !== "loading" ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-400">
                  {t("request.step9.empty")}
                </div>
              ) : referenceVideos.length > 0 ? (
                <div className="mt-8 space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {selectedReferenceIds.size}{" "}
                    {selectedReferenceIds.size > 1
                      ? t("request.step9.selection.plural")
                      : t("request.step9.selection.singular")}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {referenceVideos.map((video) => {
                      const isSelected = selectedReferenceIds.has(video.id);
                      return (
                        <div
                          key={video.id}
                          className={`group overflow-hidden rounded-2xl border bg-black/30 transition ${
                            isSelected
                              ? "border-emerald-300/60"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <button
                            type="button"
                            className="relative block w-full text-left"
                            onClick={() =>
                              setReferenceModal({
                                open: true,
                                video: {
                                  id: video.id,
                                  title: video.title,
                                  cloudflare_uid: video.cloudflare_uid,
                                },
                              })
                            }
                          >
                            <div className="relative aspect-video w-full overflow-hidden">
                              <img
                                src={cloudflareThumbnailSrc(
                                  video.cloudflare_uid,
                                  video.thumbnail_time_seconds,
                                )}
                                alt=""
                                className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-80" />
                            </div>
                            <div className="p-3">
                              <div className="text-sm font-semibold text-zinc-100">
                                {video.title}
                              </div>
                              {referenceDebug?.reasonsByVideoId?.[video.id]?.length ? (
                                <div className="mt-2 text-xs text-zinc-500">
                                  {t("request.step9.reason")}:{" "}
                                  {referenceDebug.reasonsByVideoId[video.id].join(", ")}
                                </div>
                              ) : null}
                            </div>
                          </button>
                          <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-xs text-zinc-400">
                            <span>{t("request.step9.choose")}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedReferenceIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(video.id)) {
                                    next.delete(video.id);
                                  } else {
                                    next.add(video.id);
                                  }
                                  return next;
                                })
                              }
                              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                                isSelected
                                  ? "border-emerald-300/70 bg-emerald-300/20 text-emerald-100"
                                  : "border-white/10 text-zinc-400 hover:border-white/30"
                              }`}
                            >
                              {isSelected
                                ? t("request.step9.selected")
                                : t("request.step9.choose")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => void handleLoadMoreReferences()}
                      disabled={referenceStatus === "loading"}
                      className="rounded-full border border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {referenceStatus === "loading"
                        ? t("request.step9.loading")
                        : t("request.step9.loadMore")}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 9 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step10.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step10.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                {timelineOptions.map((option) => {
                  const selected = timelineChoice === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTimelineChoice(option.id)}
                      className={`group flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-amber-300/60 bg-amber-300/10 text-amber-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                          selected
                            ? "border-amber-300/60 bg-amber-300/20 text-amber-200"
                            : "border-white/10 bg-white/5 text-zinc-300 group-hover:border-white/30"
                        }`}
                      >
                        <svg
                          aria-hidden
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {t(option.labelKey)}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {t(option.descriptionKey)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(8)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(10)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 10 ? (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step11.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step11.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
                {referralOptions.map((option) => {
                  const selected = referralChoice === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setReferralChoice(option.id)}
                      className={`rounded-2xl border px-5 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-sky-300/60 bg-sky-300/10 text-sky-100"
                          : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"
                      }`}
                    >
                      {t(option.labelKey)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(11)}
                  disabled={!referralChoice}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/60"
                >
                  {t("request.nav.nextStep")}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.step12.title")}
              </h1>
              <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionStatus("sending");
                    setTimeout(() => setSubmissionStatus("sent"), 600);
                  }}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/20"
                >
                  {t("request.step12.submit")}
                </button>
                <p className="text-sm text-zinc-400">
                  {t("request.step12.subtitle")}
                </p>
              </div>
              <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 text-left md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.identity.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    <div>
                      {t("request.step12.identity.name")}: {name || "—"}
                    </div>
                    <div>
                      {t("request.step12.identity.company")}: {company || "—"}
                    </div>
                    <div>
                      {t("request.step12.identity.email")}: {email || "—"}
                    </div>
                    <div>
                      {t("request.step12.identity.phone")}: {phone || "—"}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.objectives.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    <div>
                      {t("request.step12.objectives.label")}:{" "}
                      {objectives
                        .map(
                          (id) =>
                            t(
                              objectiveOptions.find((o) => o.id === id)?.labelKey ??
                                id,
                            ),
                        )
                        .join(", ") || "—"}
                    </div>
                    <div className="mt-1">
                      {t("request.step12.audience.label")}:{" "}
                      {audiences
                        .map(
                          (id) =>
                            t(
                              audienceOptions.find((o) => o.id === id)?.labelKey ??
                                id,
                            ),
                        )
                        .join(", ") || "—"}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.budget.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    <div>
                      {t("request.step12.budget.label")}:{" "}
                      {budgetChoice
                        ? t(
                            budgetOptions.find((b) => b.id === budgetChoice)
                              ?.labelKey ?? budgetChoice,
                          )
                        : "—"}
                    </div>
                    <div className="mt-1">
                      {t("request.step12.durations.label")}:{" "}
                      {(deliverableUnknown
                        ? [t("request.step12.durations.unknown")]
                        : Object.entries(deliverables)
                            .filter(([, quantity]) => quantity > 0)
                            .map(([key]) => {
                              const option = deliverableOptions.find(
                                (item) => item.id === key,
                              );
                              return t(option?.labelKey ?? key);
                            })
                      ).join(", ") || "—"}
                    </div>
                    <div className="mt-1">
                      {t("request.step12.subtitles.label")}:{" "}
                      {needsSubtitles === null
                        ? "—"
                        : needsSubtitles
                          ? t("request.yes")
                          : t("request.no")}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.diffusion.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    <div>
                      {t("request.step12.diffusion.label")}:{" "}
                      {diffusions
                        .map(
                          (id) =>
                            t(
                              diffusionOptions.find((o) => o.id === id)?.labelKey ??
                                id,
                            ),
                        )
                        .join(", ") || "—"}
                    </div>
                    <div className="mt-1">
                      {t("request.step12.timeline.label")}:{" "}
                      {timelineChoice
                        ? t(
                            timelineOptions.find((t) => t.id === timelineChoice)
                              ?.labelKey ?? timelineChoice,
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.description.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {projectDescription.trim() || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.locations.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {shootingLocations.trim() || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.references.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {referenceVideos
                      .filter((video) => selectedReferenceIds.has(video.id))
                      .map((video) => video.title)
                      .join(", ") || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("request.step12.referral.title")}
                  </div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {referralChoice
                      ? t(
                          referralOptions.find((r) => r.id === referralChoice)
                            ?.labelKey ?? referralChoice,
                        )
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(10)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {referenceModal.open && referenceModal.video ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between gap-4 bg-zinc-950 px-4 py-3">
              <div className="truncate text-sm font-medium text-white">
                {referenceModal.video.title}
              </div>
              <button
                className="rounded-md px-2 py-1 text-sm text-zinc-200 hover:bg-white/10"
                onClick={() =>
                  setReferenceModal({ open: false, video: null })
                }
                type="button"
              >
                {t("request.modal.close")}
              </button>
            </div>
            <div className="bg-zinc-950/70 p-4">
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <iframe
                  className="h-full w-full"
                  src={cloudflareIframeSrc(referenceModal.video.cloudflare_uid)}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title={referenceModal.video.title}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
