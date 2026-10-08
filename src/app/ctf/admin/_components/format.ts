import { TIME_ZONE } from "@/lib/time-zone";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "just now", "5 minutes ago", "yesterday", then a plain date past a week. */
export function timeAgo(date: Date, now = Date.now()) {
  const sec = Math.round((date.getTime() - now) / 1000);
  if (sec > -45) return "just now";
  if (sec > -3600) return rtf.format(Math.round(sec / 60), "minute");
  if (sec > -86_400) return rtf.format(Math.round(sec / 3600), "hour");
  if (sec > -7 * 86_400) return rtf.format(Math.round(sec / 86_400), "day");
  return shortDate(date);
}

export const shortDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, month: "short", day: "numeric" }).format(d);
