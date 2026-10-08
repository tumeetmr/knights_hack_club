import { notFound } from "next/navigation";
import { deleteChallengeAction, duplicateChallengeAction } from "@/lib/ctf/actions";
import { toId } from "@/lib/form";
import { getChallenge, listChallenges, listSolvers } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { ChallengeForm } from "../../_components/challenge-form";
import { ConfirmButton } from "../../_components/confirm-button";
import { timeAgo } from "../../_components/format";
import { AdminShell, PageHeader } from "../../_components/shell";
import { btnDanger, btnGhost, btnSmall, card } from "../../_components/styles";

export default async function EditChallengePage({ params }: PageProps<"/ctf/admin/challenges/[id]">) {
  await requireAdmin();
  const challengeId = toId((await params).id);
  if (!challengeId) notFound();

  const [challenge, list, solvers] = await Promise.all([getChallenge(challengeId), listChallenges(), listSolvers(challengeId)]);
  if (!challenge) notFound();
  const categories = [...new Set(list.map((c) => c.category))];

  return (
    <AdminShell>
      <PageHeader back={{ href: "/ctf/admin/challenges", label: "Challenges" }} title={challenge.title} />

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <ChallengeForm initial={challenge} categories={categories} />

        <aside className="grid gap-5 lg:sticky lg:top-36">
          <section className={card}>
            <p className="font-mono text-xs uppercase tracking-wider text-ink/55">Status</p>
            <p className="mt-1 font-bold">{challenge.published ? "Published: players can see it" : "Draft: hidden from players"}</p>
            <div className="mt-4 grid gap-2">
              {challenge.published && (
                <a href={`/ctf/challenges/${challenge.id}`} target="_blank" className={`${btnGhost} ${btnSmall}`}>
                  View as a player ↗
                </a>
              )}
              <form action={duplicateChallengeAction}>
                <input type="hidden" name="id" value={challenge.id} />
                <button type="submit" className={`${btnGhost} ${btnSmall} w-full`}>Duplicate</button>
              </form>
              <form action={deleteChallengeAction}>
                <input type="hidden" name="id" value={challenge.id} />
                <ConfirmButton
                  message={`Delete “${challenge.title}”? Its solves and points are removed too. This can't be undone.`}
                  className={`${btnDanger} ${btnSmall} w-full`}
                >
                  Delete challenge
                </ConfirmButton>
              </form>
            </div>
          </section>

          <section className={card}>
            <p className="font-mono text-xs uppercase tracking-wider text-ink/55">Solved by</p>
            <p className="headline mt-1 text-5xl tabular-nums">{solvers.length}</p>
            {solvers.length > 0 ? (
              <ol className="mt-3 grid max-h-80 gap-1.5 overflow-y-auto">
                {solvers.map((s, i) => (
                  <li key={s.playerId} className="flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-sm">
                    <span className="w-5 shrink-0 font-mono text-xs text-ink/45">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-ink/50">{timeAgo(s.solvedAt)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1 text-sm text-ink/60">Nobody yet.</p>
            )}
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
