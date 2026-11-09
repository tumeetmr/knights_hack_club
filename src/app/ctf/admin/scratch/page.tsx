import Link from "next/link";
import { requireAdmin } from "@/lib/ctf/session";
import { approveAllProjectsAction, deleteProjectAction, setProjectApprovedAction } from "@/lib/scratch/actions";
import { scratchUrl } from "@/lib/scratch/link";
import { listAllProjects } from "@/lib/scratch/queries";
import { ConfirmButton } from "../_components/confirm-button";
import { shortDate } from "../_components/format";
import { AdminShell, PageHeader } from "../_components/shell";
import { badgeOk, badgeWarn, btnDanger, btnGhost, btnPrimary, btnSmall, card, table, tableWrap, td, th, toolbar } from "../_components/styles";

export default async function ScratchAdminPage() {
  await requireAdmin();
  const projects = await listAllProjects();
  const waiting = projects.filter((p) => !p.approved).length;

  return (
    <AdminShell>
      <PageHeader
        title="Scratch"
        description="Workshop submissions. Approved projects show in the public gallery. Open one on Scratch to check it before approving."
        actions={
          <>
            <Link href="/scratch" target="_blank" className={`${btnGhost} ${btnSmall}`}>Gallery ↗</Link>
            {waiting > 0 && (
              <form action={approveAllProjectsAction}>
                <ConfirmButton message={`Approve all ${waiting} waiting projects?`} className={`${btnPrimary} ${btnSmall}`}>
                  Approve all ({waiting})
                </ConfirmButton>
              </form>
            )}
          </>
        }
      />

      <section className={`${card} !p-0 overflow-hidden`}>
        <div className={toolbar}>
          <p className="font-mono text-xs text-ink/55">{projects.length} submitted · {waiting} waiting</p>
        </div>
        {projects.length === 0 ? (
          <p className="border-t border-ink/10 px-5 py-12 text-center text-ink/60">Nothing submitted yet.</p>
        ) : (
          <div className={tableWrap}>
            <table className={`${table} min-w-[48rem]`}>
              <thead>
                <tr>
                  <th className={th}>Project</th>
                  <th className={th}>Maker</th>
                  <th className={th}>Status</th>
                  <th className={th}>Submitted</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/40">
                    <td className={`${td} max-w-64`}>
                      <p className="truncate font-bold">{p.title}</p>
                      {p.description && <p className="truncate text-ink/55">{p.description}</p>}
                    </td>
                    <td className={td}>
                      {p.maker}
                      {p.scratchAuthor && <p className="text-ink/55">Scratch: {p.scratchAuthor}</p>}
                    </td>
                    <td className={td}>
                      <span className={p.approved ? badgeOk : badgeWarn}>{p.approved ? "Approved" : "Waiting"}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap font-mono text-ink/70`}>{shortDate(p.createdAt)}</td>
                    <td className={td}>
                      <div className="flex justify-end gap-2">
                        <a href={scratchUrl(p.scratchId)} target="_blank" rel="noreferrer" className={`${btnGhost} ${btnSmall}`}>
                          Open ↗
                        </a>
                        <form action={setProjectApprovedAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="approved" value={String(!p.approved)} />
                          <button type="submit" className={`${p.approved ? btnGhost : btnPrimary} ${btnSmall}`}>
                            {p.approved ? "Hide" : "Approve"}
                          </button>
                        </form>
                        <form action={deleteProjectAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton message={`Delete “${p.title}”?`} className={`${btnDanger} ${btnSmall}`}>
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
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
