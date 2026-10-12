"use client";

import { useEffect, useState, useTransition } from "react";
import { FormMessage, input, label } from "@/components/form-ui";
import type { NewsletterContent, NewsletterItem } from "@/lib/newsletter/content";
import {
  type NewsletterResult,
  previewNewsletterAction,
  sendNewsletterAction,
  sendTestNewsletterAction,
} from "@/lib/newsletter/actions";
import { btnGhost, btnPrimary, btnSmall, card } from "../_components/styles";

const emptyItem: NewsletterItem = { tag: "", title: "", body: "", href: "", cta: "" };

export function NewsletterForm({ initial, recipients }: { initial: NewsletterContent; recipients: number }) {
  const [content, setContent] = useState(initial);
  const [preview, setPreview] = useState<{ html?: string; error?: string }>({});
  const [testTo, setTestTo] = useState("");
  const [result, setResult] = useState<NewsletterResult>({});
  const [pending, startTransition] = useTransition();

  // Re-render the preview shortly after typing stops.
  useEffect(() => {
    const timer = setTimeout(() => {
      previewNewsletterAction(content).then(setPreview, () => setPreview({ error: "Preview failed to load." }));
    }, 500);
    return () => clearTimeout(timer);
  }, [content]);

  const set = <K extends keyof NewsletterContent>(key: K, value: NewsletterContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  const sendTest = () =>
    startTransition(async () => setResult(await sendTestNewsletterAction(content, testTo)));

  const sendAll = () => {
    const ok = window.confirm(
      `Send "${content.subject}" to ${recipients} member${recipients === 1 ? "" : "s"}? This can't be undone.`,
    );
    if (ok) startTransition(async () => setResult(await sendNewsletterAction(content, recipients)));
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="grid gap-5">
        <section className={`${card} grid gap-4`}>
          <Field id="subject" title="Subject line" value={content.subject} max={120} onChange={(v) => set("subject", v)} />
          <Field
            id="issue"
            title="Issue name"
            hint="Shown at the top of the email, e.g. October 2026."
            value={content.issue}
            max={40}
            onChange={(v) => set("issue", v)}
          />
          <div>
            <label htmlFor="intro" className={label}>Intro</label>
            <textarea
              id="intro"
              rows={4}
              maxLength={1000}
              value={content.intro}
              onChange={(e) => set("intro", e.target.value)}
              className={input}
            />
            <p className="mt-1.5 text-sm text-ink/60">Comes right after &ldquo;Hi [first name],&rdquo;.</p>
          </div>
        </section>

        <ItemList
          title="Happening now"
          hint="What's live or just happened: recaps, new CTF challenges, games."
          items={content.now}
          onChange={(v) => set("now", v)}
        />
        <ItemList
          title="Dropping soon"
          hint="Announcements that aren't events: sign-ups opening, new features, prizes. Optional."
          items={content.soon}
          onChange={(v) => set("soon", v)}
        />

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
          <button type="button" onClick={sendAll} disabled={pending || recipients === 0} className={btnPrimary}>
            {pending ? "Sending…" : `Send to ${recipients} member${recipients === 1 ? "" : "s"}`}
          </button>
          <p className="text-sm text-ink/60">
            Goes to students with a verified email who haven&apos;t unsubscribed. Each email has its own unsubscribe link.
          </p>
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

function ItemList({
  title,
  hint,
  items,
  onChange,
}: {
  title: string;
  hint: string;
  items: NewsletterItem[];
  onChange: (items: NewsletterItem[]) => void;
}) {
  const update = (i: number, patch: Partial<NewsletterItem>) =>
    onChange(items.map((item, j) => (j === i ? { ...item, ...patch } : item)));
  const move = (i: number, by: number) => {
    const next = [...items];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };
  const slug = title.toLowerCase().replace(/\W+/g, "-");

  return (
    <section className={card}>
      <h2 className="headline text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-ink/60">{hint}</p>

      <ol className="mt-4 grid gap-4">
        {items.map((item, i) => (
          <li key={i} className="grid gap-3 rounded-xl bg-mist/60 p-4 ring-1 ring-ink/10">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-ink/50">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={`${btnGhost} ${btnSmall}`} aria-label="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={`${btnGhost} ${btnSmall}`} aria-label="Move down">↓</button>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className={`${btnGhost} ${btnSmall}`}>Remove</button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
              <Field id={`${slug}-${i}-tag`} title="Tag" placeholder="CTF · Live" value={item.tag} max={30} onChange={(v) => update(i, { tag: v })} />
              <Field id={`${slug}-${i}-title`} title="Title" value={item.title} max={100} onChange={(v) => update(i, { title: v })} />
            </div>
            <div>
              <label htmlFor={`${slug}-${i}-body`} className={label}>Description</label>
              <textarea
                id={`${slug}-${i}-body`}
                rows={3}
                maxLength={500}
                value={item.body}
                onChange={(e) => update(i, { body: e.target.value })}
                className={input}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
              <Field id={`${slug}-${i}-href`} title="Link (optional)" placeholder="/ctf or https://…" value={item.href ?? ""} max={300} onChange={(v) => update(i, { href: v })} />
              <Field id={`${slug}-${i}-cta`} title="Link text" placeholder="Check it out" value={item.cta ?? ""} max={40} onChange={(v) => update(i, { cta: v })} />
            </div>
          </li>
        ))}
      </ol>

      {items.length < 8 && (
        <button type="button" onClick={() => onChange([...items, emptyItem])} className={`${btnGhost} ${btnSmall} mt-4`}>
          + Add item
        </button>
      )}
    </section>
  );
}
