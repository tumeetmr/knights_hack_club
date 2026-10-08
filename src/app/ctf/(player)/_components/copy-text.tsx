"use client";

import { useState } from "react";

/** Writes to the clipboard, falling back to a hidden textarea for older or non-secure browsers. */
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0";
    document.body.append(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}

/** A tap-to-copy block for strings students need to paste into a decoder or an address bar. */
export function CopyText({ text, label = "Tap to copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        if (await copy(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }
      }}
      className="group flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3.5 text-left text-white transition active:scale-[0.99]"
    >
      <span className="min-w-0 break-all font-mono text-base leading-snug">{text}</span>
      <span
        aria-live="polite"
        className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[0.6875rem] font-bold uppercase tracking-wider ${
          done ? "bg-green-400 text-ink" : "bg-white/15 text-white/80 group-hover:bg-white/25"
        }`}
      >
        {done ? "Copied ✓" : label}
      </span>
    </button>
  );
}
