import { Button, Link, Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import { type ClubEvent, events } from "@/lib/events";
import { CONTACT_EMAIL, DISCORD_URL } from "@/lib/links";
import { type NewsletterItem as UpdateItem, sampleNewsletter } from "@/lib/newsletter/content";
import { colors, EmailLayout, fineprint, mono, paragraph, siteUrl } from "./layout";

/**
 * Member newsletter: who we are, what's happening right now and what's coming up.
 * Issues are written in the admin (/ctf/admin/newsletter); upcoming events come from events.ts,
 * so the schedule in the email always matches the site.
 */


export function ClubUpdateEmail({
  name,
  issue,
  intro,
  now,
  soon,
  upcoming = upcomingEvents(),
  unsubscribeUrl,
}: {
  name: string;
  /** Shown in the eyebrow and preview, e.g. "October 2026". */
  issue: string;
  intro: string;
  /** What's live or just happened. */
  now: UpdateItem[];
  /** Things dropping soon that aren't on the event schedule (features, sign-ups, prizes). */
  soon: UpdateItem[];
  upcoming?: ClubEvent[];
  /** Footer opt-out link; leave out for test sends. */
  unsubscribeUrl?: string;
}) {
  const site = siteUrl();
  const abs = (href: string) => (href.startsWith("/") ? `${site}${href}` : href);

  return (
    <EmailLayout
      preview={`Knights Hack ${issue}: ${now[0]?.title ?? "what's new"}, plus ${upcoming.length} events coming up`}
      eyebrow={`> knights --news ${issue.toLowerCase().replace(/\s+/g, "-")}`}
      title="Club update."
    >
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>{intro}</Text>

      <Section style={aboutBox}>
        <Text style={{ ...label, margin: "0 0 8px" }}>Who we are</Text>
        <Text style={{ ...paragraph, margin: 0, fontSize: 15, lineHeight: "22px" }}>
          Knights Hack is Niagara College&apos;s coding club for <strong>every program and every skill level</strong>.{" "}
          <strong>Learn it</strong> in hands-on workshops, <strong>vibe it</strong> with AI coding tools and{" "}
          <strong>build it</strong> at our showcases and hackathon. Zero experience needed.
        </Text>
      </Section>

      <SectionHeading kicker="01" title="Happening now" />
      {now.map((item) => (
        <ItemRow key={item.title} item={item} href={item.href && abs(item.href)} />
      ))}

      <SectionHeading kicker="02" title="Coming up" />
      {upcoming.map((e) => (
        <EventRow key={e.title} event={e} href={e.slug ? `${site}/events/${e.slug}` : undefined} />
      ))}
      <Text style={{ ...fineprint, margin: "4px 0 0" }}>
        Exact dates, times and rooms go up on the site and Discord a week before each event.{" "}
        <Link href={`${site}/calendar.ics`} style={link}>
          Add the club calendar
        </Link>{" "}
        and they&apos;ll show up automatically.
      </Text>

      {soon.length > 0 && (
        <>
          <SectionHeading kicker="03" title="Dropping soon" />
          {soon.map((item) => (
            <ItemRow key={item.title} item={item} href={item.href && abs(item.href)} />
          ))}
        </>
      )}

      <Section style={{ margin: "32px 0 8px", textAlign: "center" }}>
        <Button href={`${site}/ctf`} style={primaryButton}>
          Play the CTF
        </Button>
        <Button href={DISCORD_URL} style={secondaryButton}>
          Join the Discord
        </Button>
      </Section>

      <Text style={fineprint}>
        Got a project or startup idea? Pitch it for a showcase:{" "}
        <Link href={`mailto:${CONTACT_EMAIL}?subject=Knights%20Hack%20Showcase`} style={link}>
          email us
        </Link>{" "}
        with the subject &ldquo;Knights Hack Showcase&rdquo; and we&apos;ll save you a spot.
      </Text>
      <Text style={fineprint}>
        You&apos;re getting this because you have a Knights Hack account. Questions? Email{" "}
        <Link href={`mailto:${CONTACT_EMAIL}`} style={{ color: colors.muted }}>
          {CONTACT_EMAIL}
        </Link>
        .
        {unsubscribeUrl && (
          <>
            {" "}
            <Link href={unsubscribeUrl} style={{ color: colors.muted, textDecoration: "underline" }}>
              Unsubscribe from club updates
            </Link>
            .
          </>
        )}
      </Text>
    </EmailLayout>
  );
}

/** Scheduled events that haven't finished; TBA ones (no end) count as upcoming. */
export function upcomingEvents(now = Date.now()) {
  return events.filter((e) => !e.end || new Date(e.end).getTime() > now);
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Section style={{ margin: "32px 0 12px", borderTop: "1px solid #e4e7ec", paddingTop: 20 }}>
      <Text style={{ ...label, margin: 0 }}>{kicker} /</Text>
      <Text style={sectionTitle}>{title}</Text>
    </Section>
  );
}

function ItemRow({ item, href }: { item: UpdateItem; href?: string }) {
  return (
    <Section style={{ margin: "0 0 18px" }}>
      <Text style={{ ...tag, margin: "0 0 6px" }}>{item.tag}</Text>
      <Text style={itemTitle}>{item.title}</Text>
      <Text style={itemBody}>
        {item.body}
        {href && (
          <>
            {" "}
            <Link href={href} style={link}>
              {item.cta || "Check it out"} &rarr;
            </Link>
          </>
        )}
      </Text>
    </Section>
  );
}

function EventRow({ event, href }: { event: ClubEvent; href?: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ margin: "0 0 14px" }}>
      <tbody>
        <tr>
          <td style={{ width: 64, verticalAlign: "top", paddingRight: 14 }}>
            <div style={dateBadge}>
              <div style={{ fontSize: 11, lineHeight: "14px", color: colors.knight300 }}>{event.month.toUpperCase()}</div>
              <div style={{ fontSize: 13, lineHeight: "18px", fontWeight: 700 }}>
                {event.date ? event.date.replace(/^\D+/, "") : "TBA"}
              </div>
            </div>
          </td>
          <td style={{ verticalAlign: "top" }}>
            <Text style={{ ...tag, margin: "0 0 4px" }}>{event.kind}</Text>
            <Text style={itemTitle}>
              {href ? (
                <Link href={href} style={{ color: colors.ink, textDecoration: "none" }}>
                  {event.title}
                </Link>
              ) : (
                event.title
              )}
            </Text>
            <Text style={itemBody}>{event.body}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const label: CSSProperties = {
  fontFamily: mono,
  fontSize: 12,
  lineHeight: "16px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: colors.knight600,
};

const sectionTitle: CSSProperties = {
  margin: "4px 0 0",
  fontFamily: '"Archivo Narrow", "Arial Narrow", "Helvetica Neue", Arial, sans-serif',
  fontSize: 28,
  fontWeight: 700,
  lineHeight: "30px",
  textTransform: "uppercase",
  color: colors.ink,
};

const tag: CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  backgroundColor: colors.knight50,
  fontFamily: mono,
  fontSize: 11,
  lineHeight: "16px",
  fontWeight: 700,
  textTransform: "uppercase",
  color: colors.knight600,
};

const itemTitle: CSSProperties = { margin: 0, fontSize: 17, lineHeight: "24px", fontWeight: 700, color: colors.ink };

const itemBody: CSSProperties = { margin: "2px 0 0", fontSize: 15, lineHeight: "22px", color: colors.muted };

const link: CSSProperties = { color: colors.knight600, fontWeight: 700, textDecoration: "underline" };

const aboutBox: CSSProperties = {
  margin: "8px 0 0",
  padding: "18px 20px",
  borderRadius: 16,
  backgroundColor: colors.mist,
  border: "1px solid #e4e7ec",
};

const dateBadge: CSSProperties = {
  width: 64,
  padding: "8px 0",
  borderRadius: 12,
  backgroundColor: colors.ink,
  color: colors.paper,
  fontFamily: mono,
  textAlign: "center",
};

const buttonBase: CSSProperties = {
  display: "inline-block",
  margin: "0 4px 8px",
  padding: "13px 22px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
};

const primaryButton: CSSProperties = { ...buttonBase, backgroundColor: colors.knight600, color: colors.paper };

const secondaryButton: CSSProperties = {
  ...buttonBase,
  backgroundColor: colors.paper,
  color: colors.ink,
  border: `2px solid ${colors.ink}`,
};

ClubUpdateEmail.PreviewProps = {
  name: "Axel",
  ...sampleNewsletter,
  unsubscribeUrl: "https://knights-hack-club.vercel.app/unsubscribe",
} satisfies Parameters<typeof ClubUpdateEmail>[0];

export default ClubUpdateEmail;
