import type { FormState } from "@/lib/ctf/actions";

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
