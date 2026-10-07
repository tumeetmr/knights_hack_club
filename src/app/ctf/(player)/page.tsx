import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { contestStatus, formatContestTime } from "@/lib/ctf/contest";
import { getPlayer } from "@/lib/ctf/player-session";
import { getContest, getPlayerRank, listPlayerSolves, listPublicChallenges } from "@/lib/ctf/queries";
import { AutoRefresh } from "./_components/auto-refresh";
import { ChallengeBoard } from "./_components/challenge-board";
import { Countdown } from "./_components/countdown";

const statusChip = {
  upcoming: ["Starts soon", "bg-knight-300 text-ink"],
  live: ["Live now", "bg-green-400 text-ink"],
  paused: ["Closed", "bg-amber-300 text-ink"],
  ended: ["Ended", "bg-white text-ink"],
} as const;

export default async function ProblemsPage() {
  const player = await getPlayer();
  if (!player) redirect("/ctf/register");

  const [contest, list, mine, rank] = await Promise.all([
    getContest(),
    listPublicChallenges(),
    listPlayerSolves(player.id),
    getPlayerRank(player.id),
  ]);

  const status = contestStatus(contest);
  const [chipLabel, chipClass] = statusChip[status];
  const open = status === "live" || status === "ended";

  const solvedIds = new Set(mine.map((s) => s.challengeId));
  const score = mine.reduce((sum, s) => sum + s.points, 0);
  const totalPoints = list.reduce((sum, c) => sum + c.points, 0);

  const stats = [
    ["Your score", String(score)],
    ["Rank", rank ? `#${rank}` : "–"],
    ["Solved", `${solvedIds.size}/${list.length}`],
  ] as const;

  return (
    <>
      {status === "live" && <AutoRefresh every={30_000} />}

      <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -right-32 -top-32 size-[320px] rounded-full bg-knight-500/40 blur-3xl sm:size-[520px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> ctf --problems"}</p>
            <span className={`rounded-full px-3 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-wider ${chipClass}`}>
              {status === "live" && <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-ink align-middle" aria-hidden />}
              {chipLabel}
            </span>
          </div>
          <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">{contest.title}</h1>
          <p className="mt-4 text-white/70">
            Welcome, <span className="font-bold text-white">{player.name}</span>.{" "}
            {contest.startAt && contest.endAt
              ? `${formatContestTime(contest.startAt)} → ${formatContestTime(contest.endAt)}`
              : "Open to everyone, anytime."}
          </p>

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
            {stats.map(([k, v], i) => (
              <div key={k} className="rise rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 sm:p-4" style={{ "--d": `${200 + i * 100}ms` } as CSSProperties}>
                <dt className="font-mono text-[0.625rem] uppercase tracking-wider text-white/55 sm:text-xs">{k}</dt>
                <dd className="headline mt-1 text-4xl tabular-nums sm:text-5xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          {open ? (
            list.length ? (
              <>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <h2 className="headline text-5xl sm:text-6xl">Problems</h2>
                  <p className="font-mono text-sm text-ink/60">
                    {list.length} challenges · {totalPoints} points
                    {status === "ended" && " · CTF over"}
                  </p>
                </div>
                <ChallengeBoard
                  challenges={list.map((c) => ({ ...c, solved: solvedIds.has(c.id) }))}
                  canSubmit={status === "live"}
                />
              </>
            ) : (
              <Locked title="No problems yet." body="Challenges haven't been published. Check back soon." />
            )
          ) : status === "upcoming" && contest.startAt ? (
            <div className="grid justify-items-center gap-8 py-6 text-center">
              <Locked title="Problems unlock at the start." body="Get your tools ready. The challenges appear here the moment the contest begins." />
              <div className="rounded-3xl bg-ink p-5 text-white">
                <Countdown to={contest.startAt.toISOString()} />
              </div>
            </div>
          ) : (
            <Locked title="CTF closed." body="The organizers have closed the CTF for now. Problems will be back soon." />
          )}
        </div>
      </section>
    </>
  );
}

function Locked({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <p className="headline text-5xl sm:text-6xl">{title}</p>
      <p className="mt-4 text-ink/65">{body}</p>
    </div>
  );
}
