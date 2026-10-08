/** Where to send a student after sign-in: a path on this site (never admin), never an open redirect. */
export function safeNext(value: unknown) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("/ctf/admin") && !/[\\]|\/\//.test(path) ? path : "/";
}

const withNext = (base: string, next: string) => (next === "/" ? base : `${base}?next=${encodeURIComponent(next)}`);

export const loginHref = (next = "/") => withNext("/login", next);
export const registerHref = (next = "/") => withNext("/register", next);
