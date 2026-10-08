"use client";

import Link from "next/link";
import { useState } from "react";

export type BoardChallenge = {
  id: number;
  title: string;
  category: string;
  /** Current value; drops as more people solve it. */
  points: number;
  basePoints: number;
  solveCount: number;
  solved: boolean;
};

export function ChallengeBoard({ challenges }: { challenges: BoardChallenge[] }) {
  const categories = ["All", ...new Set(challenges.map((c) => c.category))];
  const [category, setCategory] = useState("All");
  const shown = category === "All" ? challenges : challenges.filter((c) => c.category === category);
  // Point first-timers at the first challenge in the organizers' order (put the easiest one first).
  const startId = challenges.some((c) => c.solved) ? null : challenges[0]?.id;

  return (
    <div>
      {categories.length > 2 && (
        <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
                category === c ? "bg-ink text-white" : "bg-mist text-ink ring-1 ring-ink/10 hover:bg-knight-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <li key={c.id}>
            <Link
              href={`/ctf/challenges/${c.id}`}
              className={`flex h-full items-start justify-between gap-4 rounded-3xl p-5 ring-1 transition active:scale-[0.99] ${
                c.solved
                  ? "bg-knight-600 text-white ring-knight-600 hover:bg-knight-500"
                  : c.id === startId
                    ? "bg-paper text-ink ring-2 ring-knight-500 hover:ring-knight-600"
                    : "bg-paper text-ink ring-ink/10 hover:ring-knight-500/50"
              }`}
            >
              <span className="min-w-0">
                <span className={`font-mono text-xs font-medium uppercase tracking-wider ${c.solved ? "text-knight-300" : "text-knight-600"}`}>
                  {c.category}
                </span>
                <span className="mt-1.5 block text-xl font-bold leading-tight tracking-tight">{c.title}</span>
                <span className={`mt-2 block font-mono text-xs ${c.solved ? "text-white/60" : "text-ink/50"}`}>
                  {c.solveCount} solve{c.solveCount === 1 ? "" : "s"}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <span className="headline text-4xl tabular-nums">{c.points}</span>
                {c.points < c.basePoints && (
                  <span className={`-mt-2 font-mono text-xs line-through ${c.solved ? "text-white/50" : "text-ink/40"}`}>
                    <span className="sr-only">was </span>
                    {c.basePoints}
                  </span>
                )}
                {c.id === startId && (
                  <span className="rounded-full bg-knight-500 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white">
                    Start here
                  </span>
                )}
                {c.solved && (
                  <span className="rounded-full bg-white/20 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider">
                    ✓ Solved
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
