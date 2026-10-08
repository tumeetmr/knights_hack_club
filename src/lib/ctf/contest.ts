import { TIME_ZONE } from "@/lib/time-zone";

export type ContestStatus = "upcoming" | "live" | "paused" | "ended";

/**
 * What state the CTF is in right now. Dates are optional: with none set the board
 * is always open, and "paused" is the off switch. Pure, so the player side can reuse it.
 */
export function contestStatus(
  c: { startAt: Date | null; endAt: Date | null; paused: boolean },
  now = new Date(),
): ContestStatus {
  if (c.endAt && now >= c.endAt) return "ended";
  if (c.paused) return "paused";
  if (c.startAt && now < c.startAt) return "upcoming";
  return "live";
}

const partsIn = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    y: +get("year"),
    mo: +get("month"),
    d: +get("day"),
    h: +get("hour"),
    mi: +get("minute"),
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DDTHH:mm" as wall-clock time in Niagara, for <input type="datetime-local">. */
export function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const p = partsIn(date);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}

/** "YYYY-MM-DDTHH:mm" read as Niagara wall-clock time -> real Date. Null if blank or invalid. */
export function fromLocalInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wanted = Date.UTC(y, mo - 1, d, h, mi);
  // Start from the naive UTC guess and correct by the zone offset (twice, for DST edges).
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = partsIn(new Date(guess));
    guess += wanted - Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi);
  }
  const result = new Date(guess);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function formatContestTime(date: Date | null): string {
  if (!date) return "None";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
