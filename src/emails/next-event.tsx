import { Body, Container, Head, Html, Img, Link, Preview, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import { CAMPUS, type ClubEvent, googleCalendarUrl, upcomingEvent } from "@/lib/events";
import { DISCORD_URL } from "@/lib/links";
import { colors, siteUrl } from "./layout";

/**
 * Plain heads-up for the next event, written like a normal email: no hero, cards or buttons.
 * Details come from the event in events.ts, so the email always matches its page on the site.
 */
export function NextEventEmail({
  name,
  event = upcomingEvent()!,
  bring,
  unsubscribeUrl,
}: {
  name: string;
  event?: ClubEvent;
  /** One line on what to bring, e.g. "Nothing! The lab has computers." */
  bring?: string;
  /** Footer opt-out link; leave out for test sends. */
  unsubscribeUrl?: string;
}) {
  const site = siteUrl();
  const page = event.slug ? `${site}/events/${event.slug}` : site;
  const calendar = event.start && event.end ? googleCalendarUrl({ ...event, start: event.start, end: event.end }) : undefined;
  const when = `${weekday(event) ?? ""}${event.date ? `, ${event.date}` : ""} · ${event.time.replace(/^\w+ · /, "")}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{`${event.title}: ${when}${event.place ? `, ${event.place}` : ""}`}</Preview>
      <Body style={{ margin: 0, backgroundColor: colors.paper, fontFamily: sans, color: colors.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
          <Text style={p}>Hi {name},</Text>
          <Text style={p}>
            Thanks to everyone who shared their availability. Our next event is set for the time that worked best
            for most of you.
          </Text>
          <Text style={p}>
            <strong>{event.title}</strong>
            <br />
            {event.body}
          </Text>
          <Text style={p}>
            <strong>When:</strong> {when}
            <br />
            <strong>Where:</strong> {[event.place, CAMPUS].filter(Boolean).join(", ")}
            {bring && (
              <>
                <br />
                <strong>Bring:</strong> {bring}
              </>
            )}
          </Text>
          <Text style={p}>
            Event details: <Link href={page} style={link}>{page.replace(/^https?:\/\//, "")}</Link>
            {calendar && (
              <>
                <br />
                <Link href={calendar} style={link}>Add it to your Google Calendar</Link>
              </>
            )}
          </Text>
          <Text style={p}>
            Feel free to bring a friend. If you have any questions, ask us on{" "}
            <Link href={DISCORD_URL} style={link}>Discord</Link>.
          </Text>
          <Text style={p}>See you there!</Text>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: 12 }}>
                  <Img src={`${site}/email/logo.png`} width={40} height={37} alt="Knights Hack" style={{ display: "block" }} />
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ ...p, margin: 0 }}>
                    The Knights Hack team
                    <br />
                    <span style={{ color: colors.muted }}>Niagara College</span>
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          {unsubscribeUrl && (
            <Text style={fineprint}>
              <Link href={unsubscribeUrl} style={{ color: colors.muted, textDecoration: "underline" }}>
                Unsubscribe from club updates
              </Link>
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}

/** "Monday" from the event's start, in campus time; falls back to the day in the time string. */
function weekday(e: ClubEvent) {
  if (e.start) {
    return new Date(e.start).toLocaleDateString("en-CA", { weekday: "long", timeZone: "America/Toronto" });
  }
  return e.time.match(/^(\w+) · /)?.[1];
}

const sans = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

const p: CSSProperties = { margin: "0 0 16px", fontSize: 15, lineHeight: "23px", color: colors.ink };

const link: CSSProperties = { color: colors.knight600, textDecoration: "underline" };

const fineprint: CSSProperties = { margin: "32px 0 0", fontSize: 12, lineHeight: "18px", color: colors.muted };

/** The Scratch workshop is in a campus lab, so a laptop is optional. */
export const scratchBring = "Nothing required, the lab has computers. Your own laptop is welcome too.";

NextEventEmail.PreviewProps = {
  name: "Axel",
  bring: scratchBring,
  unsubscribeUrl: "https://knights-hack-club.vercel.app/unsubscribe",
} satisfies Parameters<typeof NextEventEmail>[0];

export default NextEventEmail;
