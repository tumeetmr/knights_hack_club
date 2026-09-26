"use client";

import { useRef, useState } from "react";

type Event = {
  month: string;
  time: string;
  title: string;
  body: string;
  kind: string;
};

export function EventsSlider({ events }: { events: Event[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "grid size-14 place-items-center rounded-full border-2 border-ink text-xl transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-25";

  return (
    <div>
      <div className="mx-auto flex max-w-7xl justify-end gap-3 px-5 sm:px-8">
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
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 outline-none [--gutter:1.25rem] [padding-inline:max(var(--gutter),calc((100%_-_80rem)/2_+_var(--gutter)))] [scroll-padding-inline:max(var(--gutter),calc((100%_-_80rem)/2_+_var(--gutter)))] sm:[--gutter:2rem]"
      >
        {events.map((e, i) => (
          <li
            key={e.title}
            className="flex w-[82vw] max-w-[23rem] shrink-0 snap-start flex-col rounded-3xl bg-mist p-7 transition hover:bg-knight-50"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                {e.kind}
              </span>
              <span className="font-mono text-xs text-ink/40">
                {String(i + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
              </span>
            </div>
            <p className="headline mt-10 text-6xl text-knight-600">{e.month}</p>
            <p className="mt-2 font-mono text-xs text-ink/50">{e.time}</p>
            <h3 className="mt-6 text-2xl font-bold leading-tight tracking-tight">{e.title}</h3>
            <p className="mt-3 text-ink/70">{e.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
