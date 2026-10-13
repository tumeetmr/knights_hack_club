"use client";

import { useEffect, useRef, useState } from "react";

// Public-domain or CC BY recordings from Wikimedia Commons, re-encoded to 96 kbps in public/audio/halloween.
// CC BY tracks must keep their credit visible.
const tracks = [
  { src: "/audio/halloween/danse.mp3", title: "Danse Macabre", by: "Saint-Saëns", credit: "Kevin MacLeod (incompetech.com) · CC BY 3.0" },
  { src: "/audio/halloween/toccata.mp3", title: "Toccata & Fugue in D minor", by: "J. S. Bach", credit: "Kevin MacLeod (incompetech.com) · CC BY 3.0" },
  { src: "/audio/halloween/bald.mp3", title: "Night on Bald Mountain", by: "Mussorgsky", credit: "Public domain" },
  { src: "/audio/halloween/king.mp3", title: "In the Hall of the Mountain King", by: "Grieg", credit: "Musopen Symphony · Public domain" },
  { src: "/audio/halloween/marionette.mp3", title: "Funeral March of a Marionette", by: "Gounod", credit: "San Francisco Symphony, 1929 · Public domain" },
];

// Set once the player pauses the record, so later visits stay quiet.
const MUTED_KEY = "ctf-music-muted";

/** Floating record for the Halloween CTF: starts on arrival, click to play or pause. It spins only while music plays. */
export function VinylPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const track = tracks[index];

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    el.volume = 0.3;

    let muted = false;
    try {
      muted = localStorage.getItem(MUTED_KEY) === "1";
    } catch {}
    if (muted) return;

    // Browsers block sound until the visitor interacts with the page, so if the first try is refused
    // (a fresh load rather than an in-app redirect), start on their first click or key press instead.
    const events = ["pointerdown", "keydown"] as const;
    const start = (e: Event) => {
      events.forEach((name) => window.removeEventListener(name, start));
      // A press on the record itself is handled by its own toggle.
      if (e.target instanceof Element && e.target.closest(".vinyl")) return;
      if (el.paused) el.play().catch(() => {});
    };
    el.play().catch(() => events.forEach((e) => window.addEventListener(e, start)));
    return () => events.forEach((e) => window.removeEventListener(e, start));
  }, []);

  // Swap the source by hand so playback carries straight on to the next record.
  function next() {
    const i = (index + 1) % tracks.length;
    setIndex(i);
    const el = audio.current;
    if (!el) return;
    el.src = tracks[i].src;
    el.play().catch(() => setPlaying(false));
  }

  function toggle() {
    const el = audio.current;
    if (!el) return;
    const play = el.paused;
    if (play) el.play().catch(() => setPlaying(false));
    else el.pause();
    try {
      if (play) localStorage.removeItem(MUTED_KEY);
      else localStorage.setItem(MUTED_KEY, "1");
    } catch {}
  }

  return (
    <>
      <audio
        ref={audio}
        src={track.src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        title={`${track.title} · ${track.by}\n${track.credit}`}
        className="vinyl fixed bottom-4 right-4 z-40 size-11 rounded-full shadow-lg shadow-black/40 transition active:scale-95 sm:bottom-6 sm:right-6"
        data-playing={playing || undefined}
      >
        <span className="absolute inset-[34%] grid place-items-center rounded-full bg-knight-500 text-[0.55rem] ring-2 ring-black/40">
          🎃
        </span>
        <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      </button>
    </>
  );
}
