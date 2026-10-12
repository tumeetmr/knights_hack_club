import { Section, Text } from "@react-email/components";
import { colors, EmailLayout, fineprint, mono, paragraph } from "./layout";

export function VerifyCodeEmail({ name, code, minutes }: { name: string; code: string; minutes: number }) {
  return (
    <EmailLayout preview={`Your Knights Hack code is ${code}`} eyebrow="> knights --verify" title="Your code.">
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>Enter this code on the Knights Hack site to confirm your email:</Text>

      <Section
        style={{
          margin: "8px 0 20px",
          padding: "20px 12px",
          borderRadius: 16,
          backgroundColor: colors.mist,
          border: "1px solid #e4e7ec",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            margin: 0,
            fontFamily: mono,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: "48px",
            letterSpacing: "10px",
            color: colors.ink,
          }}
        >
          {code}
        </Text>
      </Section>

      <Text style={paragraph}>
        It works for <strong>{minutes} minutes</strong>. Never share it: organizers will never ask you for it.
      </Text>
      <Text style={fineprint}>Didn&apos;t sign up for Knights Hack Club? You can ignore this email.</Text>
    </EmailLayout>
  );
}

VerifyCodeEmail.PreviewProps = { name: "Axel", code: "482913", minutes: 10 };

export default VerifyCodeEmail;
