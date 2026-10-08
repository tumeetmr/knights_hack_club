import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { contestStatus, formatContestTime } from "@/lib/ctf/contest";
import { safeNext } from "@/lib/ctf/form";
import { getPlayer } from "@/lib/ctf/player-session";
import { getContest } from "@/lib/ctf/queries";
import { AuthPanel } from "../_components/auth-card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register | Knights Hack CTF" };

const steps = [
  <>Each challenge hides a secret code called a <strong className="text-white">flag</strong>, like <code className="font-mono text-knight-300">KH{"{...}"}</code>.</>,
  <>Find it, paste it in, and earn points on the live leaderboard.</>,
  <>No coding needed, and hints are free.</>,
];

export default async function RegisterPage({ searchParams }: PageProps<"/ctf/register">) {
  const [player, contest, params] = await Promise.all([getPlayer(), getContest(), searchParams]);
  const next = safeNext(params.next);
  if (player) redirect(next);

  const status = contestStatus(contest);
  const when =
    status === "upcoming" && contest.startAt
      ? `Starts ${formatContestTime(contest.startAt)}, so register now and be ready.`
      : status === "live"
        ? contest.endAt
          ? `Live now. Play until ${formatContestTime(contest.endAt)}`
          : "Open now. Play anytime."
        : status === "paused"
          ? "Closed right now, but you can register ahead."
          : "This round is over. You can still register and look at the challenges.";

  return (
    <AuthPanel
      eyebrow="> ctf --register"
      title="Join the hunt."
      intro={
        <div className="grid gap-3 text-white/75">
          <p className="text-center font-mono text-sm text-knight-300">{when}</p>
          <ol className="grid gap-2 rounded-2xl bg-white/10 p-4 text-sm ring-1 ring-white/15 sm:text-base">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15 font-mono text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      }
      footer={
        <>
          Already registered?{" "}
          <Link
            href={next === "/ctf" ? "/ctf/login" : `/ctf/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-white underline underline-offset-4 hover:text-knight-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthPanel>
  );
}
