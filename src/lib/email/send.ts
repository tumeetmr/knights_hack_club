import "server-only";
import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";

const g = globalThis as unknown as { __khResend?: Resend };

/** Resend client and sender, or null outside production when they aren't configured. */
function client() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY and EMAIL_FROM must be set");
    return null;
  }
  return { resend: (g.__khResend ??= new Resend(key)), from };
}

/**
 * Sends one email through Resend, with a plain-text copy for clients that don't show HTML.
 * Without RESEND_API_KEY outside production it only logs the text, so local sign-up still works.
 */
export async function sendEmail({
  to,
  subject,
  body,
  headers,
}: {
  to: string;
  subject: string;
  body: ReactElement;
  headers?: Record<string, string>;
}) {
  const text = await render(body, { plainText: true });
  const c = client();
  if (!c) {
    console.info(`[email] RESEND_API_KEY not set; would send to ${to}: ${subject}\n${text}`);
    return;
  }

  const { error } = await c.resend.emails.send({ from: c.from, to, subject, html: await render(body), text, headers });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export type BatchEmail = { to: string; subject: string; body: ReactElement; headers?: Record<string, string> };

const BATCH_SIZE = 100; // Resend's per-request limit
const BATCH_GAP_MS = 600; // stays under Resend's default 2 requests/second

/**
 * Sends many emails in batches of 100. `key` makes each batch idempotent for 24 hours, so
 * retrying the same send (a double click, a timeout) doesn't email anyone twice.
 * Returns how many were sent and how many failed; a failed batch doesn't stop the rest.
 */
export async function sendBatch(emails: BatchEmail[], key: string) {
  const c = client();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const payload = await Promise.all(
      chunk.map(async (e) => ({
        from: c?.from ?? "",
        to: e.to,
        subject: e.subject,
        html: await render(e.body),
        text: await render(e.body, { plainText: true }),
        headers: e.headers,
      })),
    );

    if (!c) {
      console.info(`[email] RESEND_API_KEY not set; would send "${chunk[0].subject}" to ${chunk.map((e) => e.to).join(", ")}`);
      sent += chunk.length;
      continue;
    }

    if (i > 0) await new Promise((r) => setTimeout(r, BATCH_GAP_MS));
    const { error } = await c.resend.batch.send(payload, { idempotencyKey: `${key}/${i / BATCH_SIZE}` });
    if (error) {
      console.error(`[email] batch ${i / BATCH_SIZE} failed: ${error.message}`);
      failed += chunk.length;
    } else {
      sent += chunk.length;
    }
  }

  return { sent, failed };
}
