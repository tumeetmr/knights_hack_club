"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/lib/form";
import { cancelRegistrationAction, registerHackathonAction } from "@/lib/hackathon/actions";
import { EXPERIENCE, INTERESTS, YEARS } from "@/lib/hackathon/config";

/** Values already saved for this student, so the form doubles as the edit screen. */
export type Saved = {
  program: string;
  year: string;
  experience: string;
  interests: string[];
  dietary: string;
  notes: string;
};

const bigInput =
  "block w-full border-0 border-b-2 border-ink/15 bg-transparent pb-3 text-2xl font-semibold tracking-tight placeholder:text-ink/25 focus:border-knight-600 focus:outline-none focus:ring-0 sm:text-4xl";

const option =
  "group flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-mist px-5 py-4 text-left ring-1 ring-ink/10 transition hover:ring-knight-500 active:scale-[0.99] has-[:checked]:bg-knight-50 has-[:checked]:ring-2 has-[:checked]:ring-knight-600";

const primaryBtn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 font-bold text-white transition hover:bg-knight-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const TOTAL = 6;

export function RegisterForm({ saved, name }: { saved: Saved | null; name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerHackathonAction, {});
  const [step, setStep] = useState(0);
  const [program, setProgram] = useState(saved?.program ?? "");
  const [year, setYear] = useState(saved?.year ?? "");
  const [experience, setExperience] = useState(saved?.experience ?? "");
  const [interests, setInterests] = useState<string[]>(saved?.interests ?? []);
  const [dietary, setDietary] = useState(saved?.dietary ?? "");
  const [notes, setNotes] = useState(saved?.notes ?? "");
  const [rules, setRules] = useState(!!saved);
  const focusRef = useRef<HTMLInputElement>(null);

  // Focus the text box on the screens that have one.
  useEffect(() => {
    focusRef.current?.focus({ preventScroll: true });
  }, [step]);

  const canNext = [program.trim().length >= 2, !!year, !!experience, true, true, rules][step];
  const next = () => canNext && setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const pick = (set: (v: string) => void, v: string) => {
    set(v);
    setTimeout(() => setStep((s) => s + 1), 220);
  };

  // Number keys pick the numbered options on the year and experience screens.
  useEffect(() => {
    if (step !== 1 && step !== 2) return;
    const onNum = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (e.metaKey || e.ctrlKey || e.altKey || !(i >= 0)) return;
      if (step === 1 && YEARS[i]) pick(setYear, YEARS[i]);
      if (step === 2 && EXPERIENCE[i]) pick(setExperience, EXPERIENCE[i].id);
    };
    window.addEventListener("keydown", onNum);
    return () => window.removeEventListener("keydown", onNum);
  }, [step]);

  // Enter moves forward instead of submitting early (except on the last screen).
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step < TOTAL - 1 && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      next();
    }
  };

  if (state.ok) {
    return (
      <Screen progress={100}>
        <div className="grid gap-6">
          <p className="font-mono text-sm text-knight-600">✓ Done</p>
          <h1 className="headline text-[clamp(3.5rem,12vw,8rem)]">{saved ? "Updated" : "You're in"}</h1>
          <p className="max-w-lg text-lg text-ink/70">{state.ok}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/hackathon" className={primaryBtn}>Back to the event</Link>
          </div>
        </div>
      </Screen>
    );
  }

  const first = name.split(" ")[0];

  return (
    <Screen progress={((step + 1) / TOTAL) * 100} step={step} onBack={step > 0 ? back : undefined}>
      <form action={action} onKeyDown={onKey} className="grid gap-8">
        <input type="hidden" name="program" value={program} />
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="experience" value={experience} />
        <input type="hidden" name="dietary" value={dietary} />
        <input type="hidden" name="notes" value={notes} />
        {interests.map((i) => <input key={i} type="hidden" name="interests" value={i} />)}
        {rules && <input type="hidden" name="rules" value="on" />}

        <div key={step} className="grid animate-[step-in_300ms_ease-out] gap-8 motion-reduce:animate-none">
          {step === 0 && (
            <>
              <Q n={1} title={saved ? "What are you studying?" : `Hey ${first}, what are you studying?`} hint="Your program at Niagara College." />
              <input
                ref={focusRef}
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                maxLength={100}
                placeholder="e.g. Computer Programming"
                aria-label="Program of study"
                className={bigInput}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Q n={2} title="What year are you in?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {YEARS.map((y, i) => (
                  <label key={y} className={option}>
                    <Key>{i + 1}</Key>
                    <input type="radio" name="_year" checked={year === y} onChange={() => pick(setYear, y)} className="sr-only" />
                    <span className="text-lg font-semibold">{y}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Q n={3} title="How much have you coded?" hint="Zero is a perfectly good answer. This is for beginners too." />
              <div className="grid gap-3">
                {EXPERIENCE.map((e, i) => (
                  <label key={e.id} className={option}>
                    <Key>{i + 1}</Key>
                    <input type="radio" name="_exp" checked={experience === e.id} onChange={() => pick(setExperience, e.id)} className="sr-only" />
                    <span>
                      <span className="block text-lg font-semibold">{e.label}</span>
                      <span className="text-sm text-ink/60">{e.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Q n={4} title="What sounds fun?" hint="Pick as many as you like, or skip." />
              <div className="grid gap-3 sm:grid-cols-2">
                {INTERESTS.map((i) => (
                  <label key={i.id} className={option}>
                    <input
                      type="checkbox"
                      checked={interests.includes(i.id)}
                      onChange={(e) => setInterests((cur) => (e.target.checked ? [...cur, i.id] : cur.filter((x) => x !== i.id)))}
                      className="sr-only"
                    />
                    <span className="text-lg font-semibold">{i.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Q n={5} title="Anything we should know?" hint="Dietary needs, accessibility, questions. All optional." />
              <div className="grid gap-6">
                <input
                  ref={focusRef}
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  maxLength={200}
                  placeholder="Dietary needs (vegetarian, halal, allergies…)"
                  aria-label="Dietary needs"
                  className={bigInput + " !text-xl sm:!text-2xl"}
                />
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Anything else?"
                  aria-label="Anything else"
                  className={bigInput + " !text-xl sm:!text-2xl"}
                />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <Q n={6} title="Last thing." />
              <label className={option}>
                <input type="checkbox" checked={rules} onChange={(e) => setRules(e.target.checked)} className="size-5 accent-knight-600" />
                <span className="text-base font-medium">
                  I&apos;ll be respectful and follow the Niagara College code of conduct and the exec team&apos;s instructions.
                </span>
              </label>
              {state.error && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-700/20">
                  {state.error}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {step < TOTAL - 1 ? (
            <>
              <button type="button" onClick={next} disabled={!canNext} className={primaryBtn}>
                {step === 3 && interests.length === 0 ? "Skip" : "OK"} <span aria-hidden>→</span>
              </button>
              <span className="hidden font-mono text-xs text-ink/40 sm:inline">press Enter ↵</span>
            </>
          ) : (
            <button type="submit" disabled={pending || !rules} className={primaryBtn}>
              {pending ? "Saving…" : saved ? "Update registration" : "Submit"}
            </button>
          )}
        </div>
      </form>
    </Screen>
  );
}

function Q({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="grid gap-3">
      <p className="font-mono text-sm text-knight-600">{n} <span aria-hidden>→</span></p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {hint && <p className="max-w-xl text-base text-ink/60 sm:text-lg">{hint}</p>}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-paper font-mono text-xs font-semibold text-ink/60 ring-1 ring-ink/15 group-has-[:checked]:bg-knight-600 group-has-[:checked]:text-white group-has-[:checked]:ring-knight-600">
      {children}
    </span>
  );
}

/** Full-viewport frame: thin progress bar, close/back at the top, content centred. */
function Screen({
  children,
  progress,
  step,
  onBack,
}: {
  children: React.ReactNode;
  progress: number;
  step?: number;
  onBack?: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <div className="h-1.5 w-full bg-ink/5" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-knight-600 transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        {onBack ? (
          <button type="button" onClick={onBack} className="min-h-10 font-mono text-sm text-ink/60 hover:text-ink">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <span className="font-mono text-xs text-ink/40">
          {step !== undefined ? `${step + 1} / ${TOTAL}` : ""}
        </span>
        <Link href="/hackathon" aria-label="Close" className="grid size-10 place-items-center rounded-full text-xl text-ink/60 hover:bg-mist hover:text-ink">
          ✕
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-16 sm:px-8">{children}</main>
    </div>
  );
}

export function CancelButton() {
  return (
    <form action={cancelRegistrationAction}>
      <button type="submit" className="min-h-10 rounded-full px-4 text-sm font-semibold text-red-700 ring-1 ring-red-700/20 transition hover:bg-red-50">
        Cancel my registration
      </button>
    </form>
  );
}
