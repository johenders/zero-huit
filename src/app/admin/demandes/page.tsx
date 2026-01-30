"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase/useClient";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";

type QuoteRequest = {
  id: string;
  created_at: string;
  locale: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  objectives: string[];
  audiences: string[];
  diffusions: string[];
  description: string | null;
  locations: string | null;
  deliverables: Record<string, unknown>;
  needs_subtitles: boolean | null;
  upsells: string[];
  budget: string | null;
  timeline: string | null;
  referral: string | null;
  reference_ids: string[];
  project_id: string | null;
  project_title: string | null;
  status: string;
};

type DeliverablesPayload = {
  counts?: Record<string, number>;
  formats?: Record<string, string[]>;
  unknown?: boolean;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const deliverableLabels: Record<string, string> = {
  courte_video: "30 s et moins",
  publicite: "30–60 s",
  film_publicitaire: "2–4 min",
  mini_documentaire: "5 min +",
};

const formatLabels: Record<string, string> = {
  horizontal: "Horizontal",
  vertical: "Vertical",
  carre: "Carré",
};

function formatDeliverables(raw: QuoteRequest["deliverables"]) {
  const payload = (raw ?? {}) as DeliverablesPayload;
  if (payload.unknown) return "À définir";
  const counts = payload.counts ?? {};
  const formats = payload.formats ?? {};
  const parts: string[] = [];

  Object.entries(counts).forEach(([key, count]) => {
    if (!count) return;
    const label = deliverableLabels[key] ?? key;
    const formatList = (formats[key] ?? [])
      .map((format) => formatLabels[format] ?? format)
      .join(", ");
    const suffix = formatList ? ` (${formatList})` : "";
    parts.push(`${count}× ${label}${suffix}`);
  });

  if (!parts.length) return "—";
  return parts.join(" • ");
}

function formatReferences(referenceIds: string[]) {
  if (!referenceIds?.length) return "—";
  return referenceIds.join(", ");
}

export default function AdminRequestsPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    if (!supabase || !isAdmin) return;
    let ignore = false;
    async function loadRequests() {
      setStatus("loading");
      setMessage(null);
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (ignore) return;
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      const nextRequests = (data ?? []) as QuoteRequest[];
      setRequests(nextRequests);
      const referenceIds = Array.from(
        new Set(
          nextRequests.flatMap((request) => request.reference_ids ?? []),
        ),
      ).filter(Boolean);
      if (referenceIds.length) {
        const { data: videos } = await supabase
          .from("videos")
          .select("id,title")
          .in("id", referenceIds);
        if (!ignore && videos) {
          const map: Record<string, string> = {};
          for (const video of videos) {
            map[video.id] = video.title;
          }
          setVideoTitles(map);
        }
      } else {
        setVideoTitles({});
      }
      setStatus("idle");
    }

    void loadRequests();
    return () => {
      ignore = true;
    };
  }, [isAdmin, supabase]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Demandes de soumission</h1>
        <p className="text-sm text-zinc-400">
          {status === "loading"
            ? "Chargement..."
            : `${requests.length} demande${requests.length > 1 ? "s" : ""}`}
        </p>
      </header>

      {isAdmin === false ? (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          Accès refusé (admin requis).
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          {message}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/40">
        <table className="w-full min-w-[720px] text-left text-sm text-zinc-200">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Courriel</th>
              <th className="px-4 py-3">Ouvrir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {requests.map((request) => (
              <tr key={request.id} className="align-top">
                <td className="px-4 py-3 text-xs text-zinc-400">
                  {formatDate(request.created_at)}
                </td>
                <td className="px-4 py-3 font-semibold text-white">
                  {request.company || "—"}
                </td>
                <td className="px-4 py-3">{request.name}</td>
                <td className="px-4 py-3">{request.email}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => setActiveRequest(request)}
                  >
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && status !== "loading" ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-zinc-400"
                >
                  Aucune demande pour le moment.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {activeRequest ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-6 text-sm text-zinc-200 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {activeRequest.company || activeRequest.name}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {formatDate(activeRequest.created_at)}
                </p>
              </div>
              <button
                className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
                onClick={() => setActiveRequest(null)}
                type="button"
              >
                Fermer
              </button>
            </div>
            <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-zinc-200">
              {[
                `Nom: ${activeRequest.name}`,
                `Entreprise: ${activeRequest.company}`,
                `Courriel: ${activeRequest.email}`,
                `Téléphone: ${activeRequest.phone || "—"}`,
                `Budget: ${activeRequest.budget || "—"}`,
                `Échéancier: ${activeRequest.timeline || "—"}`,
                `Source: ${activeRequest.referral || "—"}`,
                `Objectifs: ${(activeRequest.objectives ?? []).join(", ") || "—"}`,
                `Clientèle: ${(activeRequest.audiences ?? []).join(", ") || "—"}`,
                `Diffusion: ${(activeRequest.diffusions ?? []).join(", ") || "—"}`,
                `Lieu de tournage: ${activeRequest.locations || "—"}`,
                `Livrables: ${formatDeliverables(activeRequest.deliverables)}`,
                `Sous-titres: ${
                  activeRequest.needs_subtitles === null
                    ? "—"
                    : activeRequest.needs_subtitles
                      ? "Oui"
                      : "Non"
                }`,
                `Intérêt supplémentaire: ${(activeRequest.upsells ?? []).join(", ") || "—"}`,
                `Références: ${
                  (activeRequest.reference_ids ?? []).length
                    ? (activeRequest.reference_ids ?? [])
                        .map((id) => videoTitles[id] ?? id)
                        .join(", ")
                    : "—"
                }`,
                `Description: ${activeRequest.description || "—"}`,
              ].join("\n")}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
