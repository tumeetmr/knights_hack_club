import type { CSSProperties, ReactNode } from "react";

/** Full-bleed dark panel with a centered form card, shared by register and sign-in. */
export function AuthPanel({ eyebrow, title, children, footer }: { eyebrow: string; title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <section className="relative flex min-h-[calc(100svh-1.5rem)] flex-1 flex-col items-center justify-center overflow-clip rounded-[2rem] bg-ink px-5 pb-10 pt-28 text-white sm:min-h-[calc(100svh-2rem)] lg:rounded-[2.5rem]">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="absolute -right-32 -top-32 size-[360px] glow sm:size-[560px]" aria-hidden />
      <div className="absolute -bottom-40 -left-32 size-[320px] glow [--glow:rgb(37_99_184_/_0.3)] sm:size-[480px]" aria-hidden />

      <div className="relative w-full max-w-md">
        <p className="rise caret text-center font-mono text-xs text-knight-300 sm:text-sm">{eyebrow}</p>
        <h1 className="headline rise mt-4 text-center text-[clamp(3.5rem,14vw,6.5rem)]" style={{ "--d": "100ms" } as CSSProperties}>
          {title}
        </h1>
        <div className="rise mt-8 rounded-3xl bg-paper p-5 text-ink shadow-2xl shadow-black/30 sm:p-7" style={{ "--d": "250ms" } as CSSProperties}>
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-white/60">{footer}</p>
      </div>
    </section>
  );
}

export const fieldLabel = "mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-ink/60";
// text-base keeps iOS from zooming into inputs on focus.
export const fieldInput =
  "block w-full rounded-xl bg-mist px-4 py-3.5 text-base ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-knight-500";
export const submitBtn =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 font-bold text-white transition hover:bg-knight-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function Notice({ error, ok }: { error?: string; ok?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-700/20">
        {error}
      </p>
    );
  }
  if (ok) {
    return (
      <p role="status" className="rounded-xl bg-knight-50 px-4 py-3 text-sm font-medium text-knight-900 ring-1 ring-knight-500/30">
        {ok}
      </p>
    );
  }
  return null;
}
