import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAMPUS, CAMPUS_ADDRESS, events, googleCalendarUrl } from "@/lib/events";
import { Reveal } from "@/components/reveal";
import { COPYRIGHT } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Headline, RollLink, SectionBlock, icons, panel } from "@/components/ui";

// Only events with a slug get a page; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return events.filter((e) => e.slug).map((e) => ({ slug: e.slug! }));
}

const findEvent = (slug: string) => events.find((e) => e.slug === slug);

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = findEvent((await params).slug);
  if (!event) return {};
  const title = `${event.title} | Knights Hack Club`;
  return { title, description: event.body, openGraph: { title, description: event.body } };
}

const calButton =
  "inline-flex items-center gap-1.5 rounded-full border-2 border-white/25 px-4 py-2 text-sm font-semibold transition hover:border-white hover:bg-white hover:text-ink active:scale-95";

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const event = findEvent((await params).slug);
  if (!event) notFound();

  const { agenda = [], links = [] } = event;

  return (
    <>
      <SiteHeader base="/" />
      <Reveal />

      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Hero */}
        <section className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="absolute -right-32 -top-32 size-[360px] glow sm:-right-40 sm:-top-40 sm:size-[640px]" aria-hidden />
          <div
            className="absolute -bottom-40 -left-32 size-[320px] glow [--glow:rgb(37_99_184_/_0.3)] sm:-bottom-60 sm:-left-40 sm:size-[520px]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <Link
              href="/#events"
              className="inline-flex min-h-10 items-center font-mono text-xs text-knight-300 hover:text-white sm:text-sm"
            >
              ← All events
            </Link>
            <div className="rise mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">{event.kind}</span>
              {event.date && (
                <span className="rounded-full bg-knight-600 px-3 py-1 text-xs font-semibold text-white">Confirmed</span>
              )}
            </div>
            <Headline
              as="h1"
              onLoad
              lines={[event.title]}
              className="mt-5 max-w-5xl text-[clamp(3rem,9vw,7.5rem)]"
            />
            <p className="rise mt-6 max-w-2xl text-lg text-white/75 sm:text-xl" style={{ "--d": "400ms" } as CSSProperties}>
              {event.body}
            </p>

            <dl
              className="rise mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4"
              style={{ "--d": "550ms" } as CSSProperties}
            >
              {[
                { icon: icons.calendar, label: "Date", value: event.date ?? `${event.month} · TBA` },
                { icon: icons.star, label: "Time", value: event.time },
                { icon: icons.pin, label: "Where", value: event.place ?? "Room TBA", sub: `${CAMPUS}, ${CAMPUS_ADDRESS}` },
              ].map((d) => (
                <div key={d.label} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/15">
                  <dt className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-knight-300 [&_svg]:size-4">
                    {d.icon} {d.label}
                  </dt>
                  <dd className="mt-3 text-xl font-bold tracking-tight">{d.value}</dd>
                  {d.sub && <dd className="mt-1 text-sm text-white/55">{d.sub}</dd>}
                </div>
              ))}
            </dl>

            {event.start && event.end && (
              <div className="rise mt-6 flex flex-wrap gap-2" style={{ "--d": "650ms" } as CSSProperties}>
                <a
                  href={googleCalendarUrl({ ...event, start: event.start, end: event.end })}
                  target="_blank"
                  rel="noreferrer"
                  className={calButton}
                >
                  + Google Calendar
                </a>
                <a href="/calendar.ics" download className={calButton}>
                  + Apple / Outlook
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Agenda */}
        {agenda.length > 0 && (
          <section id="agenda" className={`${panel} bg-paper`}>
            <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[22rem_1fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> agenda"}</p>
                <Headline lines={["The", "plan."]} className="mt-6 text-[clamp(4rem,12vw,8rem)]" />
                <SectionBlock tone="mist" label="Drop in anytime" icon={icons.smile} className="mt-8">
                  <p className="text-ink/70">
                    Come for the whole thing or just part of it. Times are a
                    guide and may shift a little on the day.
                  </p>
                </SectionBlock>
              </div>

              <ol className="relative">
                {agenda.map((item, i) => (
                  <li
                    key={item.title}
                    data-reveal="up"
                    style={{ "--d": `${i * 60}ms` } as CSSProperties}
                    className="grid grid-cols-[5.5rem_1fr] gap-4 border-t-2 border-knight-600/15 py-6 last:border-b-2 sm:grid-cols-[8rem_1fr] sm:gap-8 sm:py-8"
                  >
                    <p className="headline pt-1 text-2xl text-knight-600 sm:text-4xl">{item.time}</p>
                    <div>
                      <h3 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">{item.title}</h3>
                      {item.body && <p className="mt-2 leading-relaxed text-ink/70 sm:text-lg">{item.body}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Links */}
        {links.length > 0 && (
          <section id="links" className={`${panel} bg-grid-blue text-white`}>
            <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
              <p className="font-mono text-xs font-medium tracking-wider text-white/70">{"> links"}</p>
              <Headline lines={["Before you", "show up."]} className="mt-6 text-[clamp(3.5rem,10vw,7rem)]" />

              <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {links.map((l, i) => {
                  const external = !l.href.startsWith("/");
                  const className =
                    "group flex h-full items-center justify-between gap-6 rounded-3xl bg-paper p-6 text-ink transition hover:bg-ink hover:text-white sm:p-8";
                  const body = (
                    <>
                      <span>
                        <span className="block text-2xl font-bold tracking-tight sm:text-3xl">{l.label}</span>
                        {l.note && (
                          <span className="mt-2 block text-ink/60 transition group-hover:text-white/60">{l.note}</span>
                        )}
                      </span>
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-current text-xl transition group-hover:bg-white group-hover:text-ink"
                        aria-hidden
                      >
                        {external ? "↗" : "→"}
                      </span>
                    </>
                  );
                  return (
                    <li key={l.href} data-reveal="up" style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                      {external ? (
                        <a href={l.href} target="_blank" rel="noreferrer" className={className}>
                          {body}
                        </a>
                      ) : (
                        <Link href={l.href} className={className}>
                          {body}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Back to the schedule */}
        <section className={`${panel} bg-knight-gradient text-white`}>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center">
            <Headline lines={["That's not all.", `${events.length - 1} more this fall.`]} className="max-w-3xl text-[clamp(2.75rem,9vw,4.5rem)]" />
            <RollLink href="/#events" className="w-full shrink-0 bg-white text-ink hover:bg-ink hover:text-white sm:w-auto">
              See the full schedule
            </RollLink>
          </div>
        </section>
      </main>

      <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto flex flex-wrap justify-between gap-x-4 gap-y-3 rounded-[2rem] bg-ink px-5 py-6 text-xs text-white/40 sm:px-8 lg:rounded-[2.5rem]">
          <p>{COPYRIGHT}</p>
          <a href="#top" className="hover:text-white">
            Back to top ↑
          </a>
        </div>
      </footer>
    </>
  );
}
