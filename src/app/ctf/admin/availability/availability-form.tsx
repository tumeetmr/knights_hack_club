"use client";

import { useEffect, useMemo, useState } from "react";
import { FormMessage, input, label } from "@/components/form-ui";
import {
  type AvailabilityContent,
  type Recipient,
  previewAvailabilityAction,
} from "@/lib/newsletter/availability-actions";
import { NAME_TOKEN } from "@/lib/newsletter/availability-shared";
import { btnGhost, btnPrimary, card } from "../_components/styles";

const initial: AvailabilityContent = {
  subject: "Next event update + quick availability form",
  formUrl: "",
  deadline: "",
};

const SENT_KEY = "availability-sent";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const firstName = (name?: string) => name?.split(/\s+/)[0] || "there";

const withName = (html: string, name: string) => html.replaceAll(NAME_TOKEN, escapeHtml(name));

/** Outlook on the web: opens a new message with the recipient and subject filled in. */
const composeUrl = (to: string, subject: string) =>
  `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}`;

function loadSent(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function AvailabilityForm() {
  const [content, setContent] = useState(initial);
  const [list, setList] = useState("");
  const [preview, setPreview] = useState<{ html?: string; error?: string; recipients: Recipient[]; invalid: string[] }>({
    recipients: [],
    invalid: [],
  });
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");

  // Read saved ticks after mount so server and client render the same first paint.
  useEffect(() => {
    const timer = setTimeout(() => setSent(loadSent()), 0);
    return () => clearTimeout(timer);
  }, []);

  // Re-render the preview and re-read the list shortly after typing stops.
  useEffect(() => {
    const timer = setTimeout(() => {
      previewAvailabilityAction(content, list).then(setPreview, () =>
        setPreview((p) => ({ ...p, error: "Preview failed to load." })),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [content, list]);

  const set = <K extends keyof AvailabilityContent>(key: K, value: AvailabilityContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  const { html, recipients, invalid } = preview;
  const doneCount = recipients.filter((r) => sent.has(r.email)).length;
  const previewHtml = useMemo(() => (html ? withName(html, "Axel") : ""), [html]);

  const markSent = (email: string, value: boolean) =>
    setSent((prev) => {
      const next = new Set(prev);
      if (value) next.add(email);
      else next.delete(email);
      try {
        localStorage.setItem(SENT_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });

  const copy = async (r: Recipient) => {
    if (!html) return;
    setCopyError("");
    const body = withName(html, firstName(r.name));
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([body], { type: "text/html" }),
          "text/plain": new Blob([`Open this email in an HTML-capable client.`], { type: "text/plain" }),
        }),
      ]);
      setCopied(r.email);
      setTimeout(() => setCopied((c) => (c === r.email ? null : c)), 2000);
    } catch {
      setCopyError("Couldn't copy. Check the form is complete and the browser allows clipboard access.");
    }
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="grid gap-5">
        <section className={`${card} grid gap-4`}>
          <Field id="subject" title="Subject line" value={content.subject} max={120} onChange={(v) => set("subject", v)} />
          <Field
            id="form-url"
            title="Availability form link"
            placeholder="https://forms.gle/…"
            value={content.formUrl}
            max={500}
            onChange={(v) => set("formUrl", v)}
          />
          <Field
            id="deadline"
            title="Submit by"
            hint="Shown as “Please submit by …”, e.g. Friday, October 23."
            value={content.deadline}
            max={60}
            onChange={(v) => set("deadline", v)}
          />
        </section>

        <section className={`${card} grid gap-2`}>
          <label htmlFor="list" className={label}>Member emails</label>
          <textarea
            id="list"
            rows={8}
            value={list}
            onChange={(e) => setList(e.target.value)}
            placeholder={"one per line, or paste a column from a spreadsheet\nAxel Smith, axel@ncstudents.niagaracollege.ca\njamie@ncstudents.niagaracollege.ca"}
            className={`${input} font-mono text-sm`}
          />
          <p className="text-sm text-ink/60">
            Add a name before the email (<code>Name, email</code>) to greet them by first name; otherwise it says
            &ldquo;Hi there&rdquo;.
          </p>
          {invalid.length > 0 && (
            <p className="text-sm text-red-700">
              {invalid.length} invalid: {invalid.slice(0, 5).join(", ")}
              {invalid.length > 5 && "…"}
            </p>
          )}
        </section>

        <section className={`${card} grid gap-3`}>
          <div className="flex items-baseline justify-between gap-2">
            <p className={label}>Recipients</p>
            <p className="text-sm text-ink/60">
              {doneCount} of {recipients.length} sent
            </p>
          </div>
          <p className="text-sm text-ink/60">
            For each person: <strong>Copy email</strong>, then <strong>Open Outlook</strong>, paste into the message
            body, send, and tick the box. Ticks are saved in this browser only.
          </p>
          {preview.error && <FormMessage state={{ error: preview.error }} />}
          {copyError && <FormMessage state={{ error: copyError }} />}
          {recipients.length === 0 ? (
            <p className="text-sm text-ink/60">Paste your member list above.</p>
          ) : (
            <ul className="grid gap-2">
              {recipients.map((r) => {
                const done = sent.has(r.email);
                return (
                  <li key={r.email} className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={(e) => markSent(r.email, e.target.checked)}
                      aria-label={`Mark ${r.email} as sent`}
                    />
                    <span className={`min-w-0 flex-1 truncate text-sm ${done ? "text-ink/40 line-through" : ""}`}>
                      {r.name ? `${r.name} · ` : ""}
                      {r.email}
                    </span>
                    <button type="button" onClick={() => copy(r)} disabled={!html} className={btnPrimary}>
                      {copied === r.email ? "Copied!" : "Copy email"}
                    </button>
                    <a
                      href={composeUrl(r.email, content.subject)}
                      target="_blank"
                      rel="noreferrer"
                      className={btnGhost}
                    >
                      Open Outlook
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="lg:sticky lg:top-36">
        <p className={label}>Preview</p>
        <iframe
          title="Email preview"
          srcDoc={previewHtml}
          sandbox=""
          className={`h-[75vh] w-full rounded-2xl bg-mist ring-1 ring-ink/10 ${preview.error ? "opacity-50" : ""}`}
        />
      </section>
    </div>
  );
}

function Field({
  id,
  title,
  hint,
  value,
  max,
  placeholder,
  onChange,
}: {
  id: string;
  title: string;
  hint?: string;
  value: string;
  max: number;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      <input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={input}
      />
      {hint && <p className="mt-1.5 text-sm text-ink/60">{hint}</p>}
    </div>
  );
}
