"use client";

import { useActionState, useState } from "react";
import { saveChallengeAction } from "@/lib/ctf/actions";
import type { FormState } from "@/lib/ctf/form";
import { generateFlag } from "@/lib/ctf/flag";
import { FormMessage, input, label } from "../../_components/form-ui";
import { btnGhost, btnPrimary, btnSmall } from "./styles";

type Initial = {
  id?: number;
  title?: string;
  category?: string;
  points?: number;
  description?: string;
  hint?: string;
  url?: string;
  location?: string;
  flag?: string;
  published?: boolean;
};

const POINT_PRESETS = [50, 100, 200, 300, 500];

export function ChallengeForm({
  initial = {},
  categories,
}: {
  initial?: Initial;
  categories: string[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveChallengeAction, {});
  const v = state.values;
  const editing = Boolean(initial.id);

  const [points, setPoints] = useState(String(v?.points ?? initial.points ?? 100));
  const [flag, setFlag] = useState(v?.flag ?? initial.flag ?? "");

  return (
    <form action={action} className="grid gap-5">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input
          id="title"
          name="title"
          required
          maxLength={80}
          defaultValue={v?.title ?? initial.title}
          placeholder="View the source"
          className={input}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={label}>Category</label>
          <input
            id="category"
            name="category"
            list="categories"
            maxLength={30}
            defaultValue={v?.category ?? initial.category}
            placeholder="Web"
            className={input}
          />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="points" className={label}>Points</label>
          <input
            id="points"
            name="points"
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className={input}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {POINT_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPoints(String(p))}
                className={`min-h-9 rounded-full px-3.5 font-mono text-xs font-medium ring-1 transition ${
                  points === String(p) ? "bg-ink text-white ring-ink" : "bg-mist ring-ink/10 hover:bg-knight-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={label}>What students see</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={v?.description ?? initial.description}
          placeholder="Something's hiding on our homepage. Can you find it?"
          className={input}
        />
        <p className="mt-1.5 text-sm text-ink/60">
          Put a line in backticks, like <span className="font-mono">`SGVsbG8=`</span>, to give students a tap-to-copy box.
        </p>
      </div>

      <div>
        <label htmlFor="hint" className={label}>Hint (optional)</label>
        <input
          id="hint"
          name="hint"
          maxLength={500}
          defaultValue={v?.hint ?? initial.hint}
          placeholder="Developers can see more than visitors do."
          className={input}
        />
      </div>

      <div>
        <label htmlFor="url" className={label}>Where to look (optional)</label>
        <input
          id="url"
          name="url"
          maxLength={300}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          defaultValue={v?.url ?? initial.url}
          placeholder="/ctf-lab/look-closer.html"
          className={input}
        />
        <p className="mt-1.5 text-sm text-ink/60">
          Students get an &ldquo;Open the page&rdquo; button on the challenge. Use a path like <span className="font-mono">/about</span> or a full <span className="font-mono">https://</span> link.
        </p>
      </div>

      <div>
        <label htmlFor="flag" className={label}>Flag</label>
        <div className="flex gap-2">
          <input
            id="flag"
            name="flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={editing ? "KH{...}" : "Leave blank to auto-generate"}
            className={`${input} font-mono`}
          />
          <button type="button" onClick={() => setFlag(generateFlag())} className={`${btnGhost} ${btnSmall} !min-h-12 shrink-0`}>
            Generate
          </button>
        </div>
        <p className="mt-1.5 text-sm text-ink/60">
          Must look like <span className="font-mono">KH&#123;something&#125;</span>. Only admins can see this.
        </p>
      </div>

      <div>
        <label htmlFor="location" className={label}>Where it&apos;s hidden (admin note)</label>
        <input
          id="location"
          name="location"
          maxLength={500}
          defaultValue={v?.location ?? initial.location}
          placeholder="HTML comment in the footer of /about"
          className={input}
        />
        <p className="mt-1.5 text-sm text-ink/60">A reminder for you. Students never see it.</p>
      </div>

      <label className="flex min-h-12 items-center gap-3 rounded-xl bg-mist px-4 ring-1 ring-ink/10">
        <input
          type="checkbox"
          name="published"
          defaultChecked={v ? v.published === "on" : (initial.published ?? false)}
          className="size-5 accent-knight-600"
        />
        <span>
          <span className="block font-medium">Published</span>
          <span className="block text-sm text-ink/60">Drafts stay hidden from students.</span>
        </span>
      </label>

      <FormMessage state={state} />

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving…" : editing ? "Save changes" : "Add challenge"}
        </button>
        {!editing && (
          <button type="submit" name="intent" value="another" disabled={pending} className={btnGhost}>
            Add &amp; start another
          </button>
        )}
      </div>
    </form>
  );
}
