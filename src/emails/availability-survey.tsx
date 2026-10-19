import { Button, Link, Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import { CONTACT_EMAIL } from "@/lib/links";
import { colors, EmailLayout, fineprint, paragraph } from "./layout";

/**
 * Short status note: no events before midterms, the next one moves to the week after reading
 * week, and members pick their free times on a form so we can schedule around most people.
 */
export function AvailabilitySurveyEmail({
  name,
  formUrl,
  deadline,
  unsubscribeUrl,
}: {
  name: string;
  formUrl: string;
  /** When the form closes, e.g. "Friday, October 23". */
  deadline: string;
  /** Footer opt-out link; leave out for test sends. */
  unsubscribeUrl?: string;
}) {
  return (
    <EmailLayout
      preview="No events before midterms. Tell us when you're free and we'll plan the next one around you."
      eyebrow="> knights --schedule next-event"
      compact
    >
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>
        We know midterms mean lots of assignments and studying, so we won&apos;t be hosting any events before
        midterms. Our <strong>next event is moving to the first week after reading week</strong>.
      </Text>
      <Text style={paragraph}>
        We want as many of you there as possible, so please tell us when you&apos;re free{" "}
        <strong>outside of class</strong>. We&apos;ll host the event at the time that works for most people.
      </Text>

      <Section style={{ margin: "8px 0 16px" }}>
        <Button href={formUrl} style={primaryButton}>
          Share my availability &rarr;
        </Button>
      </Section>

      <Text style={paragraph}>
        It takes about a minute. Please submit by <strong>{deadline}</strong>.
      </Text>

      <Text style={{ ...paragraph, margin: "24px 0 0" }}>Good luck on your midterms!</Text>
      <Text style={{ ...paragraph, margin: 0 }}>— The Knights Hack team</Text>

      <Text style={fineprint}>
        Questions? Email{" "}
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

const primaryButton: CSSProperties = {
  display: "inline-block",
  padding: "13px 22px",
  borderRadius: 999,
  backgroundColor: colors.knight600,
  color: colors.paper,
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
};

AvailabilitySurveyEmail.PreviewProps = {
  name: "Axel",
  formUrl: "https://forms.gle/your-form",
  deadline: "Friday, October 23",
} satisfies Parameters<typeof AvailabilitySurveyEmail>[0];

export default AvailabilitySurveyEmail;
