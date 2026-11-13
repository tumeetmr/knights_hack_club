import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAMPUS, CAMPUS_ADDRESS, events, googleCalendarUrl, type EventLink } from "@/lib/events";
import { Reveal } from "@/components/reveal";
import { COPYRIGHT } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Headline, RollLink, icons, panel } from "@/components/ui";

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

/** Group links under their heading, keeping the order they were written in. */
function groupLinks(links: EventLink[]) {
  const groups = new Map<string, EventLink[]>();
  for (const l of links) {
    const key = l.group ?? "Links";
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }
  return [...groups];
}

function ResourceLink({ link }: { link: EventLink }) {
  // Files under /public (PDFs) open in a new tab like external links.
  const internal = link.href.startsWith("/") && !link.href.endsWith(".pdf");
  const body = (
    <>
      <span className="min-w-0">
        <span className="block font-semibold">{link.label}</span>
        {link.note && <span className="mt-0.5 block text-sm text-ink/60">{link.note}</span>}
      </span>
      <span className="shrink-0 text-lg text-knight-600 transition group-hover:translate-x-0.5" aria-hidden>
        {internal ? "→" : "↗"}
      </span>
    </>
  );
  const className = "group flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-knight-50 sm:px-5";

  return internal ? (
    <Link href={link.href} className={className}>
      {body}
    </Link>
  ) : (
    <a
      href={link.href}
      {...(link.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
      className={className}
    >
      {body}
    </a>
  );
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const event = findEvent((await params).slug);
  if (!event) notFound();

  const { agenda = [], links = [], sponsors = [] } = event;
  const groups = groupLinks(links);

  const facts = [
    { icon: icons.calendar, label: "Date", value: event.date ?? `${event.month} · TBA` },
    { icon: icons.star, label: "Time", value: event.time },
    { icon: icons.pin, label: "Where", value: event.place ?? "Room TBA", sub: `${CAMPUS}, ${CAMPUS_ADDRESS}` },
  ];

  return (
    <>
      <SiteHeader base="/" />
      <Reveal />

      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Hero: what it is, when, where */}
        <section className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="absolute -right-32 -top-32 size-[360px] glow sm:-right-40 sm:-top-40 sm:size-[560px]" aria-hidden />

          <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
            <Link
              href="/#events"
              className="inline-flex min-h-10 items-center font-mono text-xs text-knight-300 hover:text-white sm:text-sm"
            >
              ← All events
            </Link>
            <div className="rise mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">{event.kind}</span>
              {event.date && (
                <span className="rounded-full bg-knight-600 px-3 py-1 text-xs font-semibold text-white">Confirmed</span>
              )}
            </div>
            <Headline
              as="h1"
              onLoad
              lines={[event.title]}
              className="mt-4 max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)]"
            />
            <p className="rise mt-5 max-w-2xl text-base text-white/75 sm:text-lg" style={{ "--d": "400ms" } as CSSProperties}>
              {event.body}
            </p>

            <dl
              className="rise mt-8 grid gap-x-8 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-[auto_auto_1fr]"
              style={{ "--d": "500ms" } as CSSProperties}
            >
              {facts.map((d) => (
                <div key={d.label}>
                  <dt className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-knight-300 [&_svg]:size-4">
                    {d.icon} {d.label}
                  </dt>
                  <dd className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">{d.value}</dd>
                  {d.sub && <dd className="mt-0.5 text-sm text-white/55">{d.sub}</dd>}
                </div>
              ))}
            </dl>

            {event.start && event.end && (
              <div className="rise mt-6 flex flex-wrap gap-2" style={{ "--d": "600ms" } as CSSProperties}>
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

        {/* Agenda + resources */}
        {(agenda.length > 0 || groups.length > 0) && (
          <section className={`${panel} bg-paper`}>
            <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_26rem] lg:gap-16">
              {agenda.length > 0 && (
                <div id="agenda">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Agenda</h2>
                  <p className="mt-1 text-ink/60">Drop in anytime. Times may shift a little on the day.</p>

                  <ol className="mt-8 border-l-2 border-knight-600/20">
                    {agenda.map((item, i) => (
                      <li
                        key={item.title}
                        data-reveal="up"
                        style={{ "--d": `${i * 50}ms` } as CSSProperties}
                        className="relative pb-8 pl-6 last:pb-0 sm:pl-8"
                      >
                        <span
                          className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-knight-600 ring-4 ring-paper"
                          aria-hidden
                        />
                        <p className="font-mono text-sm font-semibold text-knight-600">{item.time}</p>
                        <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight sm:text-xl">{item.title}</h3>
                        {item.body && <p className="mt-1.5 max-w-2xl leading-relaxed text-ink/70">{item.body}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {groups.length > 0 && (
                <aside id="links" className="lg:sticky lg:top-24 lg:self-start">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Links</h2>
                  <p className="mt-1 text-ink/60">Everything you need, in one place.</p>

                  <div className="mt-8 flex flex-col gap-6">
                    {groups.map(([heading, items]) => (
                      <div key={heading}>
                        <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-ink/50">{heading}</h3>
                        <ul className="mt-2 divide-y divide-ink/10 overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
                          {items.map((l) => (
                            <li key={l.href}>
                              <ResourceLink link={l} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </aside>
              )}
            </div>
          </section>
        )}

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section id="sponsors" className={`${panel} bg-white`}>
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {sponsors.length > 1 ? "Sponsors" : "Sponsor"}
              </h2>
              <p className="mt-1 text-ink/60">This event is made possible by the people below. Thank you!</p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sponsors.map((s, i) => (
                  <li key={s.name} data-reveal="up" style={{ "--d": `${i * 50}ms` } as CSSProperties}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-ink/10 transition hover:ring-knight-600 sm:p-6"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-3">
                          {s.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logo} alt="" className="size-10 shrink-0" />
                          )}
                          <span className="text-2xl font-bold tracking-tight">{s.name}</span>
                        </span>
                        <span className="text-lg text-knight-600 transition group-hover:translate-x-0.5" aria-hidden>
                          ↗
                        </span>
                      </span>
                      <span className="mt-2 text-ink/70">{s.blurb}</span>
                      {s.perk && (
                        <span className="mt-4 rounded-xl bg-knight-50 px-3 py-2 text-sm font-semibold text-knight-600">
                          {s.perk}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Back to the schedule */}
        <section className={`${panel} bg-knight-gradient text-white`}>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 sm:py-14 md:flex-row md:items-center">
            <Headline lines={["That's not all.", `${events.length - 1} more this fall.`]} className="max-w-3xl text-[clamp(2.25rem,7vw,3.75rem)]" />
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
