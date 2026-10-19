"use client";

import { useEffect, useState, useTransition } from "react";
import { FormMessage, input, label } from "@/components/form-ui";
import {
  type AvailabilityContent,
  type AvailabilityResult,
  previewAvailabilityAction,
  sendAvailabilityAction,
  sendTestAvailabilityAction,
} from "@/lib/newsletter/availability-actions";
import { btnGhost, btnPrimary, card } from "../_components/styles";

const initial: AvailabilityContent = {
  subject: "Next event update + quick availability form",
  formUrl: "",
  deadline: "",
};

export function AvailabilityForm() {
  const [content, setContent] = useState(initial);
  const [list, setList] = useState("");
  const [preview, setPreview] = useState<{ html?: string; error?: string; count: number; invalid: string[] }>({
    count: 0,
    invalid: [],
  });
  const [testTo, setTestTo] = useState("");
  const [result, setResult] = useState<AvailabilityResult>({});
  const [pending, startTransition] = useTransition();

  // Re-render the preview and recount the list shortly after typing stops.
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

  const { count, invalid } = preview;
  const people = `${count} ${count === 1 ? "person" : "people"}`;

  const sendTest = () => startTransition(async () => setResult(await sendTestAvailabilityAction(content, testTo)));

  const sendAll = () => {
    if (window.confirm(`Send "${content.subject}" to ${people}? This can't be undone.`)) {
      startTransition(async () => setResult(await sendAvailabilityAction(content, list, count)));
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
            rows={10}
            value={list}
            onChange={(e) => setList(e.target.value)}
            placeholder={"one per line, or paste a column from a spreadsheet\nAxel Smith, axel@ncstudents.niagaracollege.ca\njamie@ncstudents.niagaracollege.ca"}
            className={`${input} font-mono text-sm`}
          />
          <p className="text-sm text-ink/60">
            <strong>{people}</strong> after removing duplicates. Add a name before the email
            (<code>Name, email</code>) to greet them by first name; otherwise it says &ldquo;Hi there&rdquo;.
          </p>
          {invalid.length > 0 && (
            <p className="text-sm text-red-700">
              {invalid.length} invalid: {invalid.slice(0, 5).join(", ")}
              {invalid.length > 5 && "…"}
            </p>
          )}
        </section>

        <section className={`${card} grid gap-4`}>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor="test-to" className={label}>Send a test to</label>
              <input
                id="test-to"
                type="email"
                placeholder="you@ncstudents.niagaracollege.ca"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className={input}
              />
            </div>
            <button type="button" onClick={sendTest} disabled={pending || !testTo} className={btnGhost}>
              Send test
            </button>
          </div>
          <FormMessage state={result} />
          <button
            type="button"
            onClick={sendAll}
            disabled={pending || count === 0 || invalid.length > 0 || !!preview.error}
            className={btnPrimary}
          >
            {pending ? "Sending…" : `Send to ${people}`}
          </button>
        </section>
      </div>

      <section className="lg:sticky lg:top-36">
        <p className={label}>Preview</p>
        {preview.error && <FormMessage state={{ error: preview.error }} />}
        <iframe
          title="Email preview"
          srcDoc={preview.html ?? ""}
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
