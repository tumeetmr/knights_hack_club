"use client";

import { useActionState, useRef, useState } from "react";
import { submitFlagAction, type SubmitState } from "@/lib/ctf/player-actions";

export function FlagForm({ id, solved, canSubmit, points }: { id: number; solved: boolean; canSubmit: boolean; points: number }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitFlagAction, {});
  const [value, setValue] = useState("");
  const [pasteNote, setPasteNote] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const done = solved || Boolean(state.ok);

  if (done) {
    return (
      <div role="status" className="rounded-2xl bg-knight-600 px-5 py-4 text-white">
        <p className="text-lg font-bold">🎉 {state.ok ?? "You solved this one!"}</p>
        <p className="mt-1 text-sm text-white/75">It&apos;s worth {points} points right now.</p>
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <p role="status" className="rounded-2xl bg-mist px-5 py-4 text-ink/70 ring-1 ring-ink/10">
        This CTF is over, so flags can&apos;t be submitted anymore. You can still read the challenge and try it for fun.
      </p>
    );
  }

  async function paste() {
    setPasteNote("");
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) setValue(text);
      else setPasteNote("Your clipboard is empty. Copy the flag first.");
    } catch {
      // Some phone browsers block silent clipboard reads: fall back to the native paste menu.
      input.current?.focus();
      setPasteNote("Press and hold in the box, then tap Paste.");
    }
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <p className="mb-3 text-ink/70">
        Paste the flag you found. It looks like <span className="font-mono font-bold text-ink">KH{"{...}"}</span>.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="flag" className="sr-only">Flag</label>
        <div className="relative min-w-0 flex-1">
          <input
            ref={input}
            id="flag"
            name="flag"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder="KH{...}"
            className="w-full rounded-full bg-mist py-3.5 pl-5 pr-24 font-mono text-base text-ink ring-1 ring-ink/15 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-knight-500"
          />
          <button
            type="button"
            onClick={paste}
            className="absolute right-1.5 top-1/2 min-h-10 -translate-y-1/2 rounded-full bg-ink/10 px-4 text-sm font-bold text-ink transition hover:bg-ink/15 active:scale-95"
          >
            Paste
          </button>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-full bg-ink px-7 font-bold text-white transition hover:bg-knight-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Checking…" : "Submit"}
        </button>
      </div>
      {pasteNote && <p role="status" className="mt-3 text-sm text-ink/60">{pasteNote}</p>}
      {state.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
