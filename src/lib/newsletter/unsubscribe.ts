import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/emails/layout";
import { secret } from "@/lib/auth/secret";

// The link carries the player id plus an HMAC of it, so it works without signing in
// but can't be forged to unsubscribe someone else.
const sign = (playerId: number) =>
  createHmac("sha256", secret()).update(`unsubscribe:${playerId}`).digest("base64url");

export function verifyUnsubscribe(u: unknown, t: unknown): number | null {
  const id = Number(u);
  if (!Number.isInteger(id) || id <= 0 || typeof t !== "string") return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(t);
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

const query = (playerId: number) => `u=${playerId}&t=${sign(playerId)}`;

/** The page linked from the email footer, where the student confirms. */
export const unsubscribeUrl = (playerId: number) => `${siteUrl()}/unsubscribe?${query(playerId)}`;

/**
 * Headers for Gmail/Apple Mail's built-in "Unsubscribe" button (RFC 8058 one-click):
 * the mail client POSTs to the URL directly, no page involved.
 */
export const unsubscribeHeaders = (playerId: number) => ({
  "List-Unsubscribe": `<${siteUrl()}/api/unsubscribe?${query(playerId)}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});
