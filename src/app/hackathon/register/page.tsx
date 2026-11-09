import type { Metadata } from "next";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { DEADLINE_LABEL, REGISTER_PATH, registrationOpen } from "@/lib/hackathon/config";
import { getRegistration } from "@/lib/hackathon/queries";
import { CancelButton, RegisterForm } from "../register-form";

export const metadata: Metadata = { title: "Register | Final Hackathon | Knights Hack Club" };

export default async function HackathonRegisterPage() {
  const student = await requireStudent(REGISTER_PATH);
  const saved = await getRegistration(student.id);

  if (!saved && !registrationOpen()) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-5 px-5 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Applications are closed</h1>
        <p className="text-lg text-ink/70">They closed on {DEADLINE_LABEL}. Join our Discord to hear about the next event.</p>
        <Link href="/hackathon" className="font-mono text-sm text-knight-600 underline">← Back to the event</Link>
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
