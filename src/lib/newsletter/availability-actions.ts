"use server";

import { z } from "zod";
import { createElement } from "react";
import { render } from "@react-email/components";
import { AvailabilitySurveyEmail } from "@/emails/availability-survey";
import { NAME_TOKEN } from "./availability-shared";
import { requireAdmin } from "@/lib/ctf/session";

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

const email = (c: AvailabilityContent, name: string) =>
  createElement(AvailabilitySurveyEmail, { name, formUrl: c.formUrl, deadline: c.deadline });

function parse(raw: unknown): { content: AvailabilityContent } | { error: string } {
  const result = availabilitySchema.safeParse(raw);
  return result.success ? { content: result.data } : { error: result.error.issues[0]?.message ?? "Check the form" };
}

/**
 * HTML for the preview and for copying into a mail client, plus how the pasted list was read.
 * Emails go out from the admin's own mailbox, so nothing is sent from here.
 */
export async function previewAvailabilityAction(
  raw: unknown,
  list: string,
): Promise<{ html?: string; error?: string; recipients: Recipient[]; invalid: string[] }> {
  await requireAdmin();
  const { recipients, invalid } = parseList(list);
  const parsed = parse(raw);
  if ("error" in parsed) return { error: parsed.error, recipients, invalid };
  return { html: await render(email(parsed.content, NAME_TOKEN)), recipients, invalid };
}
