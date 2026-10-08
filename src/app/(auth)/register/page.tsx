import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { loginHref, safeNext } from "@/lib/auth/next";
import { getStudent } from "@/lib/auth/session";
import { contestStatus, formatContestTime } from "@/lib/ctf/contest";
import { getContest } from "@/lib/ctf/queries";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register | Knights Hack Club" };

const accountSteps = [
  <>One free account for everything on this site. No coding needed.</>,
  <>Hunt flags in the <strong className="text-white">CTF</strong> and climb the leaderboard.</>,
  <>Place pixels on the <strong className="text-white">Pixel Wall</strong> and draw with the whole club.</>,
];

const ctfSteps = [
  <>Each challenge hides a secret code called a <strong className="text-white">flag</strong>, like <code className="font-mono text-knight-300">KH{"{...}"}</code>.</>,
  <>Find it, paste it in, and earn points on the live leaderboard.</>,
  <>No coding needed, and hints are free.</>,
];

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const [student, params] = await Promise.all([getStudent(), searchParams]);
  const next = safeNext(params.next);
  if (student) redirect(next);

  // Coming from the CTF (or a challenge QR code): explain the contest instead of the account.
  const forCtf = next === "/ctf" || next.startsWith("/ctf/");
  const when = forCtf ? await ctfWhen() : null;

  return (
    <AuthPanel
      eyebrow={forCtf ? "> ctf --register" : "> knights --register"}
      title={forCtf ? "Join the hunt." : "Join in."}
      intro={
        <div className="grid gap-3 text-white/75">
          {when && <p className="text-center font-mono text-sm text-knight-300">{when}</p>}
          <Steps steps={forCtf ? ctfSteps : accountSteps} />
        </div>
      }
      footer={
        <>
          Already registered?{" "}
          <Link href={loginHref(next)} className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthPanel>
  );
}

async function ctfWhen() {
  const contest = await getContest();
  const status = contestStatus(contest);
  return status === "upcoming" && contest.startAt
    ? `Starts ${formatContestTime(contest.startAt)}, so register now and be ready.`
    : status === "live"
      ? contest.endAt
        ? `Live now. Play until ${formatContestTime(contest.endAt)}`
        : "Open now. Play anytime."
      : status === "paused"
        ? "Closed right now, but you can register ahead."
        : "This round is over. You can still register and look at the challenges.";
}

function Steps({ steps }: { steps: ReactNode[] }) {
  return (
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
  );
}
