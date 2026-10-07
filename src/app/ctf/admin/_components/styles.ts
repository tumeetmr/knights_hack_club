export const card = "rounded-2xl bg-paper p-5 ring-1 ring-ink/10 sm:p-6";
export const label = "mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-ink/60";
// text-base keeps iOS from zooming into inputs on focus.
export const input =
  "block w-full rounded-xl bg-mist px-4 py-3.5 text-base ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-knight-500";
const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
export const btnPrimary = `${btn} bg-ink text-white hover:bg-knight-600`;
export const btnGhost = `${btn} bg-mist text-ink ring-1 ring-ink/10 hover:bg-knight-50`;
export const btnDanger = `${btn} bg-mist text-red-700 ring-1 ring-red-700/20 hover:bg-red-50`;
export const btnSmall = "!min-h-10 !px-4 !text-sm";
