import { requireAdmin } from "@/lib/ctf/session";
import { deleteRegistrationAction } from "@/lib/hackathon/actions";
import { EXPERIENCE, INTERESTS, labelFor } from "@/lib/hackathon/config";
import { listRegistrations } from "@/lib/hackathon/queries";
import { ConfirmButton } from "../_components/confirm-button";
import { shortDate } from "../_components/format";
import { AdminShell, PageHeader } from "../_components/shell";
import { btnDanger, btnGhost, btnSmall, card } from "../_components/styles";

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

      <section className={`${card} !p-0`}>
        <p className="border-b border-ink/10 px-5 py-2.5 font-mono text-xs text-ink/55">
          {rows.length} registered
        </p>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-ink/60">No one has registered yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="truncate font-bold">{r.name}</p>
                  <p className="truncate text-sm text-ink/60">
                    {r.email} · {r.program}, {r.year} · {shortDate(r.createdAt)}
                  </p>
                  <p className="truncate text-sm text-ink/50">
                    {labelFor(EXPERIENCE, r.experience)}
                    {r.interests.length > 0 && ` · ${r.interests.map((i) => labelFor(INTERESTS, i)).join(", ")}`}
                  </p>
                  {(r.dietary || r.notes) && (
                    <p className="truncate text-sm text-ink/50">{[r.dietary, r.notes].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                <form action={deleteRegistrationAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton message={`Remove ${r.name}?`} className={`${btnDanger} ${btnSmall}`}>
                    Remove
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
