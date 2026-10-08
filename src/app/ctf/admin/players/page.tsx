import { listPlayersForAdmin } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { input } from "../../_components/form-ui";
import { shortDate } from "../_components/format";
import { ResetPassword } from "../_components/reset-password-form";
import { AdminShell, PageHeader } from "../_components/shell";
import { btnGhost, card } from "../_components/styles";

export default async function PlayersAdminPage({ searchParams }: PageProps<"/ctf/admin/players">) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const list = await listPlayersForAdmin(q);

  return (
    <AdminShell>
      <PageHeader
        title="Players"
        description="Everyone who registered, highest score first. Forgot a password? Find the player and reset it here."
      />

      <section className={`${card} !p-0`}>
        <form role="search" className="flex flex-wrap gap-2 border-b border-ink/10 p-4">
          <label htmlFor="q" className="sr-only">Search players</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by name or email" className={`${input} !w-auto min-w-0 flex-1`} />
          <button type="submit" className={btnGhost}>Search</button>
        </form>

        <p className="border-b border-ink/10 px-5 py-2.5 font-mono text-xs text-ink/55">
          {q ? `${list.length} match${list.length === 1 ? "" : "es"} for “${q}”` : `${list.length} registered`}
        </p>

        {list.length === 0 ? (
          <p className="px-5 py-12 text-center text-ink/60">{q ? "No players match that search." : "Nobody has registered yet."}</p>
        ) : (
          <ol className="divide-y divide-ink/10">
            {list.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="truncate text-sm text-ink/60">{p.email}</p>
                </div>
                <dl className="flex gap-5 font-mono text-sm">
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-wider text-ink/45">Score</dt>
                    <dd className="font-bold tabular-nums text-knight-600">{p.score}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-wider text-ink/45">Solves</dt>
                    <dd className="tabular-nums">{p.solved}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-wider text-ink/45">Joined</dt>
                    <dd>{shortDate(p.createdAt)}</dd>
                  </div>
                </dl>
                <ResetPassword email={p.email} name={p.name} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </AdminShell>
  );
}
