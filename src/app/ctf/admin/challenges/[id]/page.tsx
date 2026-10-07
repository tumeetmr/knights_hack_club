import Link from "next/link";
import { notFound } from "next/navigation";
import { toId } from "@/lib/ctf/form";
import { getChallenge, listChallenges } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { ChallengeForm } from "../../_components/challenge-form";
import { AdminShell } from "../../_components/shell";
import { btnGhost, btnSmall, card } from "../../_components/styles";

export default async function EditChallengePage({ params }: PageProps<"/ctf/admin/challenges/[id]">) {
  await requireAdmin();
  const challengeId = toId((await params).id);
  if (!challengeId) notFound();

  const [challenge, list] = await Promise.all([getChallenge(challengeId), listChallenges()]);
  if (!challenge) notFound();
  const categories = [...new Set(list.map((c) => c.category))];

  return (
    <AdminShell>
      <Link href="/ctf/admin" className={`${btnGhost} ${btnSmall} self-start`}>
        ← Back
      </Link>
      <section className={card}>
        <h1 className="headline mb-5 text-4xl sm:text-5xl">Edit challenge</h1>
        <ChallengeForm initial={challenge} categories={categories} />
      </section>
    </AdminShell>
  );
}
