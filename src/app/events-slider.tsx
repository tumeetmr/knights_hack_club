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
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "grid size-12 place-items-center rounded-full border-2 border-ink text-lg transition active:scale-95 sm:size-14 sm:text-xl hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-25";

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
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 outline-none sm:mt-8 sm:gap-4 [--gutter:1.25rem] [padding-inline:max(var(--gutter),calc((100%_-_80rem)/2_+_var(--gutter)))] [scroll-padding-inline:max(var(--gutter),calc((100%_-_80rem)/2_+_var(--gutter)))] sm:[--gutter:2rem]"
      >
        {events.map((e, i) => (
          <li
            key={e.title}
            className="flex w-[80vw] max-w-[23rem] shrink-0 snap-start flex-col rounded-3xl bg-mist p-6 transition hover:bg-knight-50 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                {e.kind}
              </span>
              <span className="font-mono text-xs text-ink/40">
                {String(i + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
              </span>
            </div>
            <p className="headline mt-8 text-5xl text-knight-600 sm:mt-10 sm:text-6xl">{e.month}</p>
            <p className="mt-2 font-mono text-xs text-ink/50">{e.time}</p>
            <h3 className="mt-5 text-xl font-bold sm:mt-6 sm:text-2xl leading-tight tracking-tight">{e.title}</h3>
            <p className="mt-3 text-ink/70">{e.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
