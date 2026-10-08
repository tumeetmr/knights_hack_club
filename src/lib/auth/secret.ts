import "server-only";

/** Signing key for every session cookie (students and CTF admin). */
export const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(value);
};
