import { Button, Link, Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import { colors, EmailLayout, fineprint, paragraph } from "./layout";

export function ResetPasswordEmail({ name, url, minutes }: { name: string; url: string; minutes: number }) {
  return (
    <EmailLayout preview="Reset your Knights Hack password" eyebrow="> knights --reset" title="New password.">
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>Someone asked to reset the password for your Knights Hack account. Tap the button to choose a new one:</Text>

      <Section style={{ margin: "8px 0 20px", textAlign: "center" }}>
        <Button href={url} style={button}>
          Choose a new password
        </Button>
      </Section>

      <Text style={paragraph}>
        The link works once, for <strong>{minutes} minutes</strong>. Never share it: organizers will never ask you for it.
      </Text>
      <Text style={fineprint}>
        Button not working? Paste this into your browser:{" "}
        <Link href={url} style={{ color: colors.knight600, wordBreak: "break-all" }}>
          {url}
        </Link>
      </Text>
      <Text style={fineprint}>Didn&apos;t ask for this? You can ignore this email; your password stays the same.</Text>
    </EmailLayout>
  );
}

const button: CSSProperties = {
  display: "inline-block",
  padding: "13px 22px",
  borderRadius: 999,
  backgroundColor: colors.knight600,
  color: colors.paper,
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
};

ResetPasswordEmail.PreviewProps = {
  name: "Axel",
  url: "https://knights-hack-club.vercel.app/reset-password?token=example",
  minutes: 30,
};

export default ResetPasswordEmail;
