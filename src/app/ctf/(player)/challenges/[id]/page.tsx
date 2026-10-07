import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { contestStatus } from "@/lib/ctf/contest";
import { toId } from "@/lib/ctf/form";
import { getPlayer } from "@/lib/ctf/player-session";
import { getContest, getPublicChallenge, listSolvers } from "@/lib/ctf/queries";
import { AutoRefresh } from "../../_components/auto-refresh";
import { Description } from "../../_components/description";
import { FlagForm } from "../../_components/flag-form";
import { Hint } from "../../_components/hint";

export const metadata: Metadata = { title: "Challenge | Knights Hack CTF" };

const solvedAt = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);

export default async function ChallengePage({ params }: PageProps<"/ctf/challenges/[id]">) {
  const player = await getPlayer();
  if (!player) redirect("/ctf/register");

  const id = toId((await params).id);
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
        <div className="absolute -right-32 -top-32 size-[320px] rounded-full bg-knight-500/40 blur-3xl sm:size-[520px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
          <Link href="/ctf" className="font-mono text-xs text-knight-300 hover:text-white sm:text-sm">
            ← all challenges
          </Link>
          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-knight-300">{challenge.category}</p>
          <h1 className="headline mt-2 text-[clamp(2.75rem,9vw,7rem)]">{challenge.title}</h1>
          <p className="mt-4 font-mono text-sm text-white/65">
            {challenge.points} points · {solvers.length} solve{solvers.length === 1 ? "" : "s"}
            {solved && " · ✓ you solved it"}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_22rem]">
          <div className="grid content-start gap-6">
            {challenge.description && <Description text={challenge.description} />}

            {challenge.url && (
              <div className="grid max-w-xl gap-2">
                <a
                  href={challenge.url}
                  target="_blank"
                  rel={external ? "noopener noreferrer" : undefined}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-knight-600 px-8 text-lg font-bold text-white shadow-lg shadow-knight-600/25 transition hover:bg-knight-500 active:scale-[0.98]"
                >
                  Open the challenge page ↗
                </a>
                <p className="text-center text-sm text-ink/55 sm:text-left">
                  Opens in a new tab. Come back here to submit the flag.
                </p>
              </div>
            )}

            {challenge.hint && <Hint text={challenge.hint} />}

            <div className="max-w-xl">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink/60">Your flag</h2>
              <FlagForm id={challenge.id} solved={solved} canSubmit={status === "live"} />
            </div>
          </div>

          <aside aria-labelledby="solvers-title" className="self-start rounded-3xl bg-mist p-5 ring-1 ring-ink/10">
            <h2 id="solvers-title" className="headline text-3xl">Solved by</h2>
            {solvers.length ? (
              <ol className="mt-4 grid gap-2">
                {solvers.map((s, i) => (
                  <li
                    key={s.playerId}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${s.playerId === player.id ? "bg-knight-600 text-white" : "bg-paper"}`}
                  >
                    <span className="w-6 shrink-0 font-mono text-xs tabular-nums opacity-60">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                    <time dateTime={s.solvedAt.toISOString()} className="shrink-0 font-mono text-[0.6875rem] opacity-60">
                      {solvedAt(s.solvedAt)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-ink/60">Nobody yet. Be the first.</p>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
