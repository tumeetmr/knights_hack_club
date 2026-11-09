export const card = "rounded-2xl bg-paper p-5 ring-1 ring-ink/10 sm:p-6";
const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
export const btnPrimary = `${btn} bg-ink text-white hover:bg-knight-600`;
export const btnGhost = `${btn} bg-mist text-ink ring-1 ring-ink/10 hover:bg-knight-50`;
export const btnDanger = `${btn} bg-mist text-red-700 ring-1 ring-red-700/20 hover:bg-red-50`;
export const btnSmall = "!min-h-10 !px-4 !text-sm";

/** Table building blocks shared by the list pages. */
export const tableWrap = "overflow-x-auto";
export const table = "w-full min-w-[40rem] border-collapse text-left text-sm";
export const th = "whitespace-nowrap bg-mist/70 px-4 py-2.5 font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-ink/55 first:pl-5 last:pr-5";
export const td = "border-t border-ink/10 px-4 py-3 align-middle first:pl-5 last:pr-5";
export const toolbar = "flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5";
export const badgeOk = "rounded-full bg-green-100 px-2.5 py-0.5 font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-green-900 ring-1 ring-green-700/20";
export const badgeWarn = "rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-[0.6875rem] font-bold uppercase tracking-wider text-amber-900 ring-1 ring-amber-700/20";
