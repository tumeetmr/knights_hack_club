"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { ContestStatus } from "@/lib/ctf/contest";

export type Row = { playerId: number; name: string; score: number; solved: number };
export type Board = { status: ContestStatus; registered: number; rows: Row[] };

const medal = ["bg-[#f5c542] text-ink", "bg-[#cfd6df] text-ink", "bg-[#d99a63] text-ink"];

/** Poll fast while the contest is live, slowly otherwise so a start/end still shows up. */
const LIVE_EVERY = 3_000;
const IDLE_EVERY = 30_000;

function useLiveBoard(initial: Board) {
  const [board, setBoard] = useState(initial);
  const [offline, setOffline] = useState(false);
  const status = board.status;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ctrl: AbortController | undefined;
    let stopped = false;

    const tick = async () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") {
        ctrl?.abort();
        ctrl = new AbortController();
        try {
          const res = await fetch("/ctf/scores", { cache: "no-store", signal: ctrl.signal });
          if (!res.ok) throw new Error(String(res.status));
          setBoard(await res.json());
          setOffline(false);
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          setOffline(true);
        }
      }
      if (!stopped) timer = setTimeout(tick, status === "live" ? LIVE_EVERY : IDLE_EVERY);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };

    timer = setTimeout(tick, status === "live" ? LIVE_EVERY : IDLE_EVERY);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      ctrl?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status]);

  return { board, offline };
}

/**
 * Slides rows to their new rank (FLIP) and flashes a row whose score just went up.
 * Rows are tracked by `data-player` so a player moving between podium and list still glides.
 */
function useRankAnimations(container: RefObject<HTMLDivElement | null>, rows: Row[]) {
  const prev = useRef(new Map<number, { top: number; left: number; score: number }>());

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scores = new Map(rows.map((r) => [r.playerId, r.score]));
    const next = new Map<number, { top: number; left: number; score: number }>();

    root.querySelectorAll<HTMLElement>("[data-player]").forEach((el) => {
      const id = Number(el.dataset.player);
      // Page-relative, so scrolling between polls doesn't read as movement.
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const left = rect.left + window.scrollX;
      const score = scores.get(id) ?? 0;
      next.set(id, { top, left, score });

      const before = prev.current.get(id);
      if (calm || prev.current.size === 0) return;
      if (!before) {
        el.animate([{ opacity: 0, transform: "translateY(1rem)" }, { opacity: 1, transform: "none" }], {
          duration: 500,
          easing: "cubic-bezier(0, 0, 0, 1)",
        });
        return;
      }
      const dx = before.left - left;
      const dy = before.top - top;
      if (dx || dy) {
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
          duration: 700,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        });
      }
      if (score > before.score) {
        el.querySelector("[data-score]")?.animate(
          [{ transform: "scale(1.35)", color: "#4ade80" }, { transform: "none" }],
          { duration: 1200, easing: "cubic-bezier(0, 0, 0, 1)" },
        );
      }
    });

    prev.current = next;
  }, [container, rows]);
}

export function LiveLeaderboard({ initial, me, qr }: { initial: Board; me: number | null; qr: ReactNode }) {
  const { board, offline } = useLiveBoard(initial);
  const { rows, status, registered } = board;
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  const root = useRef<HTMLDivElement>(null);
  useRankAnimations(root, rows);

  return (
    <div ref={root} className="contents">
      <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -left-32 -top-32 size-[320px] glow sm:size-[520px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
          <div className="flex items-end justify-between gap-8">
            <div className="min-w-0">
              <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> ctf --leaderboard"}</p>
              <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">Leaderboard</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-1.5 font-mono text-sm text-white/60">
                <span>
                  {registered} registered · {rows.length} on the board
                </span>
                {status === "live" &&
                  (offline ? (
                    <span className="text-amber-300">· reconnecting…</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-green-400">
                      · <span className="inline-block size-2 animate-pulse rounded-full bg-green-400" aria-hidden />
                      live
                    </span>
                  ))}
              </p>
            </div>
            <div className="hidden w-52 shrink-0 md:block lg:w-60">{qr}</div>
          </div>

          {podium.length > 0 && (
            <ol className="mt-10 grid gap-3 sm:grid-cols-3">
              {podium.map((r, i) => (
                <li
                  key={r.playerId}
                  data-player={r.playerId}
                  className="rise rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 sm:p-6"
                  style={{ "--d": `${150 + i * 120}ms` } as CSSProperties}
                >
                  <div className="flex items-center justify-between">
                    <span className={`headline grid size-12 place-items-center rounded-full text-3xl ${medal[i]}`}>{i + 1}</span>
                    {r.playerId === me && <span className="rounded-full bg-knight-300 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-ink">You</span>}
                  </div>
                  <p className="mt-5 truncate text-2xl font-bold tracking-tight">{r.name}</p>
                  <p data-score className="headline mt-1 origin-left text-6xl tabular-nums text-knight-300">
                    {r.score}
                  </p>
                  <p className="mt-1 font-mono text-xs text-white/55">
                    {r.solved} solve{r.solved === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          {rows.length === 0 ? (
            <div className="py-6 text-center">
              <p className="headline text-5xl sm:text-6xl">No scores yet.</p>
              <p className="mt-4 text-ink/65">Be the first to capture a flag.</p>
              <Link href="/ctf" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-7 font-bold text-white transition hover:bg-knight-600">
                {me ? "Go to challenges" : "Register to play"}
              </Link>
            </div>
          ) : rest.length > 0 ? (
            <ol>
              {rest.map((r, i) => {
                const mine = r.playerId === me;
                return (
                  <li
                    key={r.playerId}
                    data-player={r.playerId}
                    className={`relative flex items-center gap-4 border-b border-ink/10 bg-paper px-3 py-4 first:border-t sm:px-5 ${mine ? "rounded-2xl bg-knight-50 ring-1 ring-knight-500/30" : ""}`}
                  >
                    <span className="w-9 shrink-0 font-mono text-sm font-medium text-ink/50">#{i + 4}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold tracking-tight">
                        {r.name}
                        {mine && <span className="ml-2 rounded-full bg-knight-600 px-2 py-0.5 align-middle font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white">You</span>}
                      </span>
                      <span className="font-mono text-xs text-ink/50">
                        {r.solved} solve{r.solved === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span data-score className="headline origin-right text-4xl tabular-nums text-knight-600">
                      {r.score}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-4 text-center text-ink/55">The rest of the field will show up here as flags get captured.</p>
          )}
        </div>
      </section>
    </div>
  );
}
