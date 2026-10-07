"use client";

import { useState } from "react";

export function Hint({ text }: { text: string }) {
  const [shown, setShown] = useState(false);
  return shown ? (
    <p role="status" className="max-w-xl rounded-2xl bg-knight-50 px-4 py-3.5 text-base leading-relaxed text-ink/85 ring-1 ring-knight-500/30">
      <span className="block font-mono text-xs font-bold uppercase tracking-wider text-knight-600">💡 Hint</span>
      {text}
    </p>
  ) : (
    <div className="grid max-w-xl justify-items-start gap-2">
      <button
        type="button"
        onClick={() => setShown(true)}
        className="min-h-12 rounded-full bg-mist px-6 font-bold text-ink ring-1 ring-ink/15 transition hover:bg-knight-50 active:scale-[0.98]"
      >
        Show me a hint
      </button>
      <p className="text-sm text-ink/60">Totally fine to use it. Hints don&apos;t cost any points.</p>
    </div>
  );
}
