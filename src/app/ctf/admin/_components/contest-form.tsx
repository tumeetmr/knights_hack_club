"use client";

import { useActionState } from "react";
import { saveContestAction } from "@/lib/ctf/actions";
import type { FormState } from "@/lib/ctf/form";
import { FormMessage, input, label } from "../../_components/form-ui";
import { btnPrimary } from "./styles";

export function ContestForm({
  title,
  start,
  end,
  paused,
}: {
  title: string;
  start: string;
  end: string;
  paused: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveContestAction, {});
  const v = state.values;

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label htmlFor="title" className={label}>Contest name</label>
        <input id="title" name="title" defaultValue={v?.title ?? title} maxLength={80} className={input} />
        <p className="mt-1.5 text-sm text-ink/60">The big heading players see on the challenge board.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start" className={label}>Opens (Niagara time)</label>
          <input id="start" name="start" type="datetime-local" defaultValue={v?.start ?? start} className={input} />
          <p className="mt-1.5 text-sm text-ink/60">Leave blank to open right away. Before this, players see a countdown.</p>
        </div>
        <div>
          <label htmlFor="end" className={label}>Closes (Niagara time)</label>
          <input id="end" name="end" type="datetime-local" defaultValue={v?.end ?? end} className={input} />
          <p className="mt-1.5 text-sm text-ink/60">Leave blank to keep it open. After this, flags stop counting.</p>
        </div>
      </div>
      <label className="flex min-h-12 items-center gap-3 rounded-xl bg-mist px-4 py-3 ring-1 ring-ink/10">
        <input
          type="checkbox"
          name="paused"
          defaultChecked={v ? v.paused === "on" : paused}
          className="size-5 accent-knight-600"
        />
        <span>
          <span className="block font-medium">Close the CTF for now</span>
          <span className="block text-sm text-ink/60">An off switch that overrides the dates. Players can&apos;t see challenges or submit flags until you untick it.</span>
        </span>
      </label>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
