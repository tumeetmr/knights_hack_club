import Link from "next/link";
import { listChallenges } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { FormMessage } from "../../../_components/form-ui";
import { ChallengeForm } from "../../_components/challenge-form";
import { AdminShell } from "../../_components/shell";
import { btnGhost, btnSmall, card } from "../../_components/styles";

export default async function NewChallengePage({ searchParams }: PageProps<"/ctf/admin/challenges/new">) {
  await requireAdmin();
  const [list, params] = await Promise.all([listChallenges(), searchParams]);
  const categories = [...new Set(list.map((c) => c.category))];

  const added = typeof params.added === "string" ? params.added : null;
  const category = typeof params.category === "string" ? params.category : undefined;
  const points = typeof params.points === "string" ? Number(params.points) || undefined : undefined;

  return (
    <AdminShell>
      <Link href="/ctf/admin" className={`${btnGhost} ${btnSmall} self-start`}>
        ← Back
      </Link>
      {added && <FormMessage state={{ ok: `Added “${added}”. Ready for the next one.` }} />}
      <section className={card}>
        <h1 className="headline mb-5 text-4xl sm:text-5xl">New challenge</h1>
        {/* Keyed on the query string so "add another" gives a fresh form. */}
        <ChallengeForm key={`${added}`} initial={{ category, points }} categories={categories} />
      </section>
    </AdminShell>
  );
}
