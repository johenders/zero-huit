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

export default function AdminRequestsPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

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
      setRequests((data ?? []) as QuoteRequest[]);
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

      <div className="grid gap-4 lg:grid-cols-2">
        {requests.map((request) => (
          <article
            key={request.id}
            className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-base font-semibold text-white">
                {request.company || request.name}
              </div>
              <div className="text-xs text-zinc-400">{formatDate(request.created_at)}</div>
            </div>
            <div className="mt-2 space-y-1 text-xs text-zinc-400">
              <div>Nom : {request.name}</div>
              <div>Courriel : {request.email}</div>
              <div>Téléphone : {request.phone || "—"}</div>
              <div>Budget : {request.budget || "—"}</div>
              <div>Échéancier : {request.timeline || "—"}</div>
              <div>Source : {request.referral || "—"}</div>
              <div>Langue : {request.locale}</div>
              <div>Statut : {request.status}</div>
            </div>
            <div className="mt-3 text-xs text-zinc-300">
              <div className="font-semibold text-zinc-400">Description</div>
              <p className="mt-1 whitespace-pre-line text-zinc-200">
                {request.description || "—"}
              </p>
            </div>
            <div className="mt-3 text-xs text-zinc-300">
              <div className="font-semibold text-zinc-400">Lieux</div>
              <p className="mt-1">{request.locations || "—"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-300">
              {(request.objectives ?? []).map((item) => (
                <span
                  key={`obj-${request.id}-${item}`}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                >
                  {item}
                </span>
              ))}
              {(request.audiences ?? []).map((item) => (
                <span
                  key={`aud-${request.id}-${item}`}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                >
                  {item}
                </span>
              ))}
              {(request.diffusions ?? []).map((item) => (
                <span
                  key={`diff-${request.id}-${item}`}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
