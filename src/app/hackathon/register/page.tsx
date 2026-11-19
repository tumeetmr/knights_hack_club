import type { Metadata } from "next";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { DEADLINE_LABEL, EVENT_DATE, REGISTER_PATH, registrationOpen } from "@/lib/hackathon/config";
import { getRegistration } from "@/lib/hackathon/queries";
import { CancelButton, RegisterForm } from "../register-form";
import { RegistrationSummary } from "../registration-summary";

export const metadata: Metadata = { title: "Register | Final Hackathon | Knights Hack Club" };

export default async function HackathonRegisterPage({ searchParams }: PageProps<"/hackathon/register">) {
  const student = await requireStudent(REGISTER_PATH);
  const [saved, params] = await Promise.all([getRegistration(student.id), searchParams]);
  const editing = params.edit === "1";

  if (!saved && !registrationOpen()) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 px-5 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Applications are closed</h1>
        <p className="text-lg text-ink/70">They closed on {DEADLINE_LABEL}. Join our Discord to hear about the next event.</p>
        <Link href="/hackathon" className="font-mono text-sm text-knight-600 underline">← Back to the event</Link>
      </main>
    );
  }

  if (saved && !editing) {
    const canEdit = registrationOpen();
    return (
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-5 py-12 sm:px-8">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-800">
          <span aria-hidden>✓</span> You&apos;re registered
        </p>
        <h1 className="headline text-[clamp(3rem,10vw,6rem)]">You&apos;re in, {student.name.split(" ")[0]}</h1>
        <p className="max-w-xl text-lg text-ink/70">
          Your spot for the Final Hackathon on {EVENT_DATE} is saved. We&apos;ll email you the room and what to prepare.
          Registered on {saved.createdAt.toLocaleDateString("en-CA", { dateStyle: "long", timeZone: "America/Toronto" })}.
        </p>
        <RegistrationSummary data={saved} />
        <div className="flex flex-wrap items-center gap-3">
          {canEdit && (
            <Link href={`${REGISTER_PATH}?edit=1`} className="inline-flex min-h-12 items-center rounded-full bg-ink px-7 font-bold text-white transition hover:bg-knight-600">
              Edit my answers
            </Link>
          )}
          <Link href="/hackathon" className="inline-flex min-h-12 items-center rounded-full px-5 font-semibold ring-1 ring-ink/15 hover:bg-mist">
            Back to the event
          </Link>
          <CancelButton />
        </div>
        {!canEdit && <p className="text-sm text-ink/50">Applications have closed, so answers can no longer be edited.</p>}
      </main>
    );
  }

  return (
    <>
      <RegisterForm
        name={student.name}
        saved={
          saved && {
            program: saved.program,
            year: saved.year,
            experience: saved.experience,
            interests: saved.interests,
            dietary: saved.dietary,
            notes: saved.notes,
          }
        }
      />
      {saved && (
        <div className="fixed bottom-4 right-4 z-10">
          <CancelButton />
        </div>
      )}
    </>
  );
}
