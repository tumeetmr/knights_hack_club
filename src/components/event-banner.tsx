"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { ClubEvent } from "@/lib/events";
import { TIME_ZONE } from "@/lib/time-zone";

const DAY = 86_400_000;

// Calendar-day difference in club time, so "Tomorrow" flips at local midnight.
const clubDay = (t: number) =>
  // en-CA formats as YYYY-MM-DD, which Date parses as UTC midnight.
  Date.parse(new Date(t).toLocaleDateString("en-CA", { timeZone: TIME_ZONE })) / DAY;

function statusLabel(e: ClubEvent, now: number) {
  if (!e.start || !e.end) return "Upcoming";
  const start = new Date(e.start).getTime();
  const end = new Date(e.end).getTime();
  if (now >= end) return null;
  if (now >= start) return "Happening now";
  const days = clubDay(start) - clubDay(now);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

/** Announcement pill for the next event, sitting above the hero headline. */
export function EventBanner({ event, href }: { event: ClubEvent; href: string }) {
  // The page is prerendered, so the live label is worked out after hydration.
  const [label, setLabel] = useState<string | null>("Upcoming");

  useEffect(() => {
    const tick = () => setLabel(statusLabel(event, Date.now()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [event]);

  if (!label) return null;
  const live = label === "Happening now";

  return (
    <Link
      href={href}
      className="rise group inline-flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] p-1.5 pr-4 text-sm text-white transition-colors hover:border-white/30 hover:bg-white/[0.08] sm:pr-5"
      style={{ "--d": "150ms" } as CSSProperties}
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-knight-600 px-3 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider">
        {live && <span className="size-1.5 rounded-full bg-white" aria-hidden />}
        {label}
      </span>
      <span className="min-w-0 truncate">
        <span className="font-semibold">{event.title}</span>
        {event.date && <span className="hidden text-white/55 sm:inline"> · {event.date}, {event.time.split(" · ").pop()}</span>}
        {event.place && <span className="hidden text-white/55 lg:inline"> · {event.place}</span>}
      </span>
      <span className="shrink-0 text-white/55 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden>
        →
      </span>
    </Link>
  );
}
