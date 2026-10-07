"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { type ClubEvent, eventPath, googleCalendarUrl } from "./events";
import { icons } from "./ui";

const calButton =
  "inline-flex items-center gap-1.5 rounded-full border-2 border-ink/15 px-3 py-1.5 text-xs font-semibold transition hover:border-ink hover:bg-ink hover:text-white active:scale-95";

export function EventsSlider({ events }: { events: ClubEvent[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    // Scroll fires every frame while swiping; only re-render when an arrow flips.
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "grid size-12 place-items-center rounded-full border-2 border-ink text-lg transition active:scale-95 sm:size-14 sm:text-xl hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-25";

  return (
    <div>
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-5 sm:px-8">
        <a
          href="/calendar.ics"
          // Prefer a live subscription so newly confirmed events show up on their own.
          onClick={(ev) => {
            ev.preventDefault();
            window.location.href = `webcal://${window.location.host}/calendar.ics`;
          }}
          className="mr-auto inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:text-knight-600 hover:underline [&_svg]:size-5"
        >
          {icons.calendar} Subscribe to the club calendar
        </a>
        <button type="button" className={arrow} onClick={() => step(-1)} disabled={edge.start} aria-label="Previous events">
          <span aria-hidden>←</span>
        </button>
        <button type="button" className={arrow} onClick={() => step(1)} disabled={edge.end} aria-label="Next events">
          <span aria-hidden>→</span>
        </button>
      </div>

      <ol
        ref={track}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Fall 2026 events"
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 outline-none sm:mt-8 sm:gap-4 [--gutter:1.25rem] [padding-inline:max(var(--gutter),calc((100%_-_80rem)/2_+_var(--gutter)))] [scroll-padding-inline:max(var(--gutter),calc((100%_-_80rem)/2_+_var(--gutter)))] sm:[--gutter:2rem]"
      >
        {events.map((e, i) => (
          <li
            key={e.title}
            className="flex w-[80vw] max-w-[23rem] shrink-0 snap-start flex-col rounded-3xl bg-mist p-6 transition hover:bg-knight-50 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="flex gap-2">
                <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                  {e.kind}
                </span>
                {e.date && (
                  <span className="rounded-full bg-knight-600 px-3 py-1 text-xs font-semibold text-white">
                    Confirmed
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-ink/40">
                {String(i + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
              </span>
            </div>
            <p className="headline mt-8 text-5xl text-knight-600 sm:mt-10 sm:text-6xl">{e.date ?? e.month}</p>
            <p className="mt-2 font-mono text-xs text-ink/50">{e.time}</p>
            <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink/50 [&_svg]:size-3.5">
              {icons.pin} {e.place ?? "Welland Campus · room TBA"}
            </p>
            <h3 className="mt-5 text-xl font-bold sm:mt-6 sm:text-2xl leading-tight tracking-tight">{e.title}</h3>
            <p className="mt-3 text-ink/70">{e.body}</p>
            {e.slug && (
              <Link
                href={eventPath(e)!}
                className="mt-4 self-start text-sm font-bold text-knight-600 underline-offset-4 hover:underline"
              >
                View agenda & details →
              </Link>
            )}
            {e.start && e.end && (
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <a
                  href={googleCalendarUrl({ ...e, start: e.start, end: e.end })}
                  target="_blank"
                  rel="noreferrer"
                  className={calButton}
                >
                  + Google Calendar
                </a>
                <a href="/calendar.ics" download className={calButton}>
                  + Apple / Outlook
                </a>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
