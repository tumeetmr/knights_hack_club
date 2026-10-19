"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createElement } from "react";
import { render } from "@react-email/components";
import { getDb } from "@/db";
import { newsletters } from "@/db/schema";
import { AvailabilitySurveyEmail } from "@/emails/availability-survey";
import { requireAdmin } from "@/lib/ctf/session";
import { sendBatch, sendEmail } from "@/lib/email/send";

export type AvailabilityResult = { ok?: string; error?: string };

const MAX_RECIPIENTS = 2000;

const availabilitySchema = z.object({
  subject: z.string().trim().min(1, "Add a subject line").max(120),
  formUrl: z.url({ protocol: /^https?$/, error: "Paste the form link (https://…)" }),
  deadline: z.string().trim().min(1, "Add a deadline").max(60),
});

export type AvailabilityContent = z.infer<typeof availabilitySchema>;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export type Recipient = { email: string; name?: string };

/**
 * Reads a pasted list: one person per line, either `email`, `name, email` or `Name <email>`.
 * Commas, semicolons and spaces between bare addresses also work. Duplicates are dropped.
 */
function parseList(raw: string): { recipients: Recipient[]; invalid: string[] } {
  const seen = new Set<string>();
  const recipients: Recipient[] = [];
  const invalid: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // "Name <email>" or "Name, email" (a spreadsheet row) → one person with a name.
    const angle = trimmed.match(/^(.*)<([^>]+)>$/);
    const pair = trimmed.match(/^([^,;@]+)[,;\t]\s*(\S+@\S+)$/);
    const entries: Recipient[] = angle
      ? [{ name: angle[1].replace(/["',]/g, "").trim(), email: angle[2] }]
      : pair
        ? [{ name: pair[1].trim(), email: pair[2] }]
        : trimmed.split(/[\s,;]+/).map((email) => ({ email }));

    for (const entry of entries) {
      const parsed = emailSchema.safeParse(entry.email);
      if (!parsed.success) {
        invalid.push(entry.email);
        continue;
      }
      if (seen.has(parsed.data)) continue;
      seen.add(parsed.data);
      recipients.push({ email: parsed.data, name: entry.name || undefined });
    }
  }
  return { recipients, invalid };
}

const firstName = (name?: string) => name?.split(/\s+/)[0] || "there";

const email = (c: AvailabilityContent, name: string) =>
  createElement(AvailabilitySurveyEmail, { name, formUrl: c.formUrl, deadline: c.deadline });

function parse(raw: unknown): { content: AvailabilityContent } | { error: string } {
  const result = availabilitySchema.safeParse(raw);
  return result.success ? { content: result.data } : { error: result.error.issues[0]?.message ?? "Check the form" };
}

/** HTML for the live preview, plus how the pasted list was read. */
export async function previewAvailabilityAction(
  raw: unknown,
  list: string,
): Promise<{ html?: string; error?: string; count: number; invalid: string[] }> {
  await requireAdmin();
  const { recipients, invalid } = parseList(list);
  const parsed = parse(raw);
  if ("error" in parsed) return { error: parsed.error, count: recipients.length, invalid };
  return { html: await render(email(parsed.content, "Axel")), count: recipients.length, invalid };
}

export async function sendTestAvailabilityAction(raw: unknown, to: string): Promise<AvailabilityResult> {
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
 * Emails everyone on the pasted list. `expected` is the count the admin confirmed; if the list
 * reads differently on the server we stop so they can look again.
 */
export async function sendAvailabilityAction(raw: unknown, list: string, expected: number): Promise<AvailabilityResult> {
  await requireAdmin();
  const parsed = parse(raw);
  if ("error" in parsed) return { error: parsed.error };
  const content = parsed.content;

  const { recipients, invalid } = parseList(list);
  if (invalid.length > 0) return { error: `Fix or remove ${invalid.length} invalid address${invalid.length === 1 ? "" : "es"} first.` };
  if (recipients.length === 0) return { error: "Paste at least one email address." };
  if (recipients.length > MAX_RECIPIENTS) return { error: `That's over ${MAX_RECIPIENTS} addresses. Split the list.` };
  if (recipients.length !== expected) {
    return { error: `The list now has ${recipients.length} addresses. Check it and confirm again.` };
  }

  // Same email to the same list = same key, so a double click or retry within 24 hours is ignored by Resend.
  const key = `availability-${createHash("sha256")
    .update(JSON.stringify([content, recipients.map((r) => r.email)]))
    .digest("hex")
    .slice(0, 32)}`;
  const { sent, failed } = await sendBatch(
    recipients.map((r) => ({ to: r.email, subject: content.subject, body: email(content, firstName(r.name)) })),
    key,
  );

  const db = await getDb();
  await db.insert(newsletters).values({ subject: content.subject, content: { kind: "availability", ...content }, recipients: sent, failed });
  revalidatePath("/ctf/admin/availability");
  revalidatePath("/ctf/admin/newsletter");

  if (failed > 0) return { error: `Sent to ${sent}, but ${failed} failed. Check the server logs before retrying.` };
  return { ok: `Sent to ${sent} ${sent === 1 ? "person" : "people"}.` };
}
