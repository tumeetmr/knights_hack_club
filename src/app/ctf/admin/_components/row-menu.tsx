"use client";

import { useEffect, useRef, useState } from "react";
import { deleteChallengeAction, duplicateChallengeAction, moveChallengeAction } from "@/lib/ctf/actions";

const item =
  "flex min-h-11 w-full items-center px-4 text-left text-sm font-medium transition hover:bg-mist disabled:pointer-events-none disabled:opacity-40";

/** The "⋯" menu on a challenge row: reorder, duplicate and delete. */
export function RowMenu({ id, title, first, last }: { id: number; title: string; first: boolean; last: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`More actions for ${title}`}
        className="grid size-10 place-items-center rounded-full text-lg font-bold text-ink/60 transition hover:bg-mist hover:text-ink"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-2xl bg-paper py-1.5 shadow-xl shadow-ink/10 ring-1 ring-ink/10">
          <form action={moveChallengeAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="dir" value="up" />
            <button type="submit" disabled={first} className={item}>↑ Move up</button>
          </form>
          <form action={moveChallengeAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="dir" value="down" />
            <button type="submit" disabled={last} className={item}>↓ Move down</button>
          </form>
          <form action={duplicateChallengeAction}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={item}>Duplicate</button>
          </form>
          <div className="my-1.5 border-t border-ink/10" />
          <form
            action={deleteChallengeAction}
            onSubmit={(e) => {
              if (!window.confirm(`Delete “${title}”? Its solves and points are removed too. This can't be undone.`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={`${item} text-red-700 hover:bg-red-50`}>Delete…</button>
          </form>
        </div>
      )}
    </div>
  );
}
