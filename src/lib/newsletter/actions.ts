"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createElement } from "react";
import { render } from "@react-email/components";
import { getDb } from "@/db";
import { newsletters, players } from "@/db/schema";
import { ClubUpdateEmail } from "@/emails/club-update";
import { requireAdmin } from "@/lib/ctf/session";
import { sendBatch, sendEmail } from "@/lib/email/send";
import { type NewsletterContent, newsletterSchema } from "./content";
import { audience } from "./queries";
import { unsubscribeHeaders, unsubscribeUrl } from "./unsubscribe";

export type NewsletterResult = { ok?: string; error?: string };

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

function parse(raw: unknown): { content: NewsletterContent } | { error: string } {
  const result = newsletterSchema.safeParse(raw);
  return result.success ? { content: result.data } : { error: result.error.issues[0]?.message ?? "Check the form" };
}

const email = (c: NewsletterContent, name: string, playerId?: number) =>
  createElement(ClubUpdateEmail, {
    name,
    issue: c.issue,
    intro: c.intro,
    now: c.now,
    soon: c.soon,
    unsubscribeUrl: playerId ? unsubscribeUrl(playerId) : undefined,
  });

/** HTML for the live preview in the admin. */
export async function previewNewsletterAction(raw: unknown): Promise<{ html?: string; error?: string }> {
  await requireAdmin();
  const parsed = parse(raw);
  if ("error" in parsed) return { error: parsed.error };
  return { html: await render(email(parsed.content, "Axel")) };
}

export async function sendTestNewsletterAction(raw: unknown, to: string): Promise<NewsletterResult> {
  await requireAdmin();
  const parsed = parse(raw);
  if ("error" in parsed) return { error: parsed.error };
  const address = emailSchema.safeParse(to);
  if (!address.success) return { error: "Enter a valid email for the test." };

  try {
    await sendEmail({ to: address.data, subject: `[TEST] ${parsed.content.subject}`, body: email(parsed.content, "there") });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Sending failed." };
  }
  return { ok: `Test sent to ${address.data}. Check your inbox (and spam).` };
}

/**
 * Emails every verified, subscribed student. `expected` is the count the admin confirmed;
 * if it changed in the meantime we stop so they can look again.
 */
export async function sendNewsletterAction(raw: unknown, expected: number): Promise<NewsletterResult> {
  await requireAdmin();
  const parsed = parse(raw);
  if ("error" in parsed) return { error: parsed.error };
  const content = parsed.content;

  const db = await getDb();
  const recipients = await db.select({ id: players.id, name: players.name, email: players.email }).from(players).where(audience);
  if (recipients.length === 0) return { error: "No verified, subscribed members to send to." };
  if (recipients.length !== expected) {
    return { error: `The member count changed to ${recipients.length}. Reload the page and confirm again.` };
  }

  // Same content = same key, so a double click or retry within 24 hours is ignored by Resend.
  const key = `newsletter-${createHash("sha256").update(JSON.stringify(content)).digest("hex").slice(0, 32)}`;
  const { sent, failed } = await sendBatch(
    recipients.map((p) => ({
      to: p.email,
      subject: content.subject,
      body: email(content, p.name.split(/\s+/)[0] || p.name, p.id),
      headers: unsubscribeHeaders(p.id),
    })),
    key,
  );

  await db.insert(newsletters).values({ subject: content.subject, content, recipients: sent, failed });
  revalidatePath("/ctf/admin/newsletter");

  if (failed > 0) return { error: `Sent to ${sent}, but ${failed} failed. Check the server logs before retrying.` };
  return { ok: `Sent to ${sent} member${sent === 1 ? "" : "s"}.` };
}
