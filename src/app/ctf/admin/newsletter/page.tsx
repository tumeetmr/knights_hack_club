import { requireAdmin } from "@/lib/ctf/session";
import { type NewsletterContent, newsletterSchema, sampleNewsletter } from "@/lib/newsletter/content";
import { countRecipients, listNewsletters } from "@/lib/newsletter/queries";
import { AdminShell, PageHeader } from "../_components/shell";
import { card } from "../_components/styles";
import { NewsletterForm } from "./newsletter-form";

const sentFormat = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Toronto",
});

export default async function NewsletterPage() {
  await requireAdmin();
  const [recipients, history] = await Promise.all([countRecipients(), listNewsletters()]);

  // Start from the last issue so only what changed needs editing (skipping other sends, like the availability email).
  const last = history.map((n) => newsletterSchema.safeParse(n.content)).find((r) => r.success);
  const initial: NewsletterContent = last?.data ?? sampleNewsletter;

  return (
    <AdminShell>
      <PageHeader
        title="Newsletter"
        description={
          <>
            Email a club update to every member with a verified email. The <strong>Coming up</strong> list fills in
            from the events on the site. Currently <strong>{recipients}</strong> member{recipients === 1 ? "" : "s"}{" "}
            will get it.
          </>
        }
      />

      <NewsletterForm initial={initial} recipients={recipients} />

      <section className={card}>
        <h2 className="headline text-2xl">Sent</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-ink/60">Nothing sent yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10">
            {history.map((n) => (
              <li key={n.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <span className="font-medium">{n.subject}</span>
                <span className="font-mono text-xs text-ink/60">
                  {sentFormat.format(n.sentAt)} · {n.recipients} sent
                  {n.failed > 0 && <span className="text-red-700"> · {n.failed} failed</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
