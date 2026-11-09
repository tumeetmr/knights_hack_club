import { requireAdmin } from "@/lib/ctf/session";
import { deleteRegistrationAction } from "@/lib/hackathon/actions";
import { EXPERIENCE, INTERESTS, labelFor } from "@/lib/hackathon/config";
import { listRegistrations } from "@/lib/hackathon/queries";
import { ConfirmButton } from "../_components/confirm-button";
import { shortDate } from "../_components/format";
import { AdminShell, PageHeader } from "../_components/shell";
import { btnDanger, btnGhost, btnSmall, card, table, tableWrap, td, th, toolbar } from "../_components/styles";

export default async function HackathonAdminPage() {
  await requireAdmin();
  const rows = await listRegistrations();

  return (
    <AdminShell>
      <PageHeader
        title="Hackathon"
        description="Final hackathon sign-ups. Download the list to plan food and rooms."
        actions={
          <a href="/ctf/admin/hackathon/export" className={`${btnGhost} ${btnSmall}`}>
            Download CSV
          </a>
        }
      />

      <section className={`${card} !p-0 overflow-hidden`}>
        <div className={toolbar}>
          <p className="font-mono text-xs text-ink/55">{rows.length} registered</p>
        </div>
        {rows.length === 0 ? (
          <p className="border-t border-ink/10 px-5 py-12 text-center text-ink/60">No one has registered yet.</p>
        ) : (
          <div className={tableWrap}>
            <table className={`${table} min-w-[52rem]`}>
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Program</th>
                  <th className={th}>Experience</th>
                  <th className={th}>Interests</th>
                  <th className={th}>Dietary / notes</th>
                  <th className={th}>Signed up</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-mist/40">
                    <td className={td}>
                      <p className="font-bold">{r.name}</p>
                      <p className="text-ink/60">{r.email}</p>
                    </td>
                    <td className={td}>{r.program}, {r.year}</td>
                    <td className={td}>{labelFor(EXPERIENCE, r.experience)}</td>
                    <td className={`${td} max-w-48 text-ink/70`}>{r.interests.map((i) => labelFor(INTERESTS, i)).join(", ") || "—"}</td>
                    <td className={`${td} max-w-56 text-ink/70`}>{[r.dietary, r.notes].filter(Boolean).join(" · ") || "—"}</td>
                    <td className={`${td} whitespace-nowrap font-mono text-ink/70`}>{shortDate(r.createdAt)}</td>
                    <td className={`${td} text-right`}>
                      <form action={deleteRegistrationAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmButton message={`Remove ${r.name}?`} className={`${btnDanger} ${btnSmall}`}>
                          Remove
                        </ConfirmButton>
                      </form>
                    </td>
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
