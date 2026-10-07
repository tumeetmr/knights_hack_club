"use client";

import { useActionState, useState } from "react";
import { submitFlagAction, type SubmitState } from "@/lib/ctf/player-actions";

export type BoardChallenge = {
  id: number;
  title: string;
  category: string;
  description: string;
  hint: string;
  points: number;
  solveCount: number;
  solved: boolean;
};

export function ChallengeBoard({ challenges, canSubmit }: { challenges: BoardChallenge[]; canSubmit: boolean }) {
  const categories = ["All", ...new Set(challenges.map((c) => c.category))];
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState<number | null>(null);
  const shown = category === "All" ? challenges : challenges.filter((c) => c.category === category);

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
          <ChallengeCard
            key={c.id}
            c={c}
            open={openId === c.id}
            canSubmit={canSubmit}
            onToggle={() => setOpenId(openId === c.id ? null : c.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function ChallengeCard({ c, open, canSubmit, onToggle }: { c: BoardChallenge; open: boolean; canSubmit: boolean; onToggle: () => void }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitFlagAction, {});
  const [showHint, setShowHint] = useState(false);
  const mine = state.id === c.id ? state : {};
  const solved = c.solved || Boolean(mine.ok);

  return (
    <li className={`self-start rounded-3xl p-1.5 ring-1 transition ${open ? "bg-ink text-white ring-ink sm:col-span-2 lg:col-span-3" : solved ? "bg-knight-600 text-white ring-knight-600" : "bg-paper text-ink ring-ink/10 hover:ring-knight-500/50"}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`challenge-${c.id}`}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 rounded-[1.25rem] p-4 text-left"
      >
        <span className="min-w-0">
          <span className={`font-mono text-xs font-medium uppercase tracking-wider ${open || solved ? "text-knight-300" : "text-knight-600"}`}>
            {c.category}
          </span>
          <span className="mt-1.5 block text-xl font-bold leading-tight tracking-tight">{c.title}</span>
          <span className={`mt-2 block font-mono text-xs ${open || solved ? "text-white/60" : "text-ink/50"}`}>
            {c.solveCount + (mine.ok ? 1 : 0)} solve{c.solveCount + (mine.ok ? 1 : 0) === 1 ? "" : "s"}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className="headline text-4xl tabular-nums">{c.points}</span>
          {solved && (
            <span className="rounded-full bg-white/20 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider">
              ✓ Solved
            </span>
          )}
        </span>
      </button>

      {open && (
        <div id={`challenge-${c.id}`} className="px-4 pb-4 pt-1">
          {c.description && <p className="max-w-3xl whitespace-pre-wrap leading-relaxed text-white/80">{c.description}</p>}

          {c.hint && (
            <div className="mt-4">
              {showHint ? (
                <p className="max-w-3xl rounded-xl bg-white/10 px-4 py-3 text-sm text-white/80 ring-1 ring-white/15">
                  <span className="font-mono text-xs uppercase tracking-wider text-knight-300">Hint · </span>
                  {c.hint}
                </p>
              ) : (
                <button type="button" onClick={() => setShowHint(true)} className="text-sm font-medium text-knight-300 underline underline-offset-4 hover:text-white">
                  Show hint
                </button>
              )}
            </div>
          )}

          {solved ? (
            <p role="status" className="mt-5 inline-block rounded-xl bg-white/10 px-4 py-3 text-sm font-bold ring-1 ring-white/15">
              {mine.ok ?? "You solved this one."}
            </p>
          ) : (
            <form action={action} className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row">
              <input type="hidden" name="id" value={c.id} />
              <label htmlFor={`flag-${c.id}`} className="sr-only">Flag</label>
              <input
                id={`flag-${c.id}`}
                name="flag"
                required
                disabled={!canSubmit}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={canSubmit ? "KH{...}" : "Submissions are closed"}
                className="min-w-0 flex-1 rounded-full bg-white/10 px-5 py-3.5 font-mono text-base text-white ring-1 ring-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-knight-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={pending || !canSubmit}
                className="min-h-12 rounded-full bg-white px-7 font-bold text-ink transition hover:bg-knight-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              >
                {pending ? "Checking…" : "Submit"}
              </button>
            </form>
          )}
          {mine.error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-300">
              {mine.error}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
