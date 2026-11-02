import Link from "next/link";
import { requireAdmin } from "@/lib/ctf/session";
import { approveAllProjectsAction, deleteProjectAction, setProjectApprovedAction } from "@/lib/scratch/actions";
import { scratchUrl } from "@/lib/scratch/link";
import { listAllProjects } from "@/lib/scratch/queries";
import { ConfirmButton } from "../_components/confirm-button";
import { shortDate } from "../_components/format";
import { AdminShell, PageHeader } from "../_components/shell";
import { btnDanger, btnGhost, btnPrimary, btnSmall, card } from "../_components/styles";

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

      <section className={`${card} !p-0`}>
        <p className="border-b border-ink/10 px-5 py-2.5 font-mono text-xs text-ink/55">
          {projects.length} submitted · {waiting} waiting
        </p>
        {projects.length === 0 ? (
          <p className="px-5 py-12 text-center text-ink/60">Nothing submitted yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-bold">
                    {p.title}
                    {!p.approved && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle font-mono text-[0.625rem] font-bold uppercase text-amber-900">
                        Waiting
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-ink/60">
                    {p.maker}
                    {p.scratchAuthor && ` · Scratch: ${p.scratchAuthor}`} · {shortDate(p.createdAt)}
                  </p>
                  {p.description && <p className="truncate text-sm text-ink/50">{p.description}</p>}
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
