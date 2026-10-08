/** State shape shared by every form that uses useActionState. */
export type FormState = {
  error?: string;
  ok?: string;
  /** Submitted values, handed back so the form doesn't reset on an error. */
  values?: Record<string, string>;
};

export const rawValues = (fd: FormData) =>
  Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

/** A positive integer id from form data, or null. */
export function toId(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
