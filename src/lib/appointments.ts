import type { BusyPeriod } from "@/lib/googleCalendar";

export const APPOINTMENT_TIME_ZONE = "America/Toronto";
export const APPOINTMENT_DURATION_MINUTES = 30;
export const APPOINTMENT_BUFFER_MINUTES = 30;
export const APPOINTMENT_MIN_LEAD_HOURS = 3;
export const APPOINTMENT_START_HOUR = 9;
export const APPOINTMENT_END_HOUR = 16;
export const APPOINTMENT_LUNCH_START_HOUR = 12;
export const APPOINTMENT_LUNCH_END_HOUR = 13;

const SYNTHETIC_BLOCKED_SLOTS_MIN = 2;
const SYNTHETIC_BLOCKED_SLOTS_MAX = 4;
const SYNTHETIC_AVAILABILITY_SEED = "zero-huit-appointments-v1";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};

function partsInTimeZone(date: Date, timeZone = APPOINTMENT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    weekday: values.weekday,
  } as DateParts;
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone = APPOINTMENT_TIME_ZONE,
) {
  let timestamp = Date.UTC(year, month - 1, day, hour, minute);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const actual = partsInTimeZone(new Date(timestamp), timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
    );
    const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute);
    timestamp += desiredAsUtc - actualAsUtc;
  }
  return new Date(timestamp);
}

function overlaps(
  start: number,
  end: number,
  blockedStart: number,
  blockedEnd: number,
) {
  return start < blockedEnd && end > blockedStart;
}

function overlapsLunchBreak(minutes: number) {
  return overlaps(
    minutes,
    minutes + APPOINTMENT_DURATION_MINUTES,
    APPOINTMENT_LUNCH_START_HOUR * 60,
    APPOINTMENT_LUNCH_END_HOUR * 60,
  );
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function syntheticBlockedSlotMinutes(year: number, month: number, day: number) {
  const candidates: number[] = [];
  for (
    let minutes = APPOINTMENT_START_HOUR * 60;
    minutes + APPOINTMENT_DURATION_MINUTES <= APPOINTMENT_END_HOUR * 60;
    minutes += APPOINTMENT_DURATION_MINUTES
  ) {
    if (!overlapsLunchBreak(minutes)) candidates.push(minutes);
  }

  const dateKey = [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
  const random = seededRandom(
    hashString(`${SYNTHETIC_AVAILABILITY_SEED}:${dateKey}`),
  );
  const blockedCount =
    SYNTHETIC_BLOCKED_SLOTS_MIN +
    Math.floor(
      random() *
        (SYNTHETIC_BLOCKED_SLOTS_MAX - SYNTHETIC_BLOCKED_SLOTS_MIN + 1),
    );

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [
      candidates[swapIndex],
      candidates[index],
    ];
  }

  return new Set(candidates.slice(0, blockedCount));
}

export function monthBounds(
  monthValue: string,
  timeZone = APPOINTMENT_TIME_ZONE,
) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthValue);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return {
    start: zonedDateTimeToUtc(year, month, 1, 0, 0, timeZone),
    end: zonedDateTimeToUtc(
      month === 12 ? year + 1 : year,
      month === 12 ? 1 : month + 1,
      1,
      0,
      0,
      timeZone,
    ),
    year,
    month,
  };
}

export function availableAppointmentSlots(input: {
  monthValue: string;
  busyPeriods: BusyPeriod[];
  reservedPeriods: BusyPeriod[];
  now?: Date;
  timeZone?: string;
}) {
  const timeZone = input.timeZone ?? APPOINTMENT_TIME_ZONE;
  const bounds = monthBounds(input.monthValue, timeZone);
  if (!bounds) return [];
  const now = input.now ?? new Date();
  const earliestStart =
    now.getTime() + APPOINTMENT_MIN_LEAD_HOURS * 60 * 60 * 1000;
  const busy = [...input.busyPeriods, ...input.reservedPeriods]
    .map((period) => ({
      start:
        new Date(period.start).getTime() -
        APPOINTMENT_BUFFER_MINUTES * 60 * 1000,
      end:
        new Date(period.end).getTime() +
        APPOINTMENT_BUFFER_MINUTES * 60 * 1000,
    }))
    .filter(
      (period) => Number.isFinite(period.start) && Number.isFinite(period.end),
    );
  const daysInMonth = new Date(
    Date.UTC(bounds.year, bounds.month, 0),
  ).getUTCDate();
  const slots: Array<{ start: string; end: string }> = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayStart = zonedDateTimeToUtc(
      bounds.year,
      bounds.month,
      day,
      APPOINTMENT_START_HOUR,
      0,
      timeZone,
    );
    const weekday = partsInTimeZone(dayStart, timeZone).weekday;
    if (weekday === "Sat" || weekday === "Sun") continue;
    const syntheticBlocked = syntheticBlockedSlotMinutes(
      bounds.year,
      bounds.month,
      day,
    );

    for (
      let minutes = APPOINTMENT_START_HOUR * 60;
      minutes + APPOINTMENT_DURATION_MINUTES <= APPOINTMENT_END_HOUR * 60;
      minutes += APPOINTMENT_DURATION_MINUTES
    ) {
      if (
        overlapsLunchBreak(minutes) ||
        syntheticBlocked.has(minutes)
      ) {
        continue;
      }
      const start = zonedDateTimeToUtc(
        bounds.year,
        bounds.month,
        day,
        Math.floor(minutes / 60),
        minutes % 60,
        timeZone,
      );
      const end = new Date(
        start.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000,
      );
      if (start.getTime() < earliestStart) continue;
      if (
        busy.some((period) =>
          overlaps(
            start.getTime(),
            end.getTime(),
            period.start,
            period.end,
          ),
        )
      ) {
        continue;
      }
      slots.push({ start: start.toISOString(), end: end.toISOString() });
    }
  }

  return slots;
}

export function isValidAppointmentSlot(startValue: string, now = new Date()) {
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return false;
  if (
    start.getTime() <
    now.getTime() + APPOINTMENT_MIN_LEAD_HOURS * 60 * 60 * 1000
  ) {
    return false;
  }
  const parts = partsInTimeZone(start);
  if (parts.weekday === "Sat" || parts.weekday === "Sun") return false;
  if (parts.minute !== 0 && parts.minute !== 30) return false;
  const minutes = parts.hour * 60 + parts.minute;
  if (
    minutes < APPOINTMENT_START_HOUR * 60 ||
    minutes + APPOINTMENT_DURATION_MINUTES > APPOINTMENT_END_HOUR * 60 ||
    overlapsLunchBreak(minutes)
  ) {
    return false;
  }
  return !syntheticBlockedSlotMinutes(
    parts.year,
    parts.month,
    parts.day,
  ).has(minutes);
}

export function appointmentEnd(startValue: string) {
  return new Date(
    new Date(startValue).getTime() +
      APPOINTMENT_DURATION_MINUTES * 60 * 1000,
  );
}
