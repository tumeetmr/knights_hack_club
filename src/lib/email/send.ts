import "server-only";
import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";

const g = globalThis as unknown as { __khResend?: Resend };

/**
 * Sends one email through Resend, with a plain-text copy for clients that don't show HTML.
 * Without RESEND_API_KEY outside production it only logs the text, so local sign-up still works.
 */
export async function sendEmail({ to, subject, body }: { to: string; subject: string; body: ReactElement }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const text = await render(body, { plainText: true });

  if (!key || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY and EMAIL_FROM must be set");
    console.info(`[email] RESEND_API_KEY not set; would send to ${to}: ${subject}\n${text}`);
    return;
  }

  const resend = (g.__khResend ??= new Resend(key));
  const { error } = await resend.emails.send({ from, to, subject, html: await render(body), text });
  if (error) throw new Error(`Resend: ${error.message}`);
}
