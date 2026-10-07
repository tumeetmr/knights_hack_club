import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { contestStatus } from "@/lib/ctf/contest";
import { getPlayer } from "@/lib/ctf/player-session";
import { countPlayers, getContest, getLeaderboard } from "@/lib/ctf/queries";
import { AutoRefresh } from "../_components/auto-refresh";

export const metadata: Metadata = { title: "Leaderboard | Knights Hack CTF" };

const medal = ["bg-[#f5c542] text-ink", "bg-[#cfd6df] text-ink", "bg-[#d99a63] text-ink"];

export default async function LeaderboardPage() {
  const [player, contest, rows, registered] = await Promise.all([
    getPlayer(),
    getContest(),
    getLeaderboard(100),
    countPlayers(),
  ]);
  const status = contestStatus(contest);
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <>
      {status === "live" && <AutoRefresh every={20_000} />}

      <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -left-32 -top-32 size-[320px] rounded-full bg-knight-500/40 blur-3xl sm:size-[520px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
          <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> ctf --leaderboard"}</p>
          <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">Leaderboard</h1>
          <p className="mt-4 font-mono text-sm text-white/60">
            {registered} registered · {rows.length} on the board
            {status === "live" && " · updates live"}
          </p>

          {podium.length > 0 && (
            <ol className="mt-10 grid gap-3 sm:grid-cols-3">
              {podium.map((r, i) => (
                <li
                  key={r.playerId}
                  className="rise rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 sm:p-6"
                  style={{ "--d": `${150 + i * 120}ms` } as CSSProperties}
                >
                  <div className="flex items-center justify-between">
                    <span className={`headline grid size-12 place-items-center rounded-full text-3xl ${medal[i]}`}>{i + 1}</span>
                    {r.playerId === player?.id && <span className="rounded-full bg-knight-300 px-2.5 py-1 font-mono text-[0.625rem] font-bold uppercase tracking-wider text-ink">You</span>}
                  </div>
                  <p className="mt-5 truncate text-2xl font-bold tracking-tight">{r.name}</p>
                  <p className="headline mt-1 text-6xl tabular-nums text-knight-300">{r.score}</p>
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
                {player ? "Go to problems" : "Register to play"}
              </Link>
            </div>
          ) : rest.length > 0 ? (
            <ol>
              {rest.map((r, i) => {
                const me = r.playerId === player?.id;
                return (
                  <li
                    key={r.playerId}
                    className={`flex items-center gap-4 border-b border-ink/10 px-3 py-4 first:border-t sm:px-5 ${me ? "rounded-2xl bg-knight-50 ring-1 ring-knight-500/30" : ""}`}
                  >
                    <span className="w-9 shrink-0 font-mono text-sm font-medium text-ink/50">#{i + 4}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold tracking-tight">
                        {r.name}
                        {me && <span className="ml-2 rounded-full bg-knight-600 px-2 py-0.5 align-middle font-mono text-[0.625rem] font-bold uppercase tracking-wider text-white">You</span>}
                      </span>
                      <span className="font-mono text-xs text-ink/50">
                        {r.solved} solve{r.solved === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="headline text-4xl tabular-nums text-knight-600">{r.score}</span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-4 text-center text-ink/55">The rest of the field will show up here as flags get captured.</p>
          )}
        </div>
      </section>
    </>
  );
}
