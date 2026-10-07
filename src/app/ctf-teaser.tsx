"use client";

import { useEffect, useState } from "react";

type Snapshot = {
  title: string;
  status: "upcoming" | "live" | "paused" | "ended";
  startAt: string | null;
  players: number;
  top: { name: string; score: number }[];
};

const statusText: Record<Snapshot["status"], string> = {
  upcoming: "starting soon",
  live: "live now",
  paused: "closed",
  ended: "final results",
};

/** Terminal-style card on the landing page: live contest status and the top three. */
export function CtfTeaser() {
  const [snap, setSnap] = useState<Snapshot | null | "error">(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/ctf/status")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Snapshot) => !cancelled && setSnap(data))
      .catch(() => !cancelled && setSnap("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const data = snap && snap !== "error" ? snap : null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/15 backdrop-blur" data-reveal="up">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
        <span className="size-2.5 rounded-full bg-white/25" />
        <span className="size-2.5 rounded-full bg-white/25" />
        <span className="size-2.5 rounded-full bg-white/25" />
        <p className="ml-2 flex-1 truncate font-mono text-xs text-white/55">~/ctf/scoreboard</p>
        {data && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-knight-300">
            {data.status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-green-400" aria-hidden />}
            {statusText[data.status]}
          </span>
        )}
      </div>

      <div className="p-5 font-mono text-sm">
        <p className="text-white/50">{"$ cat leaderboard | head -3"}</p>
        {data && data.top.length > 0 ? (
          <ol className="mt-4 space-y-2.5">
            {data.top.map((r, i) => (
              <li key={`${r.name}-${i}`} className="flex items-center gap-3">
                <span className="w-5 text-knight-300">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-sans text-base font-bold">{r.name}</span>
                <span className="tabular-nums text-white/70">{r.score} pts</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-white/70">
            {snap === null
              ? "loading…"
              : data && data.status === "upcoming"
                ? "No scores yet. The contest hasn't started."
                : "No scores yet. Be the first to capture a flag."}
          </p>
        )}
        <p className="mt-5 border-t border-white/10 pt-4 text-white/50">
          {data ? `${data.players} registered player${data.players === 1 ? "" : "s"}` : " "}
          <span className="caret" aria-hidden />
        </p>
      </div>
    </div>
  );
}
