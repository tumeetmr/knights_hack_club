import Link from "next/link";
import type { ReactNode } from "react";
import { toggleContestPausedAction } from "@/lib/ctf/actions";
import { contestStatus } from "@/lib/ctf/contest";
import {
  countPlayers,
  countSolves,
  getContest,
  getLeaderboard,
  listChallengesWithSolves,
  listRecentSolves,
} from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { AutoRefresh } from "../(player)/_components/auto-refresh";
import { timeAgo } from "./_components/format";
import { AdminShell, PageHeader } from "./_components/shell";
import { describeStatus } from "./_components/status";
import { btnDanger, btnGhost, btnPrimary, btnSmall, card } from "./_components/styles";

export default async function AdminOverview() {
  await requireAdmin();
  const [contest, list, players, solveTotal, recent, top] = await Promise.all([
    getContest(),
    listChallengesWithSolves(),
    countPlayers(),
    countSolves(),
    listRecentSolves(8),
    getLeaderboard(5),
  ]);

  const status = contestStatus(contest);
  const info = describeStatus(status, contest);
  const published = list.filter((c) => c.published);
  const livePoints = published.reduce((sum, c) => sum + c.points, 0);

  return (
    <AdminShell>
      {status === "live" && <AutoRefresh every={30_000} />}
      <PageHeader title="Overview" description="How the CTF is going right now." />

      {/* Status: the one thing an organizer needs to know at a glance. */}
      <section className={`${card} flex flex-wrap items-center justify-between gap-5`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ring-1 ${info.badge}`}>
              {status === "live" && <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-green-600 align-middle" aria-hidden />}
              {info.label}
            </span>
            <h2 className="text-xl font-bold tracking-tight">{contest.title}</h2>
          </div>
          <p className="mt-2 text-ink/70">{info.text}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status !== "ended" && (
            <form action={toggleContestPausedAction}>
              <button type="submit" className={contest.paused ? btnPrimary : btnDanger}>
                {contest.paused ? "Reopen the CTF" : "Close the CTF now"}
              </button>
            </form>
          )}
          <Link href="/ctf/admin/settings" className={btnGhost}>
            {status === "ended" ? "Extend in settings" : "Change dates"}
          </Link>
        </div>
      </section>

      {published.length === 0 && (
        <p className="rounded-2xl bg-amber-50 px-5 py-4 text-amber-900 ring-1 ring-amber-700/20">
          <strong>Players can&apos;t see any challenges yet.</strong>{" "}
          {list.length === 0 ? "Add your first one" : "Publish at least one"} on the{" "}
          <Link href="/ctf/admin/challenges" className="font-bold underline underline-offset-4">
            Challenges tab
          </Link>
          .
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Players registered" value={players} />
        <Stat label="Flags captured" value={solveTotal} />
        <Stat label="Challenges live" value={published.length} sub={`of ${list.length}`} />
        <Stat label="Points available" value={livePoints} />
      </dl>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Recent solves" action={<Link href="/ctf/admin/players" className="text-sm font-bold text-knight-600 hover:text-ink">All players →</Link>}>
          {recent.length ? (
            <ul className="divide-y divide-ink/10">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      <strong>{s.player}</strong> <span className="text-ink/60">solved</span> {s.challenge}
                    </span>
                    <span className="font-mono text-xs text-ink/50">{timeAgo(s.solvedAt)}</span>
                  </span>
                  <span className="shrink-0 font-mono text-sm font-bold text-knight-600">+{s.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No flags captured yet. Solves show up here as they happen.</Empty>
          )}
        </Panel>

        <Panel title="Top players" action={<a href="/ctf/leaderboard" target="_blank" className="text-sm font-bold text-knight-600 hover:text-ink">Public leaderboard ↗</a>}>
          {top.length ? (
            <ol className="divide-y divide-ink/10">
              {top.map((r, i) => (
                <li key={r.playerId} className="flex items-center gap-3 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mist font-mono text-sm font-bold">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{r.name}</span>
                    <span className="font-mono text-xs text-ink/50">
                      {r.solved} solve{r.solved === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="headline shrink-0 text-3xl tabular-nums text-knight-600">{r.score}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty>Nobody has scored yet.</Empty>
          )}
        </Panel>
      </div>

      <section className={`${card} flex flex-wrap items-center justify-between gap-3`}>
        <p className="font-bold">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/ctf/admin/challenges/new" className={`${btnPrimary} ${btnSmall}`}>+ Add challenge</Link>
          <Link href="/ctf/admin/players" className={`${btnGhost} ${btnSmall}`}>Reset a password</Link>
          <a href="/ctf/admin/export" className={`${btnGhost} ${btnSmall}`}>Download backup</a>
        </div>
      </section>
    </AdminShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10 sm:p-5">
      <dt className="font-mono text-xs uppercase tracking-wider text-ink/55">{label}</dt>
      <dd className="mt-1 flex items-baseline gap-1.5">
        <span className="headline text-5xl tabular-nums">{value}</span>
        {sub && <span className="font-mono text-sm text-ink/50">{sub}</span>}
      </dd>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={card}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-mist px-4 py-6 text-center text-sm text-ink/60">{children}</p>;
}
