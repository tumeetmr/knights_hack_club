import { contestStatus, toLocalInput } from "@/lib/ctf/contest";
import { getContest } from "@/lib/ctf/queries";
import { requireAdmin } from "@/lib/ctf/session";
import { ContestForm } from "../_components/contest-form";
import { AdminShell, PageHeader } from "../_components/shell";
import { describeStatus } from "../_components/status";
import { card } from "../_components/styles";

export default async function SettingsPage() {
  await requireAdmin();
  const contest = await getContest();
  const info = describeStatus(contestStatus(contest), contest);

  return (
    <AdminShell>
      <PageHeader title="Settings" description="The contest name, and when players can play." />

      <section className={`${card} max-w-3xl`}>
        <p className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm">
          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[0.6875rem] font-bold uppercase tracking-wider ring-1 ${info.badge}`}>
            {info.label}
          </span>
          <span className="text-ink/70">{info.text}</span>
        </p>
        <ContestForm
          // Remount when saved elsewhere so the fields show the stored values.
          key={`${contest.title}|${contest.startAt?.getTime()}|${contest.endAt?.getTime()}|${contest.paused}`}
          title={contest.title}
          start={toLocalInput(contest.startAt)}
          end={toLocalInput(contest.endAt)}
          paused={contest.paused}
        />
      </section>
    </AdminShell>
  );
}
