"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";
import type { ProjectDiffusion } from "@/lib/types";
import levPhoto from "../../assets/Lev.jpg";
import logoSymbol from "../../assets/zero_huit_symbole.png";

type ObjectiveOption = {
  id: string;
  label?: string;
  labelKey: string;
  descriptionKey?: string;
  icon?: React.ReactNode;
};

type Audience =
  | "clients_potentiels"
  | "clients_actuels"
  | "grand_public"
  | "interne"
  | "evenement"
  | "autre";

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

type RequestMode = "quote" | "booking";

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

type GtagWindow = Window & {
  gtag?: (
    command: "event",
    eventName: string,
    parameters?: Record<string, string>,
  ) => void;
};

function trackDemandeFormSubmit(locale: string) {
  if (typeof window === "undefined") return;

  const { gtag } = window as GtagWindow;
  if (typeof gtag !== "function") return;

  gtag("event", "demande_form_submit", {
    form_id: "demande",
    form_name: "Demande de soumission",
    language: locale,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
}

function trackAppointmentBookingSubmit(locale: string) {
  if (typeof window === "undefined") return;

  const { gtag } = window as GtagWindow;
  if (typeof gtag !== "function") return;

  gtag("event", "appointment_booking_submit", {
    form_id: "demande_rendez_vous",
    form_name: "Prise de rendez-vous",
    language: locale,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
}

const fallbackObjectiveOptions: ObjectiveOption[] = [
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

function normalizeObjectiveLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function objectiveIcon(label: string) {
  const normalized = normalizeObjectiveLabel(label);

  if (normalized.includes("promotion")) {
    return (
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
        <path d="M4 13V7a2 2 0 0 1 2-2h4" />
        <path d="M20 11v6a2 2 0 0 1-2 2h-4" />
        <path d="M7 16l10-8" />
        <path d="M14 8h3v3" />
      </svg>
    );
  }

  if (normalized.includes("recrutement")) {
    return (
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
        <path d="M17 11h4" />
        <path d="M19 9v4" />
      </svg>
    );
  }

  if (normalized.includes("notoriete")) {
    return (
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
        <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3z" />
      </svg>
    );
  }

  if (normalized.includes("informatif")) {
    return (
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
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </svg>
    );
  }

  if (normalized.includes("educatif")) {
    return (
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
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M8 8h8" />
        <path d="M8 12h6" />
      </svg>
    );
  }

  if (normalized.includes("evenement")) {
    return (
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
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 13h3" />
        <path d="M13 13h3" />
        <path d="M8 17h3" />
      </svg>
    );
  }

  if (normalized.includes("communautaire")) {
    return (
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
        <circle cx="8" cy="9" r="3" />
        <circle cx="16" cy="9" r="3" />
        <path d="M3 20a5 5 0 0 1 10 0" />
        <path d="M11 20a5 5 0 0 1 10 0" />
      </svg>
    );
  }

  if (normalized.includes("divertissement")) {
    return (
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
    );
  }

  return (
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
  );
}

const objectiveOrder = [
  "promotionnelle",
  "recrutement",
  "informatif",
  "evenementiel",
  "educatif",
  "communautaire",
  "notoriete",
];

function objectiveOrderIndex(label: string) {
  const normalized = normalizeObjectiveLabel(label);
  const index = objectiveOrder.findIndex((entry) => normalized.includes(entry));
  return index === -1 ? objectiveOrder.length : index;
}

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
    id: "grand_public",
    labelKey: "request.audience.grand_public.label",
    descriptionKey: "request.audience.grand_public.desc",
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
        <path d="M7 11a3 3 0 1 1 6 0" />
        <path d="M4 20a6 6 0 0 1 10 0" />
        <path d="M16 9a3 3 0 1 1 0 6" />
        <path d="M18.5 20a4.5 4.5 0 0 0-3.5-4.4" />
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

type RequestAppProps = {
  initialObjectiveOptions?: Array<{ id: string; label: string }>;
};

export function RequestApp({ initialObjectiveOptions = [] }: RequestAppProps) {
  const { locale, t } = useI18n();
  const privacyHref = locale === "en" ? "/en/privacy" : "/politique-de-confidentialite";
  const router = useRouter();

  const [mode, setMode] = useState<RequestMode | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const objectiveOptions: ObjectiveOption[] =
    initialObjectiveOptions.length > 0
      ? [...initialObjectiveOptions]
          .sort((a, b) => {
            const orderDiff =
              objectiveOrderIndex(a.label) - objectiveOrderIndex(b.label);
            if (orderDiff !== 0) return orderDiff;
            return a.label.localeCompare(b.label, "fr");
          })
          .map((option) => ({
            id: option.id,
            label: option.label,
            labelKey: option.label,
            icon: objectiveIcon(option.label),
          }))
      : fallbackObjectiveOptions;
  const objectiveLabelById = new Map(
    [
      ...objectiveOptions.map(
        (option) =>
          [option.id, option.label ?? t(option.labelKey)] as [string, string],
      ),
      ["autre", t("request.unknown")] as [string, string],
    ],
  );

  const [objectives, setObjectives] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [diffusions, setDiffusions] = useState<ProjectDiffusion[]>([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [shootingLocations, setShootingLocations] = useState("");
  const [budgetChoice, setBudgetChoice] = useState<BudgetOptionId | "">("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timelineChoice, setTimelineChoice] = useState<TimelineOptionId | "">(
    "",
  );
  const [referralChoice, setReferralChoice] = useState<ReferralOptionId | "">(
    "",
  );
  const [website] = useState("");
  const [appointmentStart, setAppointmentStart] = useState("");
  const [appointmentRefreshKey, setAppointmentRefreshKey] = useState(0);
  const [bookedAppointmentStart, setBookedAppointmentStart] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "sending" | "sent"
  >("idle");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const hasStarted =
    Boolean(
      mode ||
        name.trim() ||
        company.trim() ||
        email.trim() ||
        phone.trim() ||
        projectDescription.trim() ||
        shootingLocations.trim() ||
        objectives.length ||
        audiences.length ||
        diffusions.length ||
        budgetChoice ||
        timelineChoice ||
        referralChoice ||
        appointmentStart,
    ) || step !== 0;

  const canGoNext = step === 0 ? Boolean(name.trim() && company.trim()) : true;
  const canSubmit = Boolean(
    name.trim() &&
      company.trim() &&
      email.trim() &&
      (mode !== "booking" ||
        (appointmentStart && budgetChoice && referralChoice)),
  );

  async function submitRequest() {
    if (submissionStatus === "sending") return;
    setSubmissionStatus("sending");
    setSubmissionMessage(null);
    try {
      if (mode === "booking") {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            start: appointmentStart,
            name,
            company,
            email,
            phone,
            budget: budgetChoice,
            referral: referralChoice,
            website,
          }),
        });
        const json = (await response.json()) as {
          error?: string;
          appointment?: { start?: string };
        };
        if (!response.ok) {
          if (response.status === 409 || json.error === "slot_unavailable") {
            setStep(-1);
            setAppointmentStart("");
            setAppointmentRefreshKey((current) => current + 1);
            throw new Error("slot_unavailable");
          }
          if (response.status === 429 || json.error === "rate_limited") {
            throw new Error("rate_limited");
          }
          throw new Error(json.error || "submit_failed");
        }
        setBookedAppointmentStart(
          json.appointment?.start || appointmentStart,
        );
        trackAppointmentBookingSubmit(locale);
        setSubmissionStatus("sent");
        return;
      }

      const payload = {
        locale,
        name,
        company,
        email,
        phone,
        objectives: objectives.map((id) => objectiveLabelById.get(id) ?? id),
        audiences,
        diffusions,
        description: projectDescription,
        locations: shootingLocations,
        budget: budgetChoice || null,
        timeline: timelineChoice || null,
        referral: referralChoice || null,
        website,
      };
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("submit_failed");
      }
      trackDemandeFormSubmit(locale);
      setSubmissionStatus("sent");
    } catch (error) {
      setSubmissionStatus("idle");
      const message =
        error instanceof Error ? error.message : "submit_failed";
      setSubmissionMessage(message);
    }
  }

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
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(withLocaleHref(locale, "/"));
            }
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
                {mode === "booking"
                  ? t("request.booking.sent.title")
                  : t("request.sent.title")}
              </h1>
              <p className="text-sm text-zinc-300">
                {mode === "booking"
                  ? t("request.booking.sent.subtitle")
                  : t("request.sent.subtitle")}
              </p>
              {mode === "booking" && bookedAppointmentStart ? (
                <div className="mx-auto w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100">
                  {new Intl.DateTimeFormat(
                    locale === "en" ? "en-CA" : "fr-CA",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Toronto",
                    },
                  ).format(new Date(bookedAppointmentStart))}
                </div>
              ) : null}
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
                <span>
                  {mode === "booking"
                    ? t("request.mode.booking.title")
                    : t("request.title")}
                </span>
              </div>

          {mode === null ? (
            <div className="w-full space-y-8">
              <div>
                <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                  {t("request.mode.title")}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
                  {t("request.mode.subtitle")}
                </p>
              </div>
              <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("quote");
                    setStep(0);
                  }}
                  className="group rounded-2xl border border-white/10 bg-black/30 p-6 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
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
                      <path d="M5 4h14v16H5z" />
                      <path d="M8 8h8M8 12h8M8 16h5" />
                    </svg>
                  </div>
                  <div className="mt-5 text-xl font-semibold text-white">
                    {t("request.mode.quote.title")}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {t("request.mode.quote.description")}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("booking");
                    setStep(-1);
                  }}
                  className="group rounded-2xl border border-white/10 bg-black/30 p-6 text-left transition hover:border-emerald-300/40 hover:bg-emerald-300/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
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
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M8 3v4M16 3v4M3 10h18M8 14h3M13 14h3M8 18h3" />
                    </svg>
                  </div>
                  <div className="mt-5 text-xl font-semibold text-white">
                    {t("request.mode.booking.title")}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {t("request.mode.booking.description")}
                  </p>
                </button>
              </div>
            </div>
          ) : step === -1 ? (
            <div className="w-full space-y-8">
              <div>
                <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                  {t("request.booking.title")}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
                  {t("request.booking.subtitle")}
                </p>
              </div>
              <AppointmentCalendar
                selectedStart={appointmentStart}
                onSelect={(value) => {
                  setAppointmentStart(value);
                  if (value) setSubmissionMessage(null);
                }}
                refreshKey={appointmentRefreshKey}
              />
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode(null);
                    setStep(0);
                  }}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  disabled={!appointmentStart}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("request.nav.next")}
                </button>
              </div>
              {submissionMessage === "slot_unavailable" ? (
                <p className="text-sm text-rose-200">
                  {t("request.booking.slotUnavailable")}
                </p>
              ) : null}
            </div>
          ) : step === 0 ? (
            <div
              className="w-full space-y-6"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (canGoNext) setStep(mode === "booking" ? 5 : 1);
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
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "booking") {
                      setStep(-1);
                    } else {
                      setMode(null);
                    }
                  }}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (canGoNext) setStep(mode === "booking" ? 5 : 1);
                  }}
                  disabled={!canGoNext}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
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
                  const label = option.label ?? t(option.labelKey);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setObjectives((prev) =>
                          toggleArrayValue(
                            prev.filter((id) => id !== "autre"),
                            option.id,
                          ),
                        )
                      }
                      className={`group flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
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
                        {option.icon ?? (
                          <span className="text-sm font-semibold">
                            {selected ? "✓" : ""}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {label}
                        </div>
                        {option.descriptionKey ? (
                          <div className="mt-1 text-sm text-zinc-400">
                            {t(option.descriptionKey)}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setObjectives(["autre"]);
                    setStep(2);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 hover:bg-white/10"
                >
                  {t("request.unknown")}
                </button>
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
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShootingLocations("");
                      setStep(5);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 hover:bg-white/10"
                  >
                    {t("request.unknown")}
                  </button>
                </div>
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
                {t("request.step8.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                {t("request.step8.subtitle")}
              </p>
              <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
                {budgetOptions.map((option) => {
                  if (option.id === "unknown") return null;

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
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setBudgetChoice("unknown");
                    setStep(mode === "booking" ? 7 : 6);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 hover:bg-white/10"
                >
                  {t("request.unknown")}
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(mode === "booking" ? 0 : 4)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(mode === "booking" ? 7 : 6)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
                >
                  {t("request.nav.next")}
                </button>
              </div>
            </div>
          ) : step === 6 ? (
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
                  onClick={() => setStep(mode === "booking" ? 5 : 6)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(8)}
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
              {mode === "booking" && appointmentStart ? (
                <div className="mx-auto w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100">
                  {new Intl.DateTimeFormat(
                    locale === "en" ? "en-CA" : "fr-CA",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Toronto",
                    },
                  ).format(new Date(appointmentStart))}
                </div>
              ) : null}
              <div className="mx-auto mt-2 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
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
              <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 text-center">
                <button
                  type="button"
                  onClick={submitRequest}
                  disabled={!canSubmit || submissionStatus === "sending"}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mode === "booking"
                    ? t("request.booking.submit")
                    : t("request.step12.submit")}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10"
                >
                  {t("request.nav.back")}
                </button>
                <p className="text-xs text-zinc-500">
                  {locale === "en"
                    ? "By submitting, you agree to be contacted about your request. "
                    : "En soumettant, vous acceptez d’être contacté au sujet de votre demande. "}
                  <Link
                    href={privacyHref}
                    className="underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {locale === "en"
                      ? "Privacy policy"
                      : "Politique de confidentialité"}
                  </Link>
                  .
                </p>
                <input
                  type="text"
                  name="website"
                  value={website}
                  readOnly
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="new-password"
                  aria-hidden="true"
                />
                {submissionMessage ? (
                  <p className="text-xs text-rose-200">
                    {submissionMessage === "rate_limited"
                      ? t("request.booking.rateLimited")
                      : t("request.submit.error")}
                  </p>
                ) : null}
              </div>
            </div>
          )}
            </>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center">
          <Image
            src={logoSymbol}
            alt="Zéro huit"
            className="h-6 w-auto opacity-60"
          />
        </div>
      </main>

    </div>
  );
}
