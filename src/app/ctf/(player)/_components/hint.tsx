"use client";

import { useState } from "react";

export function Hint({ text }: { text: string }) {
  const [shown, setShown] = useState(false);
  return shown ? (
    <p className="rounded-xl bg-knight-50 px-4 py-3 text-sm text-ink/80 ring-1 ring-ink/10">
      <span className="font-mono text-xs uppercase tracking-wider text-knight-600">Hint · </span>
      {text}
    </p>
  ) : (
    <button type="button" onClick={() => setShown(true)} className="text-sm font-medium text-knight-600 underline underline-offset-4 hover:text-ink">
      Show hint
    </button>
  );
}
