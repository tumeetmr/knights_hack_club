"use client";

import { useSyncExternalStore } from "react";

const subscribe = (tick: () => void) => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
const serverSeconds = () => null;

const pad = (n: number) => String(n).padStart(2, "0");

function split(seconds: number) {
  const s = Math.max(0, seconds);
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

/** Live countdown: to the start, then to the submission deadline, then the showcase and the end. */
export function MissionClock({ start, deadline, end }: { start: string; deadline: string; end: string }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const t = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

  let label = "The gates open in";
  let units: [string, number][] | null = null;
  let note: string | null = null;

  if (now === null) {
    units = null;
  } else if (now < t(start)) {
    const [d, h, m, s] = split(t(start) - now);
    units = [["days", d], ["hours", h], ["min", m], ["sec", s]];
  } else if (now < t(deadline)) {
    label = "Submissions close in";
    const [, h, m, s] = split(t(deadline) - now);
    units = [["hours", h], ["min", m], ["sec", s]];
  } else if (now < t(end)) {
    label = "Submissions closed";
    note = "The showcase is on in the Wellness Lounge";
  } else {
    label = "The campaign is over";
    note = "Thanks for building with us. See you next term.";
  }

  // The visible digits tick every second, so screen readers get one static summary instead.
  const spoken = units
    ? `${label} ${units.map(([u, v]) => `${v} ${u}`).join(", ")}`
    : note ?? label;

  return (
    <div className="kh-clock">
      <p className="kh-label">{label}</p>
      {note ? (
        <p className="kh-h3 mt-3">{note}</p>
      ) : (
        <>
          <p className="sr-only">{spoken}</p>
          <div className="kh-tiles mt-3" aria-hidden>
            {(units ?? [["days", -1], ["hours", -1], ["min", -1], ["sec", -1]]).map(([unit, value]) => (
              <div key={unit} className="kh-tile">
                <span className="kh-tile-value">{value < 0 ? "--" : pad(value)}</span>
                <span className="kh-tile-unit">{unit}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
