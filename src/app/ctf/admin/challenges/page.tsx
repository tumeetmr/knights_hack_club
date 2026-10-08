import Link from "next/link";
import { togglePublishedAction } from "@/lib/ctf/actions";
import { listChallengesWithSolves } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { FormMessage } from "@/components/form-ui";
import { RowMenu } from "../_components/row-menu";
import { AdminShell, PageHeader } from "../_components/shell";
import { btnGhost, btnPrimary, btnSmall, card } from "../_components/styles";

const filters = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "drafts", label: "Drafts" },
] as const;

export default async function ChallengesAdminPage({ searchParams }: PageProps<"/ctf/admin/challenges">) {
  await requireAdmin();
  const [list, params] = await Promise.all([listChallengesWithSolves(), searchParams]);
  const show = filters.find((f) => f.key === params.show)?.key ?? "all";
  const added = typeof params.added === "string" ? params.added : null;

  const counts = { all: list.length, published: list.filter((c) => c.published).length, drafts: list.filter((c) => !c.published).length };
  const shown = list.filter((c) => (show === "all" ? true : show === "published" ? c.published : !c.published));
  const livePoints = list.filter((c) => c.published).reduce((sum, c) => sum + c.points, 0);

  return (
    <AdminShell>
      <PageHeader
        title="Challenges"
        description={
          <>
            {counts.published} of {counts.all} published · {livePoints} points available. Players see them in this order, so put the
            easiest one first.
          </>
        }
        actions={
          <>
            <Link href="/ctf/admin/challenges/new" className={btnPrimary}>+ Add challenge</Link>
            <Link href="/ctf/admin/import" className={btnGhost}>Import</Link>
            <a href="/ctf/admin/export" className={btnGhost}>Export</a>
          </>
        }
      />

      {added && <FormMessage state={{ ok: `Added “${added}”.` }} />}

      <section className={`${card} !p-0`}>
        <div className="flex gap-1 border-b border-ink/10 px-3 pt-2 sm:px-4" role="group" aria-label="Filter challenges">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/ctf/admin/challenges" : `/ctf/admin/challenges?show=${f.key}`}
              aria-current={show === f.key ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-bold transition ${
                show === f.key ? "border-knight-600 text-ink" : "border-transparent text-ink/55 hover:text-ink"
              }`}
            >
              {f.label} <span className="font-mono text-xs font-medium text-ink/45">{counts[f.key]}</span>
            </Link>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-bold">{list.length === 0 ? "No challenges yet." : "Nothing here."}</p>
            <p className="mt-1 text-sm text-ink/60">
              {list.length === 0 ? "Add one by hand, or import a whole set from JSON." : "Try another filter."}
            </p>
            {list.length === 0 && (
              <Link href="/ctf/admin/challenges/new" className={`${btnPrimary} mt-5`}>+ Add your first challenge</Link>
            )}
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[2.5rem_1fr_5rem_5rem_7.5rem_9.5rem] gap-3 border-b border-ink/10 px-5 py-2.5 font-mono text-[0.6875rem] uppercase tracking-wider text-ink/50 md:grid">
              <span>#</span>
              <span>Challenge</span>
              <span className="text-right">Points</span>
              <span className="text-right">Solves</span>
              <span>Status</span>
              <span className="sr-only">Actions</span>
            </div>
            <ol className="divide-y divide-ink/10">
              {shown.map((c) => {
                const index = list.findIndex((x) => x.id === c.id);
                return (
                  <li
                    key={c.id}
                    className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 sm:px-5 md:grid-cols-[2.5rem_1fr_5rem_5rem_7.5rem_9.5rem]"
                  >
                    <span className="font-mono text-sm text-ink/45">{String(index + 1).padStart(2, "0")}</span>

                    <div className="min-w-0">
                      <Link href={`/ctf/admin/challenges/${c.id}`} className="block truncate font-bold hover:text-knight-600">
                        {c.title}
                      </Link>
                      <p className="truncate text-sm text-ink/55">
                        <span className="font-mono text-xs uppercase tracking-wider text-knight-600">{c.category}</span>
                        {c.location && <> · 📍 {c.location}</>}
                      </p>
                      {/* Phones get the numbers here instead of in columns. */}
                      <p className="mt-1 font-mono text-xs text-ink/50 md:hidden">
                        {c.value}{c.value < c.points && `/${c.points}`} pts · {c.solveCount} solve{c.solveCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <span className="hidden text-right font-mono font-bold tabular-nums md:block" title={`Starts at ${c.points}`}>
                      {c.value}
                      {c.value < c.points && <span className="block text-xs font-normal text-ink/45">of {c.points}</span>}
                    </span>
                    <span className="hidden text-right font-mono tabular-nums text-ink/70 md:block">{c.solveCount}</span>

                    <form action={togglePublishedAction} className="col-start-2 row-start-2 md:col-start-auto md:row-start-auto">
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        title={c.published ? "Visible to players. Click to hide." : "Hidden from players. Click to publish."}
                        className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3 font-mono text-xs font-bold uppercase tracking-wider ring-1 transition ${
                          c.published
                            ? "bg-green-100 text-green-900 ring-green-700/20 hover:bg-green-200"
                            : "bg-mist text-ink/60 ring-ink/10 hover:bg-knight-50"
                        }`}
                      >
                        <span className={`size-2 rounded-full ${c.published ? "bg-green-600" : "bg-ink/25"}`} aria-hidden />
                        {c.published ? "Published" : "Draft"}
                      </button>
                    </form>

                    <div className="col-start-3 row-span-2 row-start-1 flex items-center justify-end gap-1 md:col-start-auto md:row-span-1 md:row-start-auto">
                      <Link href={`/ctf/admin/challenges/${c.id}`} className={`${btnGhost} ${btnSmall}`}>Edit</Link>
                      <RowMenu id={c.id} title={c.title} first={index === 0} last={index === list.length - 1} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </section>

      <p className="text-center text-sm text-ink/50">Tip: click a Published / Draft badge to switch it. Drafts are hidden from players.</p>
    </AdminShell>
  );
}
