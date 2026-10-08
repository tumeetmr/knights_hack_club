import Link from "next/link";
import {
  deleteChallengeAction,
  duplicateChallengeAction,
  moveChallengeAction,
  togglePublishedAction,
} from "@/lib/ctf/actions";
import { contestStatus, formatContestTime, toLocalInput, type ContestStatus } from "@/lib/ctf/contest";
import { getContest, listChallenges } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { FormMessage } from "../_components/form-ui";
import { ConfirmButton } from "./_components/confirm-button";
import { ContestForm } from "./_components/contest-form";
import { AdminShell } from "./_components/shell";
import { btnDanger, btnGhost, btnPrimary, btnSmall, card } from "./_components/styles";

const statusStyle: Record<ContestStatus, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-knight-50 text-knight-900" },
  live: { label: "Live now", className: "bg-green-100 text-green-900" },
  paused: { label: "Paused", className: "bg-amber-100 text-amber-900" },
  ended: { label: "Ended", className: "bg-ink text-white" },
};

export default async function AdminDashboard({ searchParams }: PageProps<"/ctf/admin">) {
  await requireAdmin();
  const [contest, list, params] = await Promise.all([getContest(), listChallenges(), searchParams]);

  const status = statusStyle[contestStatus(contest)];
  const published = list.filter((c) => c.published);
  const livePoints = published.reduce((sum, c) => sum + c.points, 0);
  const added = typeof params.added === "string" ? params.added : null;

  return (
    <AdminShell>
      {added && <FormMessage state={{ ok: `Added “${added}”.` }} />}

      <section className={card}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-ink/60">Contest</p>
            <h1 className="headline text-4xl sm:text-5xl">{contest.title}</h1>
          </div>
          <span className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium uppercase tracking-wider ${status.className}`}>
            {status.label}
          </span>
        </div>
        <dl className="mb-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-mist p-3.5">
            <dt className="font-mono text-xs uppercase tracking-wider text-ink/60">Starts</dt>
            <dd className="mt-1 font-medium">{formatContestTime(contest.startAt)}</dd>
          </div>
          <div className="rounded-xl bg-mist p-3.5">
            <dt className="font-mono text-xs uppercase tracking-wider text-ink/60">Ends</dt>
            <dd className="mt-1 font-medium">{formatContestTime(contest.endAt)}</dd>
          </div>
        </dl>
        <ContestForm
          // Remount when saved elsewhere so the fields show the stored values.
          key={`${contest.title}|${contest.startAt?.getTime()}|${contest.endAt?.getTime()}|${contest.paused}`}
          title={contest.title}
          start={toLocalInput(contest.startAt)}
          end={toLocalInput(contest.endAt)}
          paused={contest.paused}
        />
      </section>

      <section className={card}>
        <div className="mb-5">
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-ink/60">Challenges</p>
          <h2 className="headline text-4xl sm:text-5xl">
            {list.length} total
          </h2>
          <p className="mt-2 text-ink/60">
            {published.length} published · {livePoints} points available
          </p>
        </div>

        <div className="mb-6 grid gap-2 sm:grid-cols-3">
          <Link href="/ctf/admin/challenges/new" className={`${btnPrimary} sm:col-span-1`}>
            + Add challenge
          </Link>
          <Link href="/ctf/admin/import" className={btnGhost}>
            Import JSON
          </Link>
          <a href="/ctf/admin/export" className={btnGhost}>
            Export backup
          </a>
        </div>

        {list.length === 0 ? (
          <p className="rounded-xl bg-mist p-5 text-center text-ink/60">
            No challenges yet. Add your first one above.
          </p>
        ) : (
          <ol className="grid gap-3">
            {list.map((c, i) => (
              <li key={c.id} className="rounded-2xl bg-mist p-4 ring-1 ring-ink/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-wider text-ink/50">
                      {String(i + 1).padStart(2, "0")} · {c.category} · {c.points} pts
                    </p>
                    <Link href={`/ctf/admin/challenges/${c.id}`} className="mt-1 block break-words text-lg font-bold hover:text-knight-600">
                      {c.title}
                    </Link>
                    {c.location && <p className="mt-1 text-sm text-ink/60">📍 {c.location}</p>}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 font-mono text-[0.6875rem] font-medium uppercase tracking-wider ${
                      c.published ? "bg-green-100 text-green-900" : "bg-ink/10 text-ink/70"
                    }`}
                  >
                    {c.published ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/ctf/admin/challenges/${c.id}`} className={`${btnGhost} ${btnSmall} bg-paper`}>
                    Edit
                  </Link>
                  <form action={togglePublishedAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className={`${btnGhost} ${btnSmall} bg-paper`}>
                      {c.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={moveChallengeAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" disabled={i === 0} aria-label={`Move ${c.title} up`} className={`${btnGhost} ${btnSmall} bg-paper`}>
                      ↑
                    </button>
                  </form>
                  <form action={moveChallengeAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button type="submit" disabled={i === list.length - 1} aria-label={`Move ${c.title} down`} className={`${btnGhost} ${btnSmall} bg-paper`}>
                      ↓
                    </button>
                  </form>
                  <form action={duplicateChallengeAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className={`${btnGhost} ${btnSmall} bg-paper`}>
                      Duplicate
                    </button>
                  </form>
                  <form action={deleteChallengeAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`Delete “${c.title}”? This can't be undone.`} className={`${btnDanger} ${btnSmall}`}>
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AdminShell>
  );
}
