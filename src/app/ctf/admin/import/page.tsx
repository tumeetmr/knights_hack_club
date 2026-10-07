import Link from "next/link";
import { requireAdmin } from "@/lib/ctf/session";
import { ImportForm } from "../_components/import-form";
import { AdminShell } from "../_components/shell";
import { btnGhost, btnSmall, card } from "../_components/styles";

export default async function ImportPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <Link href="/ctf/admin" className={`${btnGhost} ${btnSmall} self-start`}>
        ← Back
      </Link>
      <section className={card}>
        <h1 className="headline mb-2 text-4xl sm:text-5xl">Import challenges</h1>
        <p className="mb-5 text-ink/60">
          Paste a JSON list to add many at once, or restore a backup from Export. Only{" "}
          <span className="font-mono">title</span> is required. Missing flags are generated, points default to 100
          and challenges stay drafts unless <span className="font-mono">"published": true</span>.
        </p>
        <ImportForm />
      </section>
    </AdminShell>
  );
}
