import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { COPYRIGHT } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Headline, RollLink, icons, panel } from "@/components/ui";
import { CAMPUS, CAMPUS_ADDRESS } from "@/lib/events";
import { DISCORD_URL } from "@/lib/links";
import { DEADLINE_LABEL, EVENT_DATE, REGISTER_PATH } from "@/lib/hackathon/config";

const title = "Final Hackathon | Knights Hack Club";
const description =
  "The last Knights Hack event of the term: build something for campus, hack it together against the clock and demo it at the closing showcase. Free, beginner-friendly, open to every student.";
export const metadata: Metadata = { title, description, openGraph: { title, description } };

const facts = [
  { icon: icons.calendar, label: "Date", value: EVENT_DATE, sub: `8:30 AM – 9:30 PM · Apply by ${DEADLINE_LABEL}` },
  { icon: icons.star, label: "Cost", value: "Free", sub: "Food and snacks on us" },
  { icon: icons.pin, label: "Where", value: CAMPUS, sub: CAMPUS_ADDRESS },
];

const phases = [
  {
    step: "01",
    title: "Brainstorm",
    body: "Pick a real student or campus problem, from finding free rooms to splitting group-project work. Pitch ideas and choose one to build.",
  },
  {
    step: "02",
    title: "Hack",
    body: "Build a small working project against the clock. Use AI tools, Scratch, a website, a bot, anything goes. Mentors from the exec team walk around to unstick you.",
  },
  {
    step: "03",
    title: "Showcase",
    body: "Every team demos on the projector and takes questions from fellow students. Then we cheer, share what we learned and hand out prizes.",
  },
];

const faqs = [
  { q: "Do I need to know how to code?", a: "No. Teams are mixed on purpose, and there's a role for designers, writers and presenters too. We run quick starter tips at the beginning." },
  { q: "Who can join?", a: "Any Niagara College student, in any program. Sign up for a free club account to register." },
  { q: "Do I need a team?", a: "No. Once we know how many people signed up, we'll plan the teams and let you know before the day." },
  { q: "What should I bring?", a: "A laptop and charger. We'll share free AI tools and setup links before the day." },
  { q: "When is it?", a: `${EVENT_DATE}. Applications close ${DEADLINE_LABEL}. The room is emailed to everyone who registered.` },
];

export default function HackathonPage() {
  return (
    <>
      <SiteHeader base="/" />
      <Reveal />

      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Hero */}
        <section className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="absolute -right-32 -top-32 size-[360px] glow sm:-right-40 sm:-top-40 sm:size-[560px]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
            <Link href="/#events" className="inline-flex min-h-10 items-center font-mono text-xs text-knight-300 hover:text-white sm:text-sm">
              ← All events
            </Link>
            <div className="rise mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">Hackathon</span>
              <span className="rounded-full bg-knight-600 px-3 py-1 text-xs font-semibold text-white">Apply by {DEADLINE_LABEL}</span>
            </div>
            <Headline as="h1" onLoad lines={["Knights Hack", "Final Hackathon"]} className="mt-4 max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)]" />
            <p className="rise mt-5 max-w-2xl text-base text-white/75 sm:text-lg" style={{ "--d": "400ms" } as CSSProperties}>
              Our last event of the term. Build something for campus, ship it against the clock and show it off to the
              club. Beginners welcome.
            </p>
            <div className="rise mt-7 flex flex-wrap gap-3" style={{ "--d": "500ms" } as CSSProperties}>
              <RollLink href={REGISTER_PATH} className="bg-white text-ink hover:bg-knight-600 hover:text-white">Register now</RollLink>
              <RollLink href={DISCORD_URL} external className="border-2 border-white/25 hover:bg-white hover:text-ink">Join Discord</RollLink>
            </div>

            <dl className="rise mt-10 grid gap-x-8 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-3" style={{ "--d": "600ms" } as CSSProperties}>
              {facts.map((d) => (
                <div key={d.label}>
                  <dt className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-knight-300 [&_svg]:size-4">
                    {d.icon} {d.label}
                  </dt>
                  <dd className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">{d.value}</dd>
                  <dd className="mt-0.5 text-sm text-white/55">{d.sub}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section className={`${panel} bg-mist`}>
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> how it works"}</p>
            <Headline lines={["One event.", "Three stages."]} className="mt-5 text-[clamp(2.75rem,7vw,5rem)]" />
            <p data-reveal="up" className="mt-4 max-w-2xl text-ink/70 sm:text-lg">
              We folded our remaining club events into a single day: the campus build session, the mini hackathon and the second showcase.
            </p>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {phases.map((p, i) => (
                <li
                  key={p.step}
                  data-reveal="up"
                  style={{ "--d": `${i * 80}ms` } as CSSProperties}
                  className="rounded-3xl bg-paper p-6 ring-1 ring-ink/5 sm:p-7"
                >
                  <span className="headline text-5xl text-knight-600">{p.step}</span>
                  <h3 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/70">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Registration */}
        <section id="register" className={`${panel} bg-paper`}>
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[22rem_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> register"}</p>
              <Headline lines={["Save", "your spot."]} className="mt-5 text-[clamp(2.75rem,7vw,4.5rem)]" />
              <p className="mt-4 text-ink/70">
                Uses your Knights Hack student account. Apply by Nov 20. We&apos;ll email you the room and what to prepare.
              </p>
            </div>
            <div className="rounded-3xl bg-mist p-6 ring-1 ring-ink/10 sm:p-8">
              <p className="headline text-3xl sm:text-4xl">Ready in a minute</p>
              <ol className="mt-4 grid gap-2 text-ink/75">
                <li>1. Sign in with your club account (or create one, it&apos;s free) by Nov 20.</li>
                <li>2. Tell us your program, experience and interests.</li>
                <li>3. We email you the room once they&apos;re confirmed.</li>
              </ol>
              <RollLink href={REGISTER_PATH} className="mt-6 bg-ink text-white hover:bg-knight-600">Register now</RollLink>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${panel} bg-mist`}>
          <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
            <Headline lines={["Questions?"]} className="text-[clamp(2.75rem,7vw,4.5rem)]" />
            <div className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-3xl bg-paper ring-1 ring-ink/5">
              {faqs.map((f) => (
                <details key={f.q} className="group px-5 py-4 sm:px-7">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 font-bold">
                    {f.q}
                    <span className="text-knight-600 transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-2 leading-relaxed text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto flex flex-wrap justify-between gap-x-4 gap-y-3 rounded-[2rem] bg-ink px-5 py-6 text-xs text-white/40 sm:px-8 lg:rounded-[2.5rem]">
          <p>{COPYRIGHT}</p>
          <a href="#top" className="hover:text-white">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
