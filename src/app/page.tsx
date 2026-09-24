import Image from "next/image";
import { SiteHeader } from "./site-header";

const CONTACT_EMAIL = "nankhbayar1@ncstudents.niagaracollege.ca";
const JOIN_FORM_URL = "https://forms.cloud.microsoft/r/SbHL8X9vDP";

const pillars = [
  {
    tag: "01 / Learn",
    title: "Code from zero.",
    body: "Never written a line of code? Perfect. Hands-on workshops start with Scratch and build up from there. No experience needed.",
    snippet: "when flag clicked\n  say \"Hello, NC!\"",
  },
  {
    tag: "02 / Vibe",
    title: "Vibe code with AI.",
    body: "Experiment with AI-assisted coding tools and turn an idea into a working personal project in a single session.",
    snippet: "> build me a campus\n  study-room finder",
  },
  {
    tag: "03 / Build",
    title: "Ship real projects.",
    body: "Team up to prototype solutions to real student and campus problems, then show them off at our showcases and hackathon.",
    snippet: "git commit -m \"v1 🚀\"\ngit push origin main",
  },
];

const events = [
  {
    month: "Sep / Oct",
    time: "2:00 – 3:00 PM",
    title: "Club Launch & Meet-and-Greet",
    body: "Meet students into coding and tech, pitch ideas for future activities and find your people. Members and non-members welcome.",
    kind: "Social",
  },
  {
    month: "Oct",
    time: "2:00 – 3:30 PM",
    title: "Scratch: Make Your First Game",
    body: "A beginner-friendly, hands-on intro to programming concepts. Walk out with a game you built yourself.",
    kind: "Workshop",
  },
  {
    month: "Oct",
    time: "2:00 – 3:30 PM",
    title: "Vibe Coding",
    body: "Try AI-assisted coding in a relaxed setting and build a small personal project from scratch.",
    kind: "Workshop",
  },
  {
    month: "Nov",
    time: "2:00 – 3:30 PM",
    title: "Student Project & Startup Showcase",
    body: "Present your project, startup or idea and get questions and feedback from fellow students.",
    kind: "Showcase",
  },
  {
    month: "Nov",
    time: "2:00 – 3:30 PM",
    title: "Build Something for Campus",
    body: "Brainstorm and prototype a small solution to a real student or campus problem, together.",
    kind: "Build",
  },
  {
    month: "Dec",
    time: "2:00 – 3:00 PM",
    title: "GitHub & Portfolio Workshop",
    body: "Learn how to present your code and build an online portfolio that supports school and career goals.",
    kind: "Workshop",
  },
  {
    month: "Dec",
    time: "2:00 – 3:00 PM",
    title: "Project & Startup Showcase #2",
    body: "Round two: share what you've built and connect with students who have different skills.",
    kind: "Showcase",
  },
  {
    month: "Dec",
    time: "2:00 – 3:00 PM",
    title: "Mini Hackathon: End of Term",
    body: "Form a team, apply everything you learned and ship a small project against the clock.",
    kind: "Hackathon",
  },
];

const team = [
  {
    role: "President",
    name: "Nomuun Ankhbayar",
    body: "Plans and hosts meetings and events, and is the club's main contact with NCSAC.",
  },
  {
    role: "Vice President",
    name: "Tumenbayar Enkhbat",
    body: "Co-hosts meetings, co-organizes events and leads club marketing.",
  },
  {
    role: "Secretary / Treasurer",
    name: "Jack Torrance",
    body: "Runs agendas, attendance and minutes, and keeps members updated on the budget.",
  },
];

const stats = [
  { value: "8", label: "events this fall" },
  { value: "0", label: "experience required" },
  { value: "1", label: "end-of-term hackathon" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink text-white">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div
            className="absolute -right-40 -top-40 size-[640px] rounded-full bg-knight-500/40 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p className="font-mono text-sm text-knight-300 caret">
                niagara_college/knights_hack
              </p>
              <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                Your coding crew on campus.
              </h1>
              <p className="mt-8 max-w-xl text-lg text-white/75 sm:text-xl">
                Knights Hack Club is a student club at Niagara College for
                anyone curious about code. First-timers and seasoned devs
                build side by side.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#join"
                  className="rounded-full bg-white px-7 py-3.5 font-bold text-ink transition hover:bg-knight-300"
                >
                  Join the Club
                </a>
                <a
                  href="#events"
                  className="rounded-full border border-white/30 px-7 py-3.5 font-bold transition hover:border-white hover:bg-white/10"
                >
                  See Fall 2026 Events
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-3xl shadow-2xl shadow-knight-500/30 ring-1 ring-white/10">
                <Image
                  src="/logo.png"
                  alt="Knights Hack Club logo: a knight's helmet next to a laptop showing a code symbol"
                  width={800}
                  height={788}
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  preload
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section id="about" className="scroll-mt-18 bg-paper">
          <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 md:py-32">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-knight-600">
              Our Mission:
            </h2>
            <p className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              A welcoming place for Niagara College students to learn to code,
              build real projects and grow together, whatever your program or
              skill level.
            </p>
            <dl className="mt-16 grid gap-8 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="border-t-2 border-ink pt-6">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-6xl font-black">{s.value}</dd>
                  <dd className="mt-2 text-sm font-medium uppercase tracking-wider text-ink/60">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* What we do */}
        <section id="what-we-do" className="scroll-mt-18 bg-mist">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="max-w-2xl font-display text-4xl font-black leading-none tracking-tight sm:text-6xl">
                Learn it. Vibe it. Build it.
              </h2>
              <p className="max-w-sm text-ink/70">
                Coding made simple and social: short sessions, friendly people,
                real things you can show off.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {pillars.map((p) => (
                <article
                  key={p.tag}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-paper shadow-sm ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="bg-knight-gradient relative h-48 p-6">
                    <pre className="rounded-xl bg-ink/70 p-4 font-mono text-sm leading-relaxed text-white backdrop-blur">
                      {p.snippet}
                    </pre>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="font-mono text-xs font-medium text-knight-600">
                      {p.tag}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-3 flex-1 text-ink/70">{p.body}</p>
                    <a
                      href="#events"
                      className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition group-hover:bg-knight-600"
                    >
                      Learn more <span aria-hidden>→</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Events */}
        <section id="events" className="scroll-mt-18 bg-ink text-white">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="font-mono text-sm text-knight-300">
                  {"// fall_2026.schedule"}
                </p>
                <h2 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
                  Real code; real memories.
                </h2>
                <p className="mt-6 max-w-sm text-white/70">
                  Eight events this term, from your very first game to an
                  end-of-term hackathon. Exact dates and rooms are announced
                  before each event.
                </p>
              </div>

              <ol className="divide-y divide-white/10 border-y border-white/10">
                {events.map((e) => (
                  <li
                    key={e.title}
                    className="grid gap-4 py-7 transition sm:grid-cols-[8rem_1fr] sm:gap-8"
                  >
                    <div>
                      <p className="font-display text-2xl font-black uppercase text-knight-300">
                        {e.month}
                      </p>
                      <p className="mt-1 font-mono text-xs text-white/50">{e.time}</p>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-xl font-bold sm:text-2xl">
                          {e.title}
                        </h3>
                        <span className="rounded-full border border-white/20 px-3 py-0.5 text-xs font-medium text-white/70">
                          {e.kind}
                        </span>
                      </div>
                      <p className="mt-2 text-white/65">{e.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Showcase band */}
        <section className="bg-knight-gradient text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-20 sm:px-8 md:flex-row md:items-center">
            <h2 className="max-w-2xl font-display text-4xl font-black leading-none tracking-tight sm:text-5xl">
              Got a project or startup idea? Show it off.
            </h2>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Knights%20Hack%20Showcase`}
              className="shrink-0 rounded-full bg-white px-7 py-3.5 font-bold text-ink transition hover:bg-ink hover:text-white"
            >
              Pitch it for the Showcase
            </a>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="scroll-mt-18 bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
            <h2 className="font-display text-4xl font-black leading-none tracking-tight sm:text-6xl">
              Meet the executive team.
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {team.map((m) => (
                <article
                  key={m.role}
                  className="rounded-3xl border-2 border-ink p-7"
                >
                  <div
                    className="grid size-14 place-items-center rounded-2xl bg-ink font-display text-xl font-black text-white"
                    aria-hidden
                  >
                    {m.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <p className="mt-6 font-mono text-xs font-medium uppercase text-knight-600">
                    {m.role}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
                    {m.name}
                  </h3>
                  <p className="mt-3 text-ink/70">{m.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Join */}
        <section id="join" className="scroll-mt-18 bg-mist">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
            <div className="overflow-hidden rounded-[2rem] bg-ink text-white">
              <div className="grid gap-10 p-8 sm:p-14 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                    Pull up a chair. Open a laptop.
                  </h2>
                  <p className="mt-6 max-w-md text-white/70">
                    Membership is open to every Niagara College student,
                    regardless of program, background or experience. Fill out
                    the registration form to get on the member list and hear
                    about the next event.
                  </p>
                </div>
                <div className="space-y-4">
                  <a
                    href={JOIN_FORM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl bg-white p-6 text-ink transition hover:bg-knight-300"
                  >
                    <span className="block text-sm font-medium text-ink/60">
                      Takes about 2 minutes
                    </span>
                    <span className="mt-1 block font-display text-2xl font-extrabold sm:text-3xl">
                      Register as a member ↗
                    </span>
                  </a>
                  <a
                    href="https://www.yourncsac.ca/"
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-white/20 p-6 transition hover:border-white hover:bg-white/5"
                  >
                    <span className="block text-sm font-medium text-white/60">
                      Explore more clubs
                    </span>
                    <span className="mt-1 block font-display text-lg font-bold sm:text-xl">
                      yourncsac.ca ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex items-start gap-4">
            <Image
              src="/logo.png"
              alt=""
              width={56}
              height={56}
              className="rounded-lg"
            />
            <div>
              <p className="font-display text-xl font-extrabold">Knights Hack Club</p>
              <p className="mt-1 max-w-xs text-sm text-white/60">
                A student club of the Niagara College Student Administrative
                Council (NCSAC).
              </p>
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Club
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="hover:text-knight-300" href="#about">About</a></li>
              <li><a className="hover:text-knight-300" href="#events">Events</a></li>
              <li><a className="hover:text-knight-300" href="#team">Team</a></li>
              <li><a className="hover:text-knight-300" href="#join">Join</a></li>
            </ul>
          </nav>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Contact
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 block break-all text-sm hover:text-knight-300"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-white/40 sm:px-8">
            © 2026 Knights Hack Club · Niagara College · Built by students, for
            students.
          </p>
        </div>
      </footer>
    </>
  );
}
