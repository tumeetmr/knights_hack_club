import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventStatus } from "@/components/event-banner";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Headline, RollLink, SectionBlock, icons, panel } from "@/components/ui";
import { CAMPUS, CAMPUS_ADDRESS, eventPath, events, googleCalendarUrl, upcomingEvent } from "@/lib/events";
import { faqs, path, team } from "@/lib/home-content";
import { CONTACT_EMAIL, DISCORD_URL, JOIN_FORM_URL } from "@/lib/links";

/** "Fri · 11:30 AM – 1:30 PM" -> ["Fri", "11:30 AM – 1:30 PM"] */
const splitTime = (time: string) => (time.includes(" · ") ? (time.split(" · ") as [string, string]) : ["", time]);

const facts = [
  { icon: icons.people, label: "Who", value: "Official NCSAC club" },
  { icon: icons.smile, label: "Open to", value: "Every Niagara College student" },
  { icon: icons.star, label: "Experience", value: "None needed" },
  { icon: icons.pin, label: "Where", value: "Welland Campus" },
];

const explore = [
  {
    href: "/ctf",
    kicker: "Contest",
    title: "Capture the flag",
    body: "Beginner-friendly puzzles, hidden flags and a live leaderboard for members.",
  },
  {
    href: "/games",
    kicker: "Games",
    title: "Club games",
    body: "Quick multiplayer games about coding and AI. Play with friends on your phone.",
  },
  {
    href: "/pixel-wall",
    kicker: "Community",
    title: "The pixel wall",
    body: "One shared canvas for the whole club. Place a pixel every few hours.",
  },
];

export default function Home() {
  const next = upcomingEvent();
  const nextHref = next && eventPath(next);
  const [nextDay, nextHours] = next ? splitTime(next.time) : ["", ""];

  return (
    <>
      <SiteHeader />
      <Reveal />

      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Hero */}
        <section className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div
            className="absolute -right-32 -top-32 size-[360px] glow sm:-right-40 sm:-top-40 sm:size-[640px]"
            aria-hidden
          />
          <div
            className="absolute -bottom-40 -left-32 size-[320px] glow [--glow:rgb(37_99_184_/_0.3)] sm:-bottom-60 sm:-left-40 sm:size-[520px]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-28 sm:px-8 sm:pb-10 sm:pt-36">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14">
              <div>
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="" width={48} height={45} className="h-11 w-auto" />
                  <p className="rise caret font-mono text-xs text-knight-300 sm:text-sm">
                    Niagara College · NCSAC student club
                  </p>
                </div>
                <Headline
                  as="h1"
                  onLoad
                  lines={["Knights Hack", "Club"]}
                  className="mt-6 text-[clamp(3.5rem,10vw,8rem)]"
                />
                <p className="rise mt-6 max-w-xl text-lg text-white/75 sm:text-xl" style={{ "--d": "400ms" } as CSSProperties}>
                  Learn to code, manage your projects on GitHub and build with AI, then bring your idea to life at
                  our hackathon. Made for students who have never coded before.
                </p>
                <div
                  className="rise mt-8 grid gap-3 sm:flex sm:flex-wrap"
                  style={{ "--d": "550ms" } as CSSProperties}
                >
                  <RollLink href={JOIN_FORM_URL} external className="bg-white text-ink hover:bg-knight-300">
                    Join the Club ↗
                  </RollLink>
                  <RollLink
                    href={DISCORD_URL}
                    external
                    className="border border-white/30 hover:border-[#5865F2] hover:bg-[#5865F2] active:bg-[#5865F2]"
                  >
                    Join our Discord ↗
                  </RollLink>
                </div>
              </div>

              {/* Next event */}
              {next && nextHref && (
                <div className="rise rounded-3xl bg-white p-6 text-ink sm:p-8" style={{ "--d": "500ms" } as CSSProperties}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-600">
                      Next event
                    </p>
                    <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold">{next.kind}</span>
                  </div>
                  <h2 className="headline mt-4 text-4xl sm:text-5xl">{next.title}</h2>
                  <dl className="mt-6 grid gap-4 border-t-2 border-ink/10 pt-6 text-sm">
                    {[
                      { icon: icons.calendar, label: "Date", value: [nextDay, next.date].filter(Boolean).join(", ") || next.month },
                      { icon: icons.star, label: "Time", value: nextHours },
                      { icon: icons.pin, label: "Room", value: next.place ?? "Room TBA", sub: `${CAMPUS}, ${CAMPUS_ADDRESS}` },
                    ].map((d) => (
                      <div key={d.label} className="grid grid-cols-[1.5rem_4rem_1fr] items-start gap-3">
                        <dt className="contents">
                          <span className="mt-0.5 text-knight-600 [&_svg]:size-5" aria-hidden>
                            {d.icon}
                          </span>
                          <span className="pt-0.5 font-mono text-xs uppercase tracking-wider text-ink/50">{d.label}</span>
                        </dt>
                        <dd>
                          <span className="block text-base font-bold">{d.value}</span>
                          {d.sub && <span className="block text-ink/55">{d.sub}</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                    <RollLink href={nextHref} className="bg-ink text-white hover:bg-knight-600">
                      Event details →
                    </RollLink>
                    {next.start && next.end && (
                      <a
                        href={googleCalendarUrl({ ...next, start: next.start, end: next.end })}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border-2 border-ink/15 px-6 py-3.5 text-sm font-bold transition hover:border-ink hover:bg-ink hover:text-white active:scale-95"
                      >
                        + Add to calendar
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Official facts */}
            <dl className="rise mt-10 grid grid-cols-2 gap-3 sm:mt-14 lg:grid-cols-4" style={{ "--d": "700ms" } as CSSProperties}>
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/15 sm:p-5">
                  <dt className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-knight-300 [&_svg]:size-4">
                    {f.icon} {f.label}
                  </dt>
                  <dd className="mt-2 text-base font-bold leading-snug sm:text-lg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* About: purpose + path */}
        <section id="about" className={`${panel} bg-paper`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-20">
              <div>
                <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> about"}</p>
                <Headline lines={["From zero", "to hackathon."]} className="mt-6 text-[clamp(3.5rem,9vw,6.5rem)]" />
              </div>
              <p data-reveal="up" className="self-end text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                Knights Hack is a welcoming place for Niagara College students, in any program, to{" "}
                <span className="text-knight-600">learn to code</span>,{" "}
                <span className="text-knight-600">build real projects</span> and{" "}
                <span className="text-knight-600">grow together</span>. No experience needed.
              </p>
            </div>

            <ol className="mt-14 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {path.map((p, i) => (
                <li
                  key={p.step}
                  data-reveal="up"
                  style={{ "--d": `${i * 80}ms` } as CSSProperties}
                  className="rounded-3xl bg-mist p-6 sm:p-7"
                >
                  <p className="headline text-6xl text-knight-600">{p.step}</p>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/70">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Schedule */}
        <section id="events" className={`${panel} bg-mist`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-end lg:gap-20">
              <div>
                <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> schedule"}</p>
                <Headline lines={["Fall 2026", "events."]} className="mt-6 text-[clamp(3.5rem,9vw,6.5rem)]" />
              </div>
              <p data-reveal="up" className="max-w-xl text-ink/70 sm:text-lg">
                All events are at the {CAMPUS}. Dates, times and rooms are confirmed a week before each event and
                posted here and on Discord.
              </p>
            </div>

            <ul className="mt-12 overflow-hidden rounded-3xl bg-paper ring-1 ring-ink/5">
              {events.map((e) => {
                const href = eventPath(e);
                const [day, hours] = splitTime(e.time);
                const row = (
                  <>
                    <div className="w-16 shrink-0 text-center sm:w-20">
                      <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-600 transition group-hover:text-white/70">{e.month}</p>
                      <p className="headline text-4xl sm:text-5xl">{e.date ? e.date.split(" ")[1] : "TBA"}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-mist px-2.5 py-1 text-[0.6875rem] font-semibold transition group-hover:bg-white/15 group-hover:text-white">{e.kind}</span>
                        <EventStatus event={e} />
                      </div>
                      <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight sm:text-2xl">{e.title}</h3>
                      <p className="mt-1 text-sm text-ink/60 transition group-hover:text-white/70 sm:text-base">
                        {e.date
                          ? [day, hours, e.place].filter(Boolean).join(" · ")
                          : "Date, time and room announced a week before"}
                      </p>
                    </div>
                    {href && (
                      <span
                        className="hidden size-11 shrink-0 place-items-center rounded-full border-2 border-current text-lg transition group-hover:bg-white group-hover:text-ink sm:grid"
                        aria-hidden
                      >
                        →
                      </span>
                    )}
                  </>
                );
                const cls = "flex items-center gap-4 border-b border-ink/10 p-4 last:border-b-0 sm:gap-6 sm:p-6";
                return (
                  <li key={e.title}>
                    {href ? (
                      <Link href={href} className={`group ${cls} transition hover:bg-ink hover:text-white`}>
                        {row}
                      </Link>
                    ) : (
                      <div className={cls}>{row}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/calendar.ics"
                download
                className="inline-flex items-center rounded-full border-2 border-ink/15 px-5 py-3 text-sm font-bold transition hover:border-ink hover:bg-ink hover:text-white active:scale-95"
              >
                + Subscribe: Apple / Outlook
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Knights%20Hack%20Showcase`}
                className="inline-flex items-center rounded-full border-2 border-ink/15 px-5 py-3 text-sm font-bold transition hover:border-ink hover:bg-ink hover:text-white active:scale-95"
              >
                Pitch a project for the showcase
              </a>
            </div>
          </div>
        </section>

        {/* Explore */}
        <section id="explore" className={`${panel} bg-grid-blue text-white`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="font-mono text-xs font-medium tracking-wider text-white/70">{"> more from the club"}</p>
            <Headline lines={["Play", "between events."]} className="mt-6 text-[clamp(3.5rem,9vw,6.5rem)]" />
            <ul className="mt-12 grid gap-3 md:grid-cols-3 sm:gap-4">
              {explore.map((x, i) => (
                <li key={x.href} data-reveal="up" style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                  <Link
                    href={x.href}
                    className="group flex h-full flex-col justify-between gap-10 rounded-3xl bg-paper p-6 text-ink transition hover:bg-ink hover:text-white sm:p-8"
                  >
                    <div>
                      <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-600">{x.kicker}</p>
                      <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{x.title}</h3>
                      <p className="mt-2 text-ink/60 transition group-hover:text-white/60">{x.body}</p>
                    </div>
                    <span className="font-semibold">Open →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Team */}
        <section id="team" className={`${panel} bg-ink text-white`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
              <div>
                <p className="font-mono text-xs font-medium tracking-wider text-knight-300">{"> team"}</p>
                <Headline lines={["Meet the", "exec team."]} className="mt-6 text-[clamp(3.5rem,9vw,6.5rem)]" />
              </div>
              <SectionBlock tone="dark" label="Who runs it" icon={icons.people}>
                <p className="text-white/75">
                  Three students who plan the events, host the sessions and keep the club connected with NCSAC.
                </p>
              </SectionBlock>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {team.map((m, i) => (
                <article
                  key={m.role}
                  data-reveal="up"
                  style={{ "--d": `${i * 100}ms` } as CSSProperties}
                  className="rounded-3xl bg-white/5 p-3 ring-1 ring-white/10"
                >
                  <div
                    className="bg-knight-gradient headline relative grid aspect-square place-items-center overflow-hidden rounded-2xl text-8xl sm:aspect-[4/5]"
                    aria-hidden={!m.photo}
                  >
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={m.name}
                        fill
                        sizes="(min-width: 1280px) 400px, (min-width: 640px) 33vw, 100vw"
                        className="object-cover object-top"
                      />
                    ) : (
                      m.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                    )}
                  </div>
                  <div className="p-3 pt-5 md:p-4 md:pt-6">
                    <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-300">{m.role}</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{m.name}</h3>
                    <p className="mt-3 text-white/65">{m.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={`${panel} bg-paper`}>
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(24rem,32rem)_1fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> faq"}</p>
              <Headline lines={["Good", "questions."]} className="mt-6 text-[clamp(3.5rem,8vw,6rem)]" />
            </div>

            <div className="max-w-4xl">
              {faqs.map((f) => (
                <details key={f.q} name="faq" className="faq-item group border-t-2 border-knight-600/15 last:border-b-2">
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-lg font-bold leading-snug text-ink transition hover:text-knight-600 sm:py-6 sm:text-xl">
                    <span className="flex-1">{f.q}</span>
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-current text-xl transition group-open:rotate-45 group-open:bg-knight-600 group-open:text-white"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-2 leading-relaxed text-ink/70 sm:text-lg">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Join */}
        <section id="join" className={`${panel} bg-knight-gradient text-white`}>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center">
            <div>
              <Headline lines={["Ready to join?"]} className="text-[clamp(2.75rem,9vw,5rem)]" />
              <p className="mt-4 max-w-xl text-white/80 sm:text-lg">
                Register to get on the member list and hear about the next event. It takes about 2 minutes.{" "}
                <a
                  href="https://www.yourncsac.ca/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Explore more NCSAC clubs ↗
                </a>
              </p>
            </div>
            <div className="grid w-full gap-3 sm:flex sm:w-auto sm:items-center">
              <RollLink href={JOIN_FORM_URL} external className="bg-white text-ink hover:bg-ink hover:text-white">
                Register as a member ↗
              </RollLink>
              <RollLink href={DISCORD_URL} external className="bg-[#5865F2] text-white hover:bg-[#4752C4]">
                Join our Discord ↗
              </RollLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
