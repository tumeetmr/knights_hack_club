import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Mona_Sans, Oswald } from "next/font/google";
import { COPYRIGHT } from "@/components/site-footer";
import { CAMPUS, CAMPUS_ADDRESS, events } from "@/lib/events";
import { DISCORD_URL } from "@/lib/links";
import { getStudent } from "@/lib/auth/session";
import { getRegistration } from "@/lib/hackathon/queries";
import { EVENT_DATE, REGISTER_PATH, registrationOpen } from "@/lib/hackathon/config";
import { HackathonFx } from "./fx";
import { MissionClock } from "./mission-clock";

// Tall condensed caps for headlines, a clean modern sans for everything else.
const display = Oswald({ subsets: ["latin"], variable: "--font-kh-display" });
const sans = Mona_Sans({ subsets: ["latin"], variable: "--font-kh-sans" });

const title = "Final Hackathon | Knights Hack Club";
const description =
  "The last Knights Hack event of the term: build something for campus, hack it together against the clock and demo it at the closing showcase. Free, beginner-friendly, open to every student.";
export const metadata: Metadata = { title, description, openGraph: { title, description } };

const event = events.find((e) => e.path === "/hackathon");
const agenda = event?.agenda ?? [];
const START = event?.start ?? "2026-11-30T08:30:00-05:00";
const END = event?.end ?? "2026-11-30T21:30:00-05:00";
const SUBMIT_BY = "2026-11-30T20:00:00-05:00";

const rooms = [
  { key: "M215", name: "Room M215", role: "The camp: hacking, mentors, side competitions" },
  { key: "Wellness", name: "Wellness Lounge", role: "The forum: finalist demos, judging, awards" },
] as const;
const roomFor = (body?: string) => rooms.find((r) => body?.includes(r.key));

const phases = [
  {
    verb: "Brainstorm",
    title: "Find a problem worth fixing",
    body: "Pick a real student or campus problem, from finding free rooms to splitting group-project work. Pitch ideas and choose one to build.",
  },
  {
    verb: "Hack",
    title: "Build it against the clock",
    body: "AI tools, Scratch, a website, a bot: anything goes. Mentors walk the room all day to unstick you.",
  },
  {
    verb: "Showcase",
    title: "Present it to the judges",
    body: "Present your prototype and slides. Finalists demo on the projector, then we hand out prizes.",
  },
];

/** What every team hands in for the demo. */
const deliverables = [
  {
    title: "A working prototype",
    body: "Something we can click or try, not just an idea. It can be fully vibe coded: build it with AI tools like Lovable, ChatGPT or Claude. It doesn't need to be finished or perfect.",
  },
  {
    title: "A short presentation",
    body: "A few slides for your demo: the problem, your solution, then show the prototype live. Keep it to about 3 minutes.",
  },
];

const faqs = [
  { q: "Do I need to know how to code?", a: "No. You can vibe code your whole prototype with AI tools, and we run quick starter tips at the beginning." },
  { q: "Who can join?", a: "Any Niagara College student, in any program, with a free Knights Hack club account." },
  { q: "Do I need a team?", a: "No. Work solo or in a team of two. We'll help you find a partner on the day if you want one." },
  { q: "What should I bring?", a: "A laptop and charger. We'll share free AI tools and setup links before the day." },
  { q: "Do I have to stay all day?", a: "No. Drop in around your classes. The only fixed time is the 8:00 PM submission deadline." },
  { q: "Where is it?", a: `Room M215 for building all day, then the Wellness Lounge for the showcase and awards. ${CAMPUS}, ${CAMPUS_ADDRESS}.` },
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** The Knights Hack helmet, drawn in white with a dithered crest. Plumes rise in; the eyes blink now and then. */
function Helmet() {
  const plumes = [
    { cx: 76, cy: 196, ry: 26 },
    { cx: 138, cy: 172, ry: 26 },
    { cx: 200, cy: 152, ry: 28 },
    { cx: 262, cy: 172, ry: 26 },
    { cx: 324, cy: 196, ry: 26 },
  ];
  return (
    <svg className="kh-helmet" viewBox="0 0 400 340" aria-hidden>
      <defs>
        <pattern id="kh-dither" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="#fff" />
          <rect x="2" y="2" width="2" height="2" fill="#fff" />
        </pattern>
      </defs>
      <g className="kh-helmet-body">
        <path d="M70 232 190 194q10-3 20 0l120 38 36 74q6 14-10 14H44q-16 0-10-14z" fill="#fff" />
        <g className="kh-eyes">
          <ellipse cx="140" cy="262" rx="22" ry="30" fill="var(--kh-blue)" />
          <ellipse cx="260" cy="262" rx="22" ry="30" fill="var(--kh-blue)" />
        </g>
      </g>
      <g className="kh-crest">
        <path
          d="M58 168 188 126q12-4 24 0l130 42q12 4 12 17v50q0 14-14 10L212 205q-12-4-24 0L60 245q-14 4-14-10v-50q0-13 12-17z"
          fill="url(#kh-dither)"
          stroke="#fff"
          strokeWidth="3"
        />
        {plumes.map((p, i) => (
          <ellipse key={p.cx} className="kh-plume" style={d(900 + i * 90)} cx={p.cx} cy={p.cy} rx="10" ry={p.ry} fill="#fff" />
        ))}
      </g>
    </svg>
  );
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`kh-label ${className}`}>{children}</p>;
}

export default async function HackathonPage() {
  const student = await getStudent();
  const registered = student ? !!(await getRegistration(student.id)) : false;
  const open = registrationOpen();

  const cta = registered
    ? { href: REGISTER_PATH, label: "You're registered", external: false }
    : open
      ? { href: REGISTER_PATH, label: "Register now", external: false }
      : { href: DISCORD_URL, label: "Join the Discord", external: true };
  const ext = (external: boolean) => (external ? { target: "_blank", rel: "noreferrer" } : {});
  const newTab = <span className="sr-only"> (opens in a new tab)</span>;

  return (
    <div id="top" className={`kh ${display.variable} ${sans.variable}`}>
      <a href="#main" className="kh-skip">Skip to content</a>
      <HackathonFx />
      <div className="kh-progress" aria-hidden />

      <header className="kh-nav">
        <Link href="/" className="kh-crumb">
          <span className="kh-crumb-top">Knights Hack</span>
          <span className="kh-crumb-main">Final Hackathon</span>
        </Link>
        <nav aria-label="On this page" className="hidden md:block">
          <ul className="flex">
            <li><a href="#campaign" className="kh-navlink">The day</a></li>
            <li><a href="#submit" className="kh-navlink">What to submit</a></li>
            <li><a href="#schedule" className="kh-navlink">Schedule</a></li>
            <li><a href="#faq" className="kh-navlink">FAQ</a></li>
          </ul>
        </nav>
        <a href={cta.href} className="kh-btn kh-btn-sm" {...ext(cta.external)}>
          <span>{cta.label}</span>
          {cta.external && newTab}
        </a>
      </header>

      <main id="main" tabIndex={-1}>
        {/* Hero */}
        <section className="kh-hero kh-frame" aria-labelledby="hero-title">
          <div className="kh-hero-copy">
            <Label className="kh-in">Mon {EVENT_DATE} · Niagara College</Label>
            <h1 id="hero-title" className="kh-title kh-in" style={d(120)}>
              The Final <span className="kh-accent">Hackathon</span>
            </h1>
            <p className="kh-lede kh-in" style={d(260)}>
              One day to build something for campus. Doors open 8:30 AM, projects are due by 8:00 PM, then the best ones
              face the judges. Beginners welcome, free food all day.
            </p>
            <div className="kh-in mt-8 flex flex-wrap gap-3" style={d(380)}>
              <a href={cta.href} className="kh-btn" {...ext(cta.external)}>
                <span>{cta.label}</span>
                {cta.external && newTab}
              </a>
              <a href="#schedule" className="kh-btn kh-btn-ghost">
                <span>See the schedule</span>
              </a>
            </div>
          </div>

          <div className="kh-hero-art kh-in" style={d(200)}>
            <span className="kh-corner kh-corner-tl" aria-hidden />
            <span className="kh-corner kh-corner-tr" aria-hidden />
            <span className="kh-corner kh-corner-bl" aria-hidden />
            <span className="kh-corner kh-corner-br" aria-hidden />
            <Helmet />
            <div className="kh-hero-clock">
              <MissionClock start={START} deadline={SUBMIT_BY} end={END} />
            </div>
          </div>
        </section>

        <dl className="kh-facts kh-frame">
          {[
            ["When", `Mon ${EVENT_DATE} · 8:30 AM – 9:30 PM`],
            ["Where", `Room M215 · ${CAMPUS}`],
            ["Cost", "Free, food included"],
            ["Teams", "Solo or pairs"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="kh-label">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {/* The three stages */}
        <section id="campaign" className="kh-section kh-frame" aria-labelledby="campaign-title">
          <div className="kh-section-head" data-kh>
            <Label>How it works</Label>
            <h2 id="campaign-title" className="kh-h2">Three stages. One day.</h2>
            <p className="kh-body max-w-xl">
              We folded our remaining club events into a single day: the campus build session, the mini hackathon and the
              second showcase.
            </p>
          </div>

          <ol className="kh-grid-3">
            {phases.map((p, i) => (
              <li key={p.verb} className="kh-cell kh-phase" data-kh style={d(i * 90)}>
                <p className="kh-step" aria-hidden>{i + 1}</p>
                <Label className="mt-4">
                  <span className="sr-only">Stage {i + 1}: </span>
                  {p.verb}
                </Label>
                <h3 className="kh-h3 mt-2">{p.title}</h3>
                <p className="kh-body mt-3">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What to submit */}
        <section id="submit" className="kh-section kh-frame" aria-labelledby="submit-title">
          <div className="kh-section-head" data-kh>
            <Label>What you&apos;ll submit</Label>
            <h2 id="submit-title" className="kh-h2">Bring two things to the demo</h2>
            <p className="kh-body max-w-xl">Due by 8:00 PM. Finalists present them in the Wellness Lounge.</p>
          </div>
          <ol className="kh-grid-2">
            {deliverables.map((item, i) => (
              <li key={item.title} className="kh-cell" data-kh style={d(i * 90)}>
                <p className="kh-step" aria-hidden>{i + 1}</p>
                <h3 className="kh-h3 mt-4">{item.title}</h3>
                <p className="kh-body mt-3">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Schedule */}
        <section id="schedule" className="kh-section kh-frame" aria-labelledby="schedule-title">
          <div className="kh-split">
            <div className="kh-section-head lg:sticky lg:top-24 lg:self-start" data-kh>
              <Label>Schedule</Label>
              <h2 id="schedule-title" className="kh-h2">The schedule</h2>
              <p className="kh-body">
                Drop in around your classes. Only the 8:00 PM submission deadline is fixed. Times may shift a little on
                the day.
              </p>
              <ul className="mt-8 grid gap-3" aria-label="Rooms">
                {rooms.map((r) => (
                  <li key={r.key} className="kh-room">
                    <span className="block font-semibold">{r.name}</span>
                    <span className="block text-white">{r.role}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ol className="kh-schedule">
              {agenda.map((item, i) => {
                const room = roomFor(item.body);
                const milestone = !item.body;
                return (
                  <li
                    key={`${item.time}-${item.title}`}
                    className={`kh-row ${milestone ? "kh-row-milestone" : ""}`}
                    data-kh
                    style={d(i * 30)}
                  >
                    <span className="kh-row-time">{item.time}</span>
                    <span className="kh-row-main">
                      <span className="kh-row-title">{item.title}</span>
                      {item.body && item.body !== room?.key && item.body !== room?.name && (
                        <span className="kh-row-note">{item.body}</span>
                      )}
                    </span>
                    {room && <span className="kh-row-room">{room.name}</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="kh-section kh-frame" aria-labelledby="faq-title">
          <div className="kh-split">
            <div className="kh-section-head" data-kh>
              <Label>FAQ</Label>
              <h2 id="faq-title" className="kh-h2">Questions</h2>
            </div>
            <div className="kh-faqs">
              {faqs.map((f) => (
                <details key={f.q} className="kh-faq">
                  <summary>
                    <span>{f.q}</span>
                    <span className="kh-faq-icon" aria-hidden />
                  </summary>
                  <p className="kh-body pb-6 pr-10">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="kh-footer kh-frame">
        <p className="kh-motto" lang="la">
          Veni Vidi Hacki
        </p>
        <p className="kh-label mt-4 text-center">I came, I saw, I hacked.</p>
        <div className="kh-footer-bar">
          <p>{COPYRIGHT}</p>
          <div className="flex gap-6">
            <Link href="/" className="kh-link">Knights Hack home</Link>
            <a href="#top" className="kh-link">Back to top</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
