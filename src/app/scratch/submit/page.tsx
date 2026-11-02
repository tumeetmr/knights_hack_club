import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { requireStudent } from "@/lib/auth/session";
import { MAX_PROJECTS_PER_STUDENT } from "@/lib/scratch/link";
import { deleteMyProjectAction } from "@/lib/scratch/actions";
import { listProjectsByPlayer } from "@/lib/scratch/queries";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Submit your Scratch project | Knights Hack Club" };

const steps = [
  "Open your project in Scratch and click Share.",
  "Copy the link from your browser's address bar.",
  "Paste it below and hit submit.",
];

export default async function SubmitScratchPage() {
  const student = await requireStudent("/scratch/submit");
  const mine = await listProjectsByPlayer(student.id);

  return (
    <>
      <SiteHeader base="/" />
      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="glow absolute -right-32 -top-32 size-[320px] sm:size-[520px]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> scratch --submit"}</p>
            <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">Show your game</h1>
            <p className="mt-4 max-w-xl text-white/70">
              Submit your Scratch project and it joins the club gallery once an exec member approves it.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="headline text-4xl sm:text-5xl">How to submit</h2>
              <ol className="mt-5 grid gap-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-4 rounded-2xl bg-mist px-4 py-3.5 ring-1 ring-ink/10">
                    <span className="headline text-3xl text-knight-600">{i + 1}</span>
                    <span className="self-center">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-ink/60">
                Scratch only lets you share once your email is confirmed. Project not found? Check that Share is on.
              </p>

              <h2 className="headline mt-10 text-4xl sm:text-5xl">Your projects</h2>
              {mine.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-mist px-5 py-6 text-center text-ink/65 ring-1 ring-ink/10">
                  Nothing submitted yet.
                </p>
              ) : (
                <ul className="mt-4 grid gap-2">
                  {mine.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-mist px-4 py-3.5 ring-1 ring-ink/10">
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate font-bold">{p.title}</p>
                        <p className="font-mono text-xs text-ink/55">
                          {p.approved ? (
                            <Link href={`/scratch/${p.scratchId}`} className="text-knight-600 underline underline-offset-2">
                              Live in the gallery
                            </Link>
                          ) : (
                            "Waiting for approval"
                          )}
                        </p>
                      </div>
                      <form action={deleteMyProjectAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="min-h-10 rounded-full px-4 text-sm font-semibold text-red-700 ring-1 ring-red-700/20 transition hover:bg-red-50">
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="headline text-4xl sm:text-5xl">Your project</h2>
              <p className="mt-2 text-sm text-ink/60">
                Signed in as {student.name}. Up to {MAX_PROJECTS_PER_STUDENT} projects each.
              </p>
              <div className="mt-5 rounded-3xl bg-mist p-5 ring-1 ring-ink/10 sm:p-6">
                <SubmitForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
