"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/shared";

type Props = {
  locale: Locale;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  fullAddress: string;
  projectName: string;
  shootDate: string;
  amount: string;
  interacQuestion: string;
  interacAnswer: string;
  website: string;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  fullAddress: "",
  projectName: "",
  shootDate: "",
  amount: "",
  interacQuestion: "",
  interacAnswer: "",
  website: "",
};

const copy = {
  fr: {
    kicker: "DEMANDE DE PAIEMENT",
    title: "Envoyez une demande de paiement.",
    subtitle:
      "Remplissez le formulaire ci-dessous et vous recevrez votre paiement par virement Interac.",
    cardTitle: "Informations a fournir",
    cardBody:
      "Incluez les details du projet et les informations Interac pour accelerer le traitement.",
    submit: "Envoyer la demande",
    sending: "Envoi en cours...",
    success: "Votre demande de paiement a ete envoyee.",
    error:
      "Une erreur est survenue pendant l'envoi. Verifiez les champs et reessayez.",
    labels: {
      fullName: "Nom complet",
      email: "Courriel",
      phone: "Telephone",
      fullAddress: "Adresse complete",
      projectName: "Nom du projet",
      shootDate: "Date du tournage",
      amount: "Montant",
      interacQuestion: "Question pour virement Interac",
      interacAnswer: "Reponse pour virement Interac",
    },
  },
  en: {
    kicker: "PAYMENT REQUEST",
    title: "Send a clear, complete payment request.",
    subtitle:
      "Fill out the form below and the request will be sent directly to info@zerohuit.ca.",
    cardTitle: "Required details",
    cardBody:
      "Include the project details and Interac information to speed up processing.",
    submit: "Send request",
    sending: "Sending...",
    success: "Your payment request has been sent.",
    error: "Something went wrong while sending the request. Please try again.",
    labels: {
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      fullAddress: "Full address",
      projectName: "Project name",
      shootDate: "Shoot date",
      amount: "Amount",
      interacQuestion: "Interac transfer question",
      interacAnswer: "Interac transfer answer",
    },
  },
} as const;

type Status = "idle" | "sending" | "sent";

export function PaymentRequestForm({ locale }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const t = copy[locale];
  const canSubmit =
    status !== "sending" &&
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.fullAddress.trim() &&
    form.projectName.trim() &&
    form.shootDate.trim() &&
    form.amount.trim() &&
    form.interacQuestion.trim() &&
    form.interacAnswer.trim();

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("submit_failed");
      }

      setStatus("sent");
      setForm(initialForm);
    } catch {
      setStatus("idle");
      setError(t.error);
    }
  }

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col justify-center gap-8">
          <div>
            <span className="text-xs font-semibold tracking-[0.45em] text-zinc-400">
              {t.kicker}
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-zinc-300 sm:text-base">
              {t.subtitle}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">{t.cardTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">{t.cardBody}</p>
            <p className="mt-6 text-sm text-zinc-400">
              info@zerohuit.ca
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t.labels.fullName}
              name="fullName"
              value={form.fullName}
              onChange={updateField}
            />
            <Field
              label={t.labels.email}
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
            />
            <Field
              label={t.labels.phone}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
            />
            <Field
              label={t.labels.projectName}
              name="projectName"
              value={form.projectName}
              onChange={updateField}
            />
            <Field
              label={t.labels.fullAddress}
              name="fullAddress"
              className="sm:col-span-2"
              value={form.fullAddress}
              onChange={updateField}
            />
            <Field
              label={t.labels.shootDate}
              name="shootDate"
              type="date"
              value={form.shootDate}
              onChange={updateField}
            />
            <Field
              label={t.labels.amount}
              name="amount"
              value={form.amount}
              onChange={updateField}
            />
            <Field
              label={t.labels.interacQuestion}
              name="interacQuestion"
              className="sm:col-span-2"
              value={form.interacQuestion}
              onChange={updateField}
            />
            <Field
              label={t.labels.interacAnswer}
              name="interacAnswer"
              className="sm:col-span-2"
              value={form.interacAnswer}
              onChange={updateField}
            />
          </div>

          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(event) => updateField("website", event.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="mt-8 flex flex-col gap-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? t.sending : t.submit}
            </button>
            {status === "sent" ? (
              <p className="text-sm text-emerald-300">{t.success}</p>
            ) : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  type?: string;
  className?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  className,
}: FieldProps) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-zinc-200">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/60"
        required
      />
    </label>
  );
}
