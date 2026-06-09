"use client";

import { useEffect, useState } from "react";
import { useAdminState } from "@/app/admin/_hooks/useAdminState";
import { useSupabaseClient } from "@/lib/supabase/useClient";

type AppointmentRequest = {
  id: string;
  created_at: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  locale: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  budget: string | null;
  referral: string | null;
  status: "pending" | "confirmed" | "cancelled" | "failed";
  google_event_url: string | null;
  google_meet_url: string | null;
  error_message: string | null;
};

type GoogleCalendarStatus = {
  configured: boolean;
  connected: boolean;
  ownerEmail: string;
  accountEmail?: string | null;
  connectedAt?: string | null;
  error?: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusLabels: Record<AppointmentRequest["status"], string> = {
  pending: "En cours",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  failed: "Échec",
};

export default function AdminAppointmentsPage() {
  const supabase = useSupabaseClient();
  const { isAdmin } = useAdminState(supabase);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [calendarStatus, setCalendarStatus] =
    useState<GoogleCalendarStatus | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [activeAppointment, setActiveAppointment] =
    useState<AppointmentRequest | null>(null);

  useEffect(() => {
    if (!supabase || !isAdmin) return;
    let ignore = false;

    async function loadPage() {
      setStatus("loading");
      setMessage(null);
      const [appointmentsResult, calendarResponse] = await Promise.all([
        supabase
          .from("appointment_requests")
          .select("*")
          .order("starts_at", { ascending: false }),
        fetch("/api/admin/google-calendar/status"),
      ]);
      if (ignore) return;

      if (appointmentsResult.error) {
        setStatus("error");
        setMessage(appointmentsResult.error.message);
      } else {
        setAppointments(
          (appointmentsResult.data ?? []) as AppointmentRequest[],
        );
        setStatus("idle");
      }

      const calendarJson =
        (await calendarResponse.json()) as GoogleCalendarStatus;
      if (!ignore) setCalendarStatus(calendarJson);

      const params = new URLSearchParams(window.location.search);
      if (params.get("google") === "connected") {
        setMessage("Google Calendar est maintenant connecté.");
      } else if (params.get("google") === "error") {
        setMessage(
          params.get("message") || "Impossible de connecter Google Calendar.",
        );
      }
    }

    void loadPage();

    return () => {
      ignore = true;
    };
  }, [isAdmin, supabase]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Rendez-vous</h1>
        <p className="text-sm text-zinc-400">
          Réservations de 30 minutes synchronisées avec Google Calendar.
        </p>
      </header>

      {isAdmin === false ? (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
          Accès refusé (admin requis).
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">
            Google Calendar
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {!calendarStatus
              ? "Vérification..."
              : !calendarStatus.configured
                ? "Variables Google OAuth manquantes."
                : calendarStatus.connected
                  ? `Connecté avec ${calendarStatus.accountEmail}`
                  : `Non connecté à ${calendarStatus.ownerEmail}`}
          </div>
          {calendarStatus?.error ? (
            <div className="mt-2 text-xs text-rose-200">
              {calendarStatus.error}
            </div>
          ) : null}
        </div>
        <a
          href="/api/admin/google-calendar/connect"
          className={`inline-flex justify-center rounded-xl px-4 py-2 text-sm font-semibold ${
            calendarStatus?.configured
              ? "bg-white text-black hover:bg-zinc-200"
              : "pointer-events-none bg-white/10 text-zinc-500"
          }`}
        >
          {calendarStatus?.connected ? "Reconnecter" : "Connecter Google"}
        </a>
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/40">
        <table className="w-full min-w-[820px] text-left text-sm text-zinc-200">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3">Rendez-vous</th>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Courriel</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Ouvrir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="align-top">
                <td className="px-4 py-3 text-xs text-zinc-300">
                  {formatDate(appointment.starts_at)}
                </td>
                <td className="px-4 py-3 font-semibold text-white">
                  {appointment.company}
                </td>
                <td className="px-4 py-3">{appointment.name}</td>
                <td className="px-4 py-3">{appointment.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      appointment.status === "confirmed"
                        ? "bg-emerald-400/10 text-emerald-200"
                        : appointment.status === "failed"
                          ? "bg-rose-400/10 text-rose-200"
                          : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {statusLabels[appointment.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                    onClick={() => setActiveAppointment(appointment)}
                  >
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && status !== "loading" ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-zinc-400"
                >
                  Aucun rendez-vous pour le moment.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {activeAppointment ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 text-sm text-zinc-200 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {activeAppointment.company}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {formatDate(activeAppointment.starts_at)}
                </p>
              </div>
              <button
                className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
                onClick={() => setActiveAppointment(null)}
                type="button"
              >
                Fermer
              </button>
            </div>

            <div className="mt-5 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-zinc-200">
              {[
                `Nom: ${activeAppointment.name}`,
                `Entreprise: ${activeAppointment.company}`,
                `Courriel: ${activeAppointment.email}`,
                `Téléphone: ${activeAppointment.phone || "—"}`,
                `Budget: ${activeAppointment.budget || "—"}`,
                `Source: ${activeAppointment.referral || "—"}`,
                `Statut: ${statusLabels[activeAppointment.status]}`,
                activeAppointment.error_message
                  ? `Erreur: ${activeAppointment.error_message}`
                  : null,
              ]
                .filter(Boolean)
                .join("\n")}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {activeAppointment.google_meet_url ? (
                <a
                  href={activeAppointment.google_meet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
                >
                  Ouvrir Google Meet
                </a>
              ) : null}
              {activeAppointment.google_event_url ? (
                <a
                  href={activeAppointment.google_event_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
                >
                  Ouvrir dans Calendar
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
