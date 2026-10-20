"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FormMessage, input, label } from "@/components/form-ui";
import {
  type AvailabilityContent,
  type Recipient,
  previewAvailabilityAction,
  sendAvailabilityAction,
  sendTestAvailabilityAction,
} from "@/lib/newsletter/availability-actions";
import { NAME_TOKEN } from "@/lib/newsletter/availability-shared";
import { btnGhost, btnPrimary, card } from "../_components/styles";

const initial: AvailabilityContent = {
  subject: "Next event update + quick availability form",
  formUrl: "",
  deadline: "",
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const withName = (html: string, name: string) => html.replaceAll(NAME_TOKEN, escapeHtml(name));

export function AvailabilityForm() {
  const [content, setContent] = useState(initial);
  const [list, setList] = useState("");
  const [preview, setPreview] = useState<{ html?: string; error?: string; recipients: Recipient[]; invalid: string[] }>({
    recipients: [],
    invalid: [],
  });
  const [testTo, setTestTo] = useState("");
  const [testedKey, setTestedKey] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok?: string; error?: string }>({});
  const [pending, startTransition] = useTransition();

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
  const previewHtml = useMemo(() => (html ? withName(html, "Axel") : ""), [html]);

  // A test only counts for the exact content it was sent with; editing anything asks for a new one.
  const contentKey = JSON.stringify(content);
  const tested = testedKey === contentKey;
  const canSend = tested && recipients.length > 0 && !preview.error && !pending;

  const sendTest = () =>
    startTransition(async () => {
      const r = await sendTestAvailabilityAction(content, testTo);
      setResult(r);
      if (r.ok) setTestedKey(contentKey);
    });

  const sendAll = () => {
    const n = recipients.length;
    if (!window.confirm(`Send this email to ${n} ${n === 1 ? "person" : "people"}? This can't be undone.`)) return;
    startTransition(async () => setResult(await sendAvailabilityAction(content, list, n)));
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
          <p className={label}>Send</p>
          <p className="text-sm text-ink/60">
            Emails go out from the club address, one per person. Send yourself a test first; sending to everyone
            unlocks once the test has gone out with the current content.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@ncstudents.niagaracollege.ca"
              aria-label="Test email address"
              className={`${input} min-w-0 flex-1`}
            />
            <button type="button" onClick={sendTest} disabled={pending || !testTo || !html} className={btnGhost}>
              Send test
            </button>
          </div>
          {preview.error && <FormMessage state={{ error: preview.error }} />}
          {result.error && <FormMessage state={{ error: result.error }} />}
          {result.ok && <FormMessage state={{ ok: result.ok }} />}
          <button type="button" onClick={sendAll} disabled={!canSend} className={btnPrimary}>
            {recipients.length === 0
              ? "Paste your member list"
              : tested
                ? `Send to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}`
                : "Send a test first"}
          </button>
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
