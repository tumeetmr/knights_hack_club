import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

/**
 * Shared shell for every email, in the site's style: a black hero panel with the grid and
 * terminal-style eyebrow, a white card below, and the Knights blue as the accent.
 * Email clients ignore stylesheets and most modern CSS, so everything is inline styles.
 */

export const colors = {
  ink: "#0a0a0a",
  paper: "#ffffff",
  mist: "#f3f5f8",
  knight50: "#eaf3fd",
  knight300: "#7db8ee",
  knight600: "#2563b8",
  muted: "#5c5f66",
} as const;

const sans = 'Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif';
const condensed = '"Archivo Narrow", "Arial Narrow", "Helvetica Neue", Arial, sans-serif';
export const mono = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';

/** Absolute site address for images and links: SITE_URL, else Vercel's production domain. */
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export function EmailLayout({
  preview,
  eyebrow,
  title,
  children,
}: {
  /** Inbox preview line. */
  preview: string;
  /** Terminal-style line above the title, e.g. "> knights --verify". */
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const site = siteUrl();
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        {/* Clients that allow web fonts (Apple Mail, iOS) load these; the rest use the fallbacks. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- an email, not a Next.js page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700&family=Archivo+Narrow:wght@700&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: colors.mist, fontFamily: sans, color: colors.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "24px 12px" }}>
          <Section style={hero}>
            <Section style={{ padding: "28px 28px 36px" }}>
              <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", paddingRight: 12 }}>
                      <Img src={`${site}/email/logo.png`} width={40} height={37} alt="" style={{ display: "block" }} />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Text style={brand}>KNIGHTS HACK</Text>
                      <Text style={brandSub}>Official NCSAC Club</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
              <Text style={eyebrowStyle}>{eyebrow}</Text>
              <Text style={headline}>{title}</Text>
            </Section>
          </Section>

          <Section style={card}>{children}</Section>

          <Text style={footer}>
            Knights Hack Club · Niagara College
            <br />
            <Link href={site} style={{ color: colors.muted, textDecoration: "underline" }}>
              {site.replace(/^https?:\/\//, "")}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const hero: CSSProperties = {
  backgroundColor: colors.ink,
  // Same 48px grid as the site's .bg-grid; clients that drop background images just show black.
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  borderRadius: "32px 32px 0 0",
  color: colors.paper,
};

const brand: CSSProperties = {
  margin: 0,
  fontFamily: condensed,
  fontSize: 20,
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: "0.01em",
  color: colors.paper,
};

const brandSub: CSSProperties = {
  margin: "2px 0 0",
  fontFamily: mono,
  fontSize: 10,
  lineHeight: "14px",
  color: "rgba(255,255,255,0.55)",
};

const eyebrowStyle: CSSProperties = {
  margin: "32px 0 0",
  fontFamily: mono,
  fontSize: 13,
  lineHeight: "18px",
  color: colors.knight300,
};

const headline: CSSProperties = {
  margin: "10px 0 0",
  fontFamily: condensed,
  fontSize: 52,
  fontWeight: 700,
  lineHeight: "46px",
  textTransform: "uppercase",
  color: colors.paper,
};

const card: CSSProperties = {
  backgroundColor: colors.paper,
  borderRadius: "0 0 32px 32px",
  padding: "28px",
  border: "1px solid #e4e7ec",
  borderTop: "none",
};

const footer: CSSProperties = {
  margin: "20px 0 0",
  fontSize: 12,
  lineHeight: "18px",
  textAlign: "center",
  color: colors.muted,
};

/** Body copy inside the card. */
export const paragraph: CSSProperties = {
  margin: "0 0 16px",
  fontSize: 16,
  lineHeight: "24px",
  color: colors.ink,
};

export const fineprint: CSSProperties = {
  margin: "16px 0 0",
  fontSize: 13,
  lineHeight: "20px",
  color: colors.muted,
};
