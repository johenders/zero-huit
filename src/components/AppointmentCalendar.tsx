"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type AppointmentSlot = {
  start: string;
  end: string;
};

type Props = {
  selectedStart: string;
  onSelect: (start: string) => void;
  refreshKey?: number;
};

function currentMonthValue() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}`;
}

function shiftMonth(value: string, amount: number) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function calendarDays(value: string) {
  const [year, month] = value.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const startOffset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function dateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function AppointmentCalendar({
  selectedStart,
  onSelect,
  refreshKey = 0,
}: Props) {
  const { locale, t } = useI18n();
  const initialMonth = useMemo(() => currentMonthValue(), []);
  const maxMonth = useMemo(() => shiftMonth(initialMonth, 6), [initialMonth]);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAvailability() {
      setStatus("loading");
      setMessage(null);
      try {
        const response = await fetch(
          `/api/appointments/availability?month=${encodeURIComponent(month)}`,
          { signal: controller.signal },
        );
        const json = (await response.json()) as {
          slots?: AppointmentSlot[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(json.error || "availability_failed");
        }
        const nextSlots = json.slots ?? [];
        setSlots(nextSlots);
        setSelectedDate((current) => {
          if (
            current &&
            nextSlots.some((slot) => dateKey(slot.start) === current)
          ) {
            return current;
          }
          return nextSlots[0] ? dateKey(nextSlots[0].start) : "";
        });
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setSlots([]);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "availability_failed",
        );
      }
    }
    void loadAvailability();
    return () => controller.abort();
  }, [month, refreshKey]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, AppointmentSlot[]>();
    for (const slot of slots) {
      const key = dateKey(slot.start);
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    }
    return grouped;
  }, [slots]);

  const [year, monthNumber] = month.split("-").map(Number);
  const monthLabel = new Intl.DateTimeFormat(
    locale === "en" ? "en-CA" : "fr-CA",
    { month: "long", year: "numeric", timeZone: "UTC" },
  ).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "America/Toronto",
      }).format(new Date(`${selectedDate}T12:00:00-04:00`))
    : "";
  const visibleSlots = selectedDate
    ? slotsByDate.get(selectedDate) ?? []
    : [];
  const weekdays =
    locale === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 text-left lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              onSelect("");
              setMonth((current) => shiftMonth(current, -1));
            }}
            disabled={month <= initialMonth}
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={t("request.booking.calendar.previous")}
          >
            ←
          </button>
          <div className="text-lg font-semibold capitalize text-white">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect("");
              setMonth((current) => shiftMonth(current, 1));
            }}
            disabled={month >= maxMonth}
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={t("request.booking.calendar.next")}
          >
            →
          </button>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2 text-center">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              {weekday}
            </div>
          ))}
          {calendarDays(month).map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            const key = `${month}-${String(day).padStart(2, "0")}`;
            const hasSlots = slotsByDate.has(key);
            const selected = selectedDate === key;
            return (
              <button
                key={key}
                type="button"
                disabled={!hasSlots || status === "loading"}
                onClick={() => {
                  setSelectedDate(key);
                  onSelect("");
                }}
                className={`aspect-square rounded-xl border text-sm font-semibold transition ${
                  selected
                    ? "border-cyan-300/70 bg-cyan-300/15 text-cyan-100"
                    : hasSlots
                      ? "border-white/10 bg-white/5 text-zinc-100 hover:border-white/30 hover:bg-white/10"
                      : "border-transparent text-zinc-700"
                } disabled:cursor-not-allowed`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {t("request.booking.calendar.times")}
        </div>
        <div className="mt-2 text-lg font-semibold capitalize text-white">
          {selectedDateLabel || t("request.booking.calendar.chooseDate")}
        </div>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {t("request.booking.calendar.rules")}
        </p>

        {status === "loading" ? (
          <div className="mt-6 text-sm text-zinc-400">
            {t("request.booking.calendar.loading")}
          </div>
        ) : null}
        {status === "error" ? (
          <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">
            {message?.includes("not connected")
              ? t("request.booking.calendar.notConnected")
              : t("request.booking.calendar.error")}
          </div>
        ) : null}
        {status === "idle" && slots.length === 0 ? (
          <div className="mt-6 text-sm text-zinc-400">
            {t("request.booking.calendar.empty")}
          </div>
        ) : null}
        {visibleSlots.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {visibleSlots.map((slot) => {
              const selected = selectedStart === slot.start;
              const label = new Intl.DateTimeFormat(
                locale === "en" ? "en-CA" : "fr-CA",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Toronto",
                },
              ).format(new Date(slot.start));
              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => onSelect(slot.start)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    selected
                      ? "border-emerald-300/70 bg-emerald-300/15 text-emerald-100"
                      : "border-white/10 bg-white/5 text-zinc-200 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
