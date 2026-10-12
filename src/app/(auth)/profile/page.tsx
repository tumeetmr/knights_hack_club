import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import { logoutAction } from "@/lib/auth/actions";
import { requireStudent } from "@/lib/auth/session";
import { getPlayerRank, listPlayerSolveHistory } from "@/lib/ctf/queries";
import { countPlayerPixels } from "@/lib/pixels/wall";
import { TIME_ZONE } from "@/lib/time-zone";
import { NameForm, PasswordForm } from "./profile-forms";

export const metadata: Metadata = { title: "Your profile | Knights Hack Club" };

const formatDate = (date: Date, withTime = false) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: withTime ? undefined : "numeric",
    hour: withTime ? "numeric" : undefined,
    minute: withTime ? "2-digit" : undefined,
  }).format(date);

export default async function ProfilePage() {
  const student = await requireStudent("/profile");
  const db = await getDb();
  const [[account], solved, rank, pixels] = await Promise.all([
    db
      .select({ email: players.email, emailVerifiedAt: players.emailVerifiedAt, createdAt: players.createdAt })
      .from(players)
      .where(eq(players.id, student.id)),
    listPlayerSolveHistory(student.id),
    getPlayerRank(student.id),
    countPlayerPixels(student.id),
  ]);
  const score = solved.reduce((sum, s) => sum + s.points, 0);

  const stats = [
    ["CTF score", String(score)],
    ["Rank", rank ? `#${rank}` : "–"],
    ["Flags", String(solved.length)],
    ["Pixels", String(pixels)],
  ] as const;

  return (
    <>
      <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -right-32 -top-32 size-[320px] glow sm:size-[520px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
          <p className="rise caret font-mono text-xs text-knight-300 sm:text-sm">{"> knights --whoami"}</p>
          <h1 className="headline rise mt-4 break-words text-[clamp(3.5rem,11vw,8.5rem)]" style={{ "--d": "100ms" } as CSSProperties}>
            {student.name}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-white/70">
            <span className="break-all">{account.email}</span>
            <span className="rounded-full bg-green-400 px-3 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-ink">
              Verified
            </span>
          </p>
          <p className="mt-2 font-mono text-xs text-white/50 sm:text-sm">Member since {formatDate(account.createdAt)}</p>

          <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {stats.map(([k, v], i) => (
              <div key={k} className="rise rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 sm:p-4" style={{ "--d": `${200 + i * 100}ms` } as CSSProperties}>
                <dt className="font-mono text-[0.625rem] uppercase tracking-wider text-white/55 sm:text-xs">{k}</dt>
                <dd className="headline mt-1 text-4xl tabular-nums sm:text-5xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="headline text-5xl sm:text-6xl">Your flags</h2>
              <Link href="/ctf" className="font-mono text-sm text-ink/60 underline underline-offset-4 hover:text-ink">
                Go to the CTF →
              </Link>
            </div>
            {solved.length ? (
              <ul className="grid gap-2">
                {solved.map((s) => (
                  <li key={s.challengeId}>
                    <Link
                      href={`/ctf/challenges/${s.challengeId}`}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-mist px-4 py-3.5 ring-1 ring-ink/10 transition hover:bg-knight-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{s.title}</span>
                        <span className="font-mono text-xs text-ink/55">
                          {s.category} · {formatDate(s.solvedAt, true)}
                        </span>
                      </span>
                      <span className="headline shrink-0 text-3xl tabular-nums">{s.points}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-mist px-5 py-8 text-center text-ink/65 ring-1 ring-ink/10">
                No flags yet. Head to the CTF and grab your first one.
              </p>
            )}
          </div>

          <div className="grid content-start gap-6">
            <Card title="Profile">
              <NameForm name={student.name} />
            </Card>
            <Card title="Password">
              <PasswordForm />
            </Card>
            <form action={logoutAction} className="text-center">
              <input type="hidden" name="next" value="/" />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full bg-mist px-5 text-sm font-bold text-ink ring-1 ring-ink/10 transition hover:bg-red-50 hover:text-red-800 active:scale-[0.98]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-paper p-5 ring-1 ring-ink/10 sm:p-7">
      <h2 className="headline mb-5 text-4xl">{title}</h2>
      {children}
    </div>
  );
}
