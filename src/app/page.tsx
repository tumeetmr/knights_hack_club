import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { CtfTeaser } from "@/components/ctf-teaser";
import { EventBanner } from "@/components/event-banner";
import { EventsSlider } from "@/components/events-slider";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Steps } from "@/components/steps";
import { Headline, RollLink, SectionBlock, SectionCounter, icons, panel } from "@/components/ui";
import { eventPath, events, upcomingEvent } from "@/lib/events";
import { faqs, pillars, team, tickerItems } from "@/lib/home-content";
import { CONTACT_EMAIL, DISCORD_URL, JOIN_FORM_URL } from "@/lib/links";

// Events per month for the stats chart, derived from the schedule in lib/events.ts.
const perMonth = Object.entries(
  events.reduce<Record<string, number>>((acc, e) => {
    acc[e.month] = (acc[e.month] ?? 0) + 1;
    return acc;
  }, {}),
);
const maxPerMonth = Math.max(...perMonth.map(([, n]) => n));

const kindCounts = [
  ["Workshops", events.filter((e) => e.kind === "Workshop").length],
  ["Showcases", events.filter((e) => e.kind === "Showcase").length],
  ["Build day", events.filter((e) => e.kind === "Build").length],
  ["Meet-and-greet", events.filter((e) => e.kind === "Social").length],
  ["Mini hackathon", events.filter((e) => e.kind === "Hackathon").length],
] as const;

export default function Home() {
  const next = upcomingEvent();
  const nextHref = next && eventPath(next);

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

          <div className="relative mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-7xl flex-col justify-center px-5 pb-10 pt-24 sm:min-h-[calc(100svh-2rem)] sm:px-8 sm:pb-16 sm:pt-28">
            {next && nextHref && (
              <div className="mb-8 flex justify-center sm:mb-10">
                <EventBanner event={next} href={nextHref} />
              </div>
            )}
            <p className="rise caret text-center font-mono text-xs text-knight-300 sm:text-sm">
              niagara_college/knights_hack
            </p>
            <Headline
              as="h1"
              onLoad
              lines={["Your coding crew", "on campus."]}
              className="mt-5 text-center text-[clamp(3.5rem,11vw,9.5rem)] sm:mt-6"
            />

            <ul
              className="rise mx-auto mt-8 flex w-full max-w-4xl flex-wrap justify-center gap-x-5 gap-y-2.5 text-sm font-medium text-white/75 sm:mt-10 sm:justify-between sm:gap-x-8"
              style={{ "--d": "500ms" } as CSSProperties}
            >
              <li className="flex items-center gap-2">
                <span className="text-knight-300">{icons.star}</span> Beginners welcome
              </li>
              <li className="flex items-center gap-2">
                <span className="text-knight-300">{icons.calendar}</span> Fall 2026 · {events.length} events
              </li>
              <li className="flex items-center gap-2">
                <span className="text-knight-300">{icons.pin}</span> Welland Campus
              </li>
            </ul>

            <div
              className="rise mx-auto mt-10 grid w-full max-w-md gap-5 sm:mt-12 sm:gap-6"
              style={{ "--d": "700ms" } as CSSProperties}
            >
              <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-center">
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
              <Link
                href="/ctf"
                className="-mt-1 justify-self-center text-center font-mono text-sm font-medium text-knight-300 underline-offset-4 hover:text-white hover:underline"
              >
                {"> play the CTF →"}
              </Link>
            </div>
          </div>
        </section>

        {/* 01 Mission */}
        <section id="about" className={`${panel} bg-paper`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24 sm:px-8 md:py-36">
            <SectionCounter n={1} className="text-knight-600" />
            <div className="mt-10 grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-20">
              <SectionBlock tone="mist" label="Our mission" icon={icons.smile} className="self-start">
                <p className="text-ink/70">
                  Coding made simple and social: short sessions, friendly
                  people, real things you can show off.
                </p>
              </SectionBlock>
              <p
                data-reveal="up"
                className="text-3xl font-semibold leading-[1.15] tracking-tight sm:text-5xl"
              >
                A welcoming place for Niagara College students to{" "}
                <span className="text-knight-600">learn to code</span>,{" "}
                <span className="text-knight-600">build real projects</span> and{" "}
                <span className="text-knight-600">grow together</span>, whatever
                your program or skill level.
              </p>
            </div>
          </div>
        </section>

        {/* 02 What we do: sticky scroll steps */}
        <section id="what-we-do" className={`${panel} bg-grid-blue text-white`}>
          <div className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-24 md:pt-32">
            <SectionCounter n={2} className="text-white/70" />
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <Headline
                lines={["Learn it.", "Vibe it.", "Build it."]}
                className="text-[clamp(4rem,12vw,10rem)]"
              />
              <p data-reveal="up" className="max-w-sm text-lg text-white/80">
                Three ways to get involved, whatever your starting point. Keep
                scrolling to walk through them.
              </p>
            </div>
          </div>
          <Steps steps={pillars} />
        </section>

        {/* 03 Why join + ticker */}
        <section className={`${panel} bg-mist text-knight-600`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24 sm:px-8 md:py-36">
            <SectionCounter n={3} />
            <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <Headline
                  lines={["Build with", "people.", "Not alone."]}
                  className="text-[clamp(4rem,13vw,11rem)]"
                />
                <p data-reveal="up" className="mt-8 font-mono text-sm uppercase tracking-wider text-ink/60">
                  Real code; real memories.
                </p>
              </div>
              <SectionBlock label="100% beginner-friendly" icon={icons.code}>
                <p className="text-ink/70">Everything you need to go from zero to shipped:</p>
                <ul className="mt-4 space-y-2 font-medium text-ink">
                  {["Hands-on workshops, from Scratch up", "AI-assisted vibe coding sessions", "Showcases and an end-of-term hackathon"].map(
                    (item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-0.5 shrink-0 text-knight-600 [&_svg]:size-4">{icons.star}</span>
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </SectionBlock>
            </div>
          </div>

          <div className="overflow-hidden border-t-2 border-knight-600/15 py-8" aria-hidden>
            <div className="marquee-track flex w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center">
                  {tickerItems.map(([yes, no]) => (
                    <span key={yes} className="headline flex items-center gap-6 pr-6 text-5xl sm:text-7xl">
                      <span>{yes}</span>
                      <span className="text-ink/30">{no}</span>
                      <span className="[&_svg]:size-8 sm:[&_svg]:size-10">{icons.star}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 Stats */}
        <section className={`${panel} bg-grid-blue text-white`}>
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-24 sm:px-8 md:py-36 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionCounter n={4} className="text-white/70" />
              <Headline
                lines={["This fall", "we're hosting:"]}
                className="mt-8 text-[clamp(3rem,8vw,6.5rem)]"
              />
              <p className="headline text-[clamp(10rem,32vw,22rem)] leading-[0.8]">
                <CountUp to={events.length} />
                <span className="sr-only"> events</span>
              </p>
              <SectionBlock tone="dark" label="Events on campus" icon={icons.calendar} className="mt-6 max-w-sm">
                <ul className="space-y-2">
                  {kindCounts.map(([label, n]) => (
                    <li key={label} className="flex justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
                      <span className="text-white/75">{label}</span>
                      <span className="font-mono font-bold">{n}</span>
                    </li>
                  ))}
                </ul>
              </SectionBlock>
            </div>

            <div data-reveal="up" className="rounded-3xl bg-paper p-6 text-ink sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <h3 className="headline text-4xl sm:text-5xl">Zero to shipped</h3>
                <span className="text-knight-600">{icons.chart}</span>
              </div>
              <p className="mt-6 font-mono text-xs uppercase tracking-wider text-knight-600">
                Experience required:
              </p>
              <p className="headline text-[8rem] leading-[0.8] text-knight-600 sm:text-[10rem]">0</p>
              <p className="mt-4 max-w-sm text-ink/70">
                The term ramps up from a meet-and-greet to one end-of-term
                hackathon. Here&apos;s how it builds:
              </p>

              <div className="mt-8 flex h-40 items-end gap-2 border-b-2 border-ink pb-px sm:h-48 sm:gap-3" role="img" aria-label={`Events per month: ${perMonth.map(([m, n]) => `${m}, ${n}`).join("; ")}`}>
                {perMonth.map(([month, n]) => (
                  <div key={month} className="flex flex-1 flex-col items-center justify-end gap-2 self-stretch">
                    <span className="font-mono text-sm font-bold">{n}</span>
                    <div
                      className="w-full rounded-t-xl bg-knight-600"
                      style={{ height: `${(n / maxPerMonth) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2 sm:gap-3" aria-hidden>
                {perMonth.map(([month]) => (
                  <span key={month} className="flex-1 text-center font-mono text-[0.6875rem] leading-tight text-ink/50 sm:text-xs">
                    {month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 05 Events */}
        <section id="events" className={`${panel} bg-paper`}>
          <div className="py-20 sm:py-24 md:py-36">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[22rem_1fr] lg:items-end lg:gap-20">
              <SectionBlock tone="mist" label="Fall 2026 schedule" icon={icons.calendar} className="order-last self-end lg:order-first">
                <p className="text-ink/70">
                  Eight events at the Welland Campus, from your very first
                  game to an end-of-term hackathon. Kicking off Thursday,
                  Oct 8. Dates, times and rooms go up a week before each event.
                </p>
              </SectionBlock>
              <div>
                <SectionCounter n={5} className="text-knight-600" />
                <Headline lines={["Mark your", "calendar."]} className="mt-8 text-[clamp(4rem,12vw,10rem)]" />
              </div>
            </div>
            <div className="mt-14">
              <EventsSlider events={events} />
            </div>
          </div>
        </section>

        {/* Showcase band */}
        <section className={`${panel} bg-knight-gradient text-white`}>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center">
            <Headline
              lines={["Got a project or startup idea?", "Show it off."]}
              className="max-w-3xl text-[clamp(2.75rem,9vw,4.5rem)]"
            />
            <RollLink
              href={`mailto:${CONTACT_EMAIL}?subject=Knights%20Hack%20Showcase`}
              className="w-full shrink-0 bg-white text-ink hover:bg-ink hover:text-white sm:w-auto"
            >
              Pitch it for the Showcase
            </RollLink>
          </div>
        </section>

        {/* 06 Team */}
        <section id="team" className={`${panel} bg-ink text-white`}>
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24 sm:px-8 md:py-36">
            <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
              <div>
                <SectionCounter n={6} className="text-knight-300" />
                <Headline lines={["Meet the", "exec team."]} className="mt-8 text-[clamp(4rem,12vw,10rem)]" />
              </div>
              <SectionBlock tone="dark" label="Who runs it" icon={icons.people}>
                <p className="text-white/75">
                  Three students who plan the events, host the sessions and
                  keep the club connected with NCSAC.
                </p>
              </SectionBlock>
            </div>

            <div className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4">
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
                    <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-300">
                      {m.role}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">{m.name}</h3>
                    <p className="mt-3 text-white/65">{m.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 07 FAQ */}
        <section id="faq" className={`${panel} bg-paper text-knight-600`}>
          <div className="faq-glow pointer-events-none absolute inset-x-0 bottom-0 h-80" aria-hidden />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:py-24 sm:px-8 md:py-36">
            <SectionCounter n={7} />
            <Headline lines={["Frequently", "asked questions"]} className="mt-8 text-[clamp(3.5rem,10vw,9rem)]" />

            <div className="faq-list mt-10 max-w-4xl sm:mt-16 lg:ml-auto">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  name="faq"
                  data-reveal="up"
                  className="faq-item group border-t-2 border-knight-600/15 last:border-b-2"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-lg font-bold leading-snug text-ink transition hover:text-knight-600 before:w-8 before:shrink-0 before:font-mono before:text-sm before:font-medium before:text-knight-600 sm:gap-5 sm:py-6 sm:text-2xl">
                    <span className="flex-1">{f.q}</span>
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-current text-xl transition group-open:rotate-45 group-open:bg-knight-600 group-open:text-white sm:size-10"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 pl-12 pr-2 leading-relaxed text-ink/70 sm:pb-8 sm:pl-13 sm:text-lg">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 08 CTF */}
        <section id="ctf" className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div
            className="absolute -left-32 top-0 size-[320px] glow sm:size-[560px]"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 md:py-36 lg:grid-cols-[1fr_26rem] lg:items-end lg:gap-20">
            <div>
              <SectionCounter n={8} className="text-knight-300" />
              <Headline lines={["Capture", "the flag."]} className="mt-8 text-[clamp(4rem,12vw,10rem)]" />
              <p data-reveal="up" className="mt-8 max-w-xl text-white/70 sm:text-lg">
                Hunt for hidden flags, crack beginner-friendly puzzles and race
                your fellow members up the live leaderboard. Register once,
                then play.
              </p>
              <div data-reveal="up" className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <RollLink href="/ctf/register" className="bg-white text-ink hover:bg-knight-300">
                  Register for the CTF
                </RollLink>
                <RollLink href="/ctf/leaderboard" className="border border-white/30 hover:border-white hover:bg-white hover:text-ink">
                  View leaderboard
                </RollLink>
              </div>
              <p data-reveal="up" className="mt-5 text-sm text-white/50">
                Already registered?{" "}
                <Link href="/ctf/login" className="underline underline-offset-4 hover:text-white">
                  Sign in
                </Link>
              </p>
            </div>
            <CtfTeaser />
          </div>
        </section>

        {/* Join */}
        <section id="join" className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div
            className="absolute left-1/2 top-full size-[420px] -translate-x-1/2 sm:size-[720px] -translate-y-1/2 glow"
            aria-hidden
          />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-20 sm:py-24 text-center sm:px-8 md:py-36">
            <p className="font-mono text-sm text-knight-300">{"> join --club knights_hack"}</p>
            <Headline
              lines={["Pull up a chair.", "Open a laptop."]}
              className="mt-8 text-[clamp(3.5rem,11vw,9rem)]"
            />
            <p data-reveal="up" className="mt-6 max-w-xl text-white/70 sm:mt-8 sm:text-lg">
              Membership is open to every Niagara College student, regardless
              of program, background or experience. Register to get on the
              member list and hear about the next event.
            </p>
            <div data-reveal="up" className="mt-8 grid w-full gap-3 sm:mt-10 sm:flex sm:w-auto sm:items-center sm:gap-4">
              <RollLink href={JOIN_FORM_URL} external className="bg-white py-5 text-lg text-ink hover:bg-knight-300 sm:px-9">
                Register as a member ↗
              </RollLink>
              <RollLink
                href={DISCORD_URL}
                external
                className="bg-[#5865F2] py-5 text-lg text-white hover:bg-[#4752C4] sm:px-9"
              >
                Join our Discord ↗
              </RollLink>
            </div>
            <p className="mt-5 text-sm text-white/50">
              Registering takes about 2 minutes.{" "}
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
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
