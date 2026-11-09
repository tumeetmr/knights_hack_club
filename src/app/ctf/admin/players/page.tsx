import { listPlayersForAdmin } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { input } from "@/components/form-ui";
import { shortDate } from "../_components/format";
import { ResetPassword } from "../_components/reset-password-form";
import { AdminShell, PageHeader } from "../_components/shell";
import { btnGhost, card, table, tableWrap, td, th, toolbar } from "../_components/styles";

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

      <section className={`${card} !p-0 overflow-hidden`}>
        <div className={toolbar}>
          <form role="search" className="flex min-w-0 flex-1 basis-64 gap-2">
            <label htmlFor="q" className="sr-only">Search players</label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by name or email" className={`${input} min-w-0 flex-1`} />
            <button type="submit" className={btnGhost}>Search</button>
          </form>
          <p className="font-mono text-xs text-ink/55">
            {q ? `${list.length} match${list.length === 1 ? "" : "es"} for “${q}”` : `${list.length} registered`}
          </p>
        </div>

        {list.length === 0 ? (
          <p className="border-t border-ink/10 px-5 py-12 text-center text-ink/60">{q ? "No players match that search." : "Nobody has registered yet."}</p>
        ) : (
          <div className={tableWrap}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Player</th>
                  <th className={`${th} text-right`}>Score</th>
                  <th className={`${th} text-right`}>Solves</th>
                  <th className={th}>Joined</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/40">
                    <td className={td}>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-ink/60">{p.email}</p>
                    </td>
                    <td className={`${td} text-right font-mono font-bold tabular-nums text-knight-600`}>{p.score}</td>
                    <td className={`${td} text-right font-mono tabular-nums`}>{p.solved}</td>
                    <td className={`${td} whitespace-nowrap font-mono text-ink/70`}>{shortDate(p.createdAt)}</td>
                    <td className={`${td} text-right`}><ResetPassword email={p.email} name={p.name} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
