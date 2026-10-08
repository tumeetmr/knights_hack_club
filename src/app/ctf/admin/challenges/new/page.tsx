import { listChallenges } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { FormMessage } from "@/components/form-ui";
import { ChallengeForm } from "../../_components/challenge-form";
import { AdminShell, PageHeader } from "../../_components/shell";

export default async function NewChallengePage({ searchParams }: PageProps<"/ctf/admin/challenges/new">) {
  await requireAdmin();
  const [list, params] = await Promise.all([listChallenges(), searchParams]);
  const categories = [...new Set(list.map((c) => c.category))];

  const added = typeof params.added === "string" ? params.added : null;
  const category = typeof params.category === "string" ? params.category : undefined;
  const points = typeof params.points === "string" ? Number(params.points) || undefined : undefined;

  return (
    <AdminShell>
      <PageHeader
        back={{ href: "/ctf/admin/challenges", label: "Challenges" }}
        title="New challenge"
        description="Only the title is required. Leave the flag blank and one is made for you."
      />
      {added && <FormMessage state={{ ok: `Added “${added}”. Ready for the next one.` }} />}
      <div className="max-w-3xl">
        {/* Keyed on the query string so "add another" gives a fresh form. */}
        <ChallengeForm key={`${added}`} initial={{ category, points }} categories={categories} />
      </div>
    </AdminShell>
  );
}
