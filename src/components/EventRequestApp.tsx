"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { withLocaleHref } from "@/lib/i18n/shared";
import levPhoto from "../../assets/Lev.jpg";
import logoSymbol from "../../assets/zero_huit_symbole.png";

type ReferralOptionId =
  | "client_actuel"
  | "bouche_a_oreille"
  | "agence"
  | "adwords"
  | "reseaux_sociaux"
  | "seo"
  | "amis";

type EventDurationChoice = "under_4h" | "over_4h" | "unknown";

const referralOptions: Array<{ id: ReferralOptionId; labelKey: string }> = [
  { id: "client_actuel", labelKey: "request.referral.client_actuel" },
  { id: "bouche_a_oreille", labelKey: "request.referral.bouche_a_oreille" },
  { id: "agence", labelKey: "request.referral.agence" },
  { id: "adwords", labelKey: "request.referral.adwords" },
  { id: "reseaux_sociaux", labelKey: "request.referral.reseaux_sociaux" },
  { id: "amis", labelKey: "request.referral.amis" },
  { id: "seo", labelKey: "request.referral.seo" },
];

const copy = {
  fr: {
    title: "Réservation",
    dateTitle: "Date de votre événement",
    dateSubtitle: "Choisissez votre date. Nous vous contacterons pour confirmer.",
    monthPrevious: "Mois précédent",
    monthNext: "Mois suivant",
    selectedDate: "Date sélectionnée",
    noDate: "Aucune date sélectionnée",
    durationTitle: "Durée de votre événement",
    durationOptions: [
      { id: "under_4h", label: "Moins de 4h" },
      { id: "over_4h", label: "Plus de 4h" },
    ],
    durationUnknown: "Je ne sais pas encore",
    submit: "Envoyer la demande",
    privacy:
      "En soumettant, vous acceptez d’être contacté au sujet de votre demande. ",
    error: "Une erreur s’est produite. Réessaie ou écris-nous.",
    eventObjective: "Recap événementiel",
    eventAudience: "evenement",
    eventDiffusion: "reseaux_sociaux",
    packageName: "Forfait recap événementiel",
  },
	  en: {
	    title: "Reservation",
	    dateTitle: "Event date",
	    dateSubtitle: "Choose your date. We will contact you to confirm.",
    monthPrevious: "Previous month",
    monthNext: "Next month",
    selectedDate: "Selected date",
    noDate: "No date selected",
	    durationTitle: "Event duration",
    durationOptions: [
      { id: "under_4h", label: "Less than 4h" },
      { id: "over_4h", label: "More than 4h" },
    ],
    durationUnknown: "I don't know yet",
    submit: "Send request",
    privacy: "By submitting, you agree to be contacted about your request. ",
    error: "Something went wrong. Please try again or email us.",
    eventObjective: "Event recap",
    eventAudience: "event",
    eventDiffusion: "social media",
    packageName: "Event recap package",
  },
} as const;

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(value: string, locale: "fr" | "en") {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(
    locale === "en" ? "en-CA" : "fr-CA",
    { year: "numeric", month: "long", day: "numeric" },
  );
}

function calendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
}

export function EventRequestApp() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const fallbackCopy = copy[locale];
  const localCopy = {
    title: t("events.form.title", fallbackCopy.title),
    dateTitle: t("events.form.date.title", fallbackCopy.dateTitle),
    dateSubtitle: t("events.form.date.subtitle", fallbackCopy.dateSubtitle),
    monthPrevious: t("events.form.date.previous", fallbackCopy.monthPrevious),
    monthNext: t("events.form.date.next", fallbackCopy.monthNext),
    selectedDate: t("events.form.date.selected", fallbackCopy.selectedDate),
    noDate: t("events.form.date.empty", fallbackCopy.noDate),
    durationTitle: t("events.form.duration.title", fallbackCopy.durationTitle),
    durationOptions: [
      {
        id: "under_4h" as const,
        label: t("events.form.duration.under4", fallbackCopy.durationOptions[0].label),
      },
      {
        id: "over_4h" as const,
        label: t("events.form.duration.over4", fallbackCopy.durationOptions[1].label),
      },
    ],
    durationUnknown: t("events.form.duration.unknown", fallbackCopy.durationUnknown),
    submit: t("events.form.submit", fallbackCopy.submit),
    privacy: t("events.form.privacy", fallbackCopy.privacy),
    error: t("events.form.error", fallbackCopy.error),
    eventObjective: t("events.form.objective", fallbackCopy.eventObjective),
    eventAudience: t("events.form.audience", fallbackCopy.eventAudience),
    eventDiffusion: t("events.form.diffusion", fallbackCopy.eventDiffusion),
    packageName: t("events.form.packageName", fallbackCopy.packageName),
  };
  const privacyHref = locale === "en" ? "/en/privacy" : "/politique-de-confidentialite";
  const [step, setStep] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [eventDuration, setEventDuration] = useState<EventDurationChoice | "">("");
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralChoice, setReferralChoice] = useState<ReferralOptionId | "">("");
  const [website, setWebsite] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const days = useMemo(() => calendarDays(monthDate), [monthDate]);
  const eventDurationLabel =
    localCopy.durationOptions.find((option) => option.id === eventDuration)?.label ??
    (eventDuration === "unknown" ? localCopy.durationUnknown : "");
  const hasStarted =
    Boolean(eventDate || eventDuration || name.trim() || company.trim() || email.trim() || phone.trim() || referralChoice) ||
    step > 0;
  const canSubmit = Boolean(eventDate && eventDuration && name.trim() && company.trim() && email.trim());
  const monthLabel = monthDate.toLocaleDateString(locale === "en" ? "en-CA" : "fr-CA", {
    month: "long",
    year: "numeric",
  });
  const weekDays = locale === "en"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

	  async function submitRequest() {
	    if (!canSubmit || submissionStatus === "sending") return;
	    setSubmissionStatus("sending");
	    setSubmissionMessage(null);
	    try {
	      const formattedDate = formatLongDate(eventDate, locale);
	      const description =
	        locale === "en"
	          ? `Event date: ${formattedDate}\nEvent duration: ${eventDurationLabel}`
	          : `Date de l'événement: ${formattedDate}\nDurée de l'événement: ${eventDurationLabel}`;
	      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          name,
          company,
          email,
          phone,
          objectives: [localCopy.eventObjective],
          audiences: [localCopy.eventAudience],
          diffusions: [localCopy.eventDiffusion],
	          description,
          deliverables: {
            eventDate,
            eventDateLabel: formattedDate,
            eventDuration,
            eventDurationLabel,
            package: localCopy.packageName,
          },
          referral: referralChoice || null,
          website,
        }),
      });
      if (!response.ok) throw new Error("submit_failed");
      setSubmissionStatus("sent");
    } catch (error) {
      setSubmissionStatus("idle");
      setSubmissionMessage(error instanceof Error ? error.message : "submit_failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-zinc-100">
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
            if (hasStarted && !confirm(t("request.exit.confirm"))) return;
            if (window.history.length > 1) router.back();
            else router.push(withLocaleHref(locale, "/evenements"));
          }}
        >
          <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
          {submissionStatus === "sent" ? (
            <div className="w-full max-w-3xl space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-[2px] motion-safe:animate-[successPop_600ms_ease-out]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-black/80 text-3xl text-white">✓</div>
              </div>
              <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                {t("request.sent.title")}
              </h1>
              <p className="text-sm text-zinc-300">{t("request.sent.subtitle")}</p>
              <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 text-left sm:flex-row sm:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10">
                  <Image src={levPhoto} alt="Lev Rapoport" className="h-full w-full object-cover" priority />
                </div>
                <div className="space-y-1 text-sm text-zinc-200">
                  <div className="text-base font-semibold text-white">Lev Rapoport</div>
                  <div>{t("request.sent.role")}</div>
                  <div>lev@zerohuit.ca</div>
                  <div>450.395.1777 poste 4</div>
                </div>
              </div>
              <a href={withLocaleHref(locale, "/")} className="inline-flex rounded-full border border-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200 hover:bg-white/10">
                {t("request.sent.back")}
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
                <span>{localCopy.title}</span>
              </div>

              {step === 0 ? (
                <div className="w-full space-y-4">
                  <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-5xl">
                    {localCopy.dateTitle}
                  </h1>
                  <p className="mx-auto max-w-xl text-base leading-7 text-zinc-300">{localCopy.dateSubtitle}</p>
                  <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-3 text-left">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <button type="button" aria-label={localCopy.monthPrevious} onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10">
                        ←
                      </button>
                      <div className="text-base font-semibold capitalize text-white">{monthLabel}</div>
                      <button type="button" aria-label={localCopy.monthNext} onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10">
                        →
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-zinc-500">
                      {weekDays.map((day) => <div key={day}>{day}</div>)}
                    </div>
                    <div className="mt-1.5 grid grid-cols-7 gap-1">
                      {days.map((day, index) => {
                        const value = day ? toDateInputValue(day) : "";
                        const selected = value === eventDate;
                        return day ? (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setEventDate(value)}
                            className={`aspect-square rounded-lg border text-xs font-semibold transition ${
                              selected
                                ? "border-emerald-300/70 bg-emerald-300/20 text-emerald-100"
                                : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/30"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        ) : (
                          <div key={`empty-${index}`} />
                        );
                      })}
                    </div>
                    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
                      {eventDate ? `${localCopy.selectedDate}: ${formatLongDate(eventDate, locale)}` : localCopy.noDate}
                    </div>
                  </div>
                  <button type="button" disabled={!eventDate} onClick={() => setStep(1)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50">
                    {t("request.nav.next")}
                  </button>
                </div>
              ) : step === 1 ? (
                <div className="w-full space-y-8">
                  <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                    {localCopy.durationTitle}
                  </h1>
                  <div className="mx-auto mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
                    {localCopy.durationOptions.map((option) => {
                      const selected = eventDuration === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setEventDuration(option.id)}
                          className={`rounded-2xl border px-6 py-5 text-left text-lg font-semibold transition ${
                            selected
                              ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-100"
                              : "border-white/10 bg-black/30 text-zinc-100 hover:border-white/30"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEventDuration("unknown")}
                    className={`rounded-full border px-6 py-3 text-sm font-semibold transition ${
                      eventDuration === "unknown"
                        ? "border-sky-300/60 bg-sky-300/10 text-sky-100"
                        : "border-white/10 text-zinc-100 hover:bg-white/10"
                    }`}
                  >
                    {localCopy.durationUnknown}
                  </button>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <button type="button" onClick={() => setStep(0)} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">{t("request.nav.back")}</button>
                    <button type="button" disabled={!eventDuration} onClick={() => setStep(2)} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50">{t("request.nav.next")}</button>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="w-full space-y-6">
                  <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">
                    {t("request.step1.title")}
                  </h1>
                  <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
                    <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                      <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">{t("request.step1.name.label")}</span>
                      <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("request.step1.name.placeholder")} className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600" />
                    </label>
                    <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                      <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">{t("request.step1.company.label")}</span>
                      <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder={t("request.step1.company.placeholder")} className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600" />
                    </label>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <button type="button" onClick={() => setStep(1)} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">{t("request.nav.back")}</button>
                    <button type="button" disabled={!name.trim() || !company.trim()} onClick={() => setStep(3)} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50">{t("request.nav.next")}</button>
                  </div>
                </div>
              ) : step === 3 ? (
                <div className="w-full space-y-8">
                  <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">{t("request.step11.title")}</h1>
                  <p className="mx-auto max-w-2xl text-sm text-zinc-400">{t("request.step11.subtitle")}</p>
                  <div className="mx-auto mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
                    {referralOptions.map((option) => {
                      const selected = referralChoice === option.id;
                      return (
                        <button key={option.id} type="button" onClick={() => setReferralChoice(option.id)} className={`rounded-2xl border px-5 py-3 text-left text-sm font-semibold transition ${selected ? "border-sky-300/60 bg-sky-300/10 text-sky-100" : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/30"}`}>
                          {t(option.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <button type="button" onClick={() => setStep(2)} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">{t("request.nav.back")}</button>
                    <button type="button" disabled={!referralChoice} onClick={() => setStep(4)} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/60">{t("request.nav.nextStep")}</button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  <h1 className="text-3xl font-semibold text-zinc-100 sm:text-4xl lg:text-6xl">{t("request.step12.title")}</h1>
                  <div className="mx-auto mt-2 grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
                    <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                      <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">{t("request.step1.email.label")}</span>
                      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("request.step1.email.placeholder")} autoComplete="email" className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600" />
                    </label>
                    <label className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400">
                      <span className="block text-xs uppercase tracking-[0.2em] text-zinc-500">{t("request.step1.phone.label")}</span>
                      <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={t("request.step1.phone.placeholder")} autoComplete="tel" className="w-full bg-transparent text-xl font-semibold text-zinc-100 outline-none placeholder:text-zinc-600" />
                    </label>
                  </div>
                  <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 text-center">
                    <button type="button" onClick={submitRequest} disabled={!canSubmit || submissionStatus === "sending"} className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                      {localCopy.submit}
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/10">{t("request.nav.back")}</button>
                    <p className="text-xs text-zinc-500">
                      {localCopy.privacy}
                      <Link href={privacyHref} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                        {locale === "en" ? "Privacy policy" : "Politique de confidentialité"}
                      </Link>
                      .
                    </p>
                    <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                    {submissionMessage ? <p className="text-xs text-rose-200">{localCopy.error}</p> : null}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center">
          <Image src={logoSymbol} alt="Zéro huit" className="h-6 w-auto opacity-60" />
        </div>
      </main>
    </div>
  );
}
