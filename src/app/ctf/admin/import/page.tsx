import { requireAdmin } from "@/lib/ctf/session";
import { ImportForm } from "../_components/import-form";
import { AdminShell, PageHeader } from "../_components/shell";
import { card } from "../_components/styles";

export default async function ImportPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <PageHeader
        back={{ href: "/ctf/admin/challenges", label: "Challenges" }}
        title="Import challenges"
        description={
          <>
            Paste a JSON list to add many at once, or restore a file from Export. Only <span className="font-mono">title</span> is
            required. Missing flags are generated, points default to 100, and challenges stay drafts unless{" "}
            <span className="font-mono">&quot;published&quot;: true</span>.
          </>
        }
      />
      <section className={`${card} max-w-3xl`}>
        <ImportForm />
      </section>
    </AdminShell>
  );
}
