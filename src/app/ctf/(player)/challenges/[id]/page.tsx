import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { contestStatus } from "@/lib/ctf/contest";
import { toId } from "@/lib/ctf/form";
import { TIME_ZONE } from "@/lib/time-zone";
import { getPlayer } from "@/lib/ctf/player-session";
import { getContest, getPublicChallenge, listSolvers } from "@/lib/ctf/queries";
import { AutoRefresh } from "../../_components/auto-refresh";
import { Description } from "../../_components/description";
import { FlagForm } from "../../_components/flag-form";
import { Hint } from "../../_components/hint";

export const metadata: Metadata = { title: "Challenge | Knights Hack CTF" };

const solvedAt = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);

export default async function ChallengePage({ params }: PageProps<"/ctf/challenges/[id]">) {
  const rawId = (await params).id;
  const player = await getPlayer();
  // Keep the challenge as the destination, so a shared link or QR code lands here after sign-up.
  if (!player) redirect(`/ctf/register?next=${encodeURIComponent(`/ctf/challenges/${rawId}`)}`);

  const id = toId(rawId);
  if (!id) notFound();

  const contest = await getContest();
  const status = contestStatus(contest);
  // Same rule as the challenge list: nothing is visible until the contest is live or over.
  if (status !== "live" && status !== "ended") redirect("/ctf");

  const [challenge, solvers] = await Promise.all([getPublicChallenge(id), listSolvers(id)]);
  if (!challenge) notFound();

  const solved = solvers.some((s) => s.playerId === player.id);
  const external = challenge.url.startsWith("http");

  return (
    <>
      {status === "live" && <AutoRefresh every={30_000} />}

      <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -right-32 -top-32 size-[320px] glow sm:size-[520px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
          <Link href="/ctf" className="inline-flex min-h-10 items-center font-mono text-xs text-knight-300 hover:text-white sm:text-sm">
            ← All challenges
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-knight-300 px-3 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-ink">
              {challenge.category}
            </span>
            {solved && (
              <span className="rounded-full bg-green-400 px-3 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-ink">
                ✓ Solved
              </span>
            )}
          </div>
          <h1 className="headline mt-3 text-[clamp(2.75rem,9vw,7rem)]">{challenge.title}</h1>

          <dl className="mt-7 grid max-w-md grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 sm:p-4">
              <dt className="font-mono text-[0.625rem] uppercase tracking-wider text-white/55 sm:text-xs">Worth</dt>
              <dd className="headline mt-1 text-4xl tabular-nums sm:text-5xl">
                {challenge.points}
                <span className="ml-1.5 font-mono text-xs font-normal normal-case tracking-normal text-white/55">pts</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 sm:p-4">
              <dt className="font-mono text-[0.625rem] uppercase tracking-wider text-white/55 sm:text-xs">Solved by</dt>
              <dd className="headline mt-1 text-4xl tabular-nums sm:text-5xl">
                {solvers.length}
                <span className="ml-1.5 font-mono text-xs font-normal normal-case tracking-normal text-white/55">
                  {solvers.length === 1 ? "person" : "people"}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_22rem]">
          <div className="grid content-start gap-10">
            <details className="group max-w-3xl rounded-2xl bg-knight-50 ring-1 ring-ink/10">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
                <span>
                  <span aria-hidden>💡 </span>New to this? Start here
                </span>
                <span aria-hidden className="font-mono text-knight-600 transition group-open:rotate-45">+</span>
              </summary>
              <div className="grid gap-3 px-4 pb-4 text-ink/80">
                <p>
                  <strong className="text-ink">A CTF is a treasure hunt.</strong> Each challenge hides a secret word called a{" "}
                  <strong className="text-ink">flag</strong>. Your job is to find it and type it in.
                </p>
                <p>
                  Flags look like <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-sm text-white">KH{"{some_words}"}</code>.
                  Copy the whole thing, including the curly brackets.
                </p>
                <p>No coding needed to get started. Read slowly, look closely, and try things. You can&apos;t break anything.</p>
              </div>
            </details>

            <Step n={1} title="Read the mission" done>
              {challenge.description ? (
                <Description text={challenge.description} />
              ) : (
                <p className="text-ink/60">No extra details for this one. Open the challenge page and look around.</p>
              )}
            </Step>

            {challenge.url && (
              <Step n={2} title="Go and find the flag" done={solved}>
                <div className="grid max-w-xl gap-2">
                  <a
                    href={challenge.url}
                    target="_blank"
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-knight-600 px-8 text-lg font-bold text-white shadow-lg shadow-knight-600/25 transition hover:bg-knight-500 active:scale-[0.98]"
                  >
                    Open the challenge page ↗
                  </a>
                  <p className="text-center text-sm text-ink/60 sm:text-left">
                    Opens in a new tab. Come back here when you find the flag.
                  </p>
                </div>
              </Step>
            )}

            {challenge.hint && (
              <Step n={challenge.url ? 3 : 2} title="Stuck? Take a hint" done={solved}>
                <Hint text={challenge.hint} />
              </Step>
            )}

            <Step n={2 + Number(Boolean(challenge.url)) + Number(Boolean(challenge.hint))} title="Submit your flag" done={solved}>
              <div className="max-w-xl">
                <FlagForm id={challenge.id} solved={solved} canSubmit={status === "live"} points={challenge.points} />
              </div>
              {solved && (
                <Link href="/ctf" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-bold text-white transition hover:bg-knight-600 active:scale-[0.98]">
                  Pick your next challenge →
                </Link>
              )}
            </Step>
          </div>

          <aside aria-labelledby="solvers-title" className="self-start rounded-3xl bg-mist p-5 ring-1 ring-ink/10 lg:sticky lg:top-24">
            <h2 id="solvers-title" className="headline text-3xl">Solved by</h2>
            {solvers.length ? (
              <ol className="mt-4 grid gap-2">
                {solvers.map((s, i) => (
                  <li
                    key={s.playerId}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${s.playerId === player.id ? "bg-knight-600 text-white" : "bg-paper"}`}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs tabular-nums opacity-60">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.playerId === player.id ? `${s.name} (you)` : s.name}</span>
                    <time dateTime={s.solvedAt.toISOString()} className="shrink-0 font-mono text-[0.6875rem] opacity-60">
                      {solvedAt(s.solvedAt)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-ink/60">Nobody yet. Be the first!</p>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

/** One numbered stage of the challenge, so people always know where they are and what comes next. */
function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="grid gap-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`grid size-9 shrink-0 place-items-center rounded-full font-mono text-sm font-bold ${done ? "bg-knight-600 text-white" : "bg-ink text-white"}`}
        >
          {n}
        </span>
        <h2 id={`step-${n}`} className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="sm:pl-12">{children}</div>
    </section>
  );
}
