import type { FormState } from "@/lib/form";

// Shared by the player and admin forms.
export const label = "mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-ink/60";
// text-base keeps iOS from zooming into inputs on focus.
export const input =
  "block w-full rounded-xl bg-mist px-4 py-3.5 text-base ring-1 ring-ink/10 placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-knight-500";

export function FormMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-700/20">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="rounded-xl bg-knight-50 px-4 py-3 text-sm font-medium text-knight-900 ring-1 ring-knight-500/30">
        {state.ok}
      </p>
    );
  }
  return null;
}
