import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { createElement } from "react";
import { getDb } from "@/db";
import { passwordResets, players } from "@/db/schema";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { siteUrl } from "@/emails/layout";
import { sendEmail } from "@/lib/email/send";
import { hashPassword } from "./password";

const LINK_MINUTES = 30;
const RESEND_SECONDS = 60;

// 32 random bytes as base64url is always 43 characters.
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

// The token is 256 random bits, so a plain SHA-256 is enough; no salt or slow hash needed.
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Emails a reset link if the address belongs to an account; does nothing otherwise, so the
 * caller can't tell which. Asking again replaces the old link, at most once a minute.
 */
export async function sendPasswordReset(email: string) {
  const db = await getDb();
  const [player] = await db
    .select({ id: players.id, name: players.name, email: players.email })
    .from(players)
    .where(eq(players.email, email));
  if (!player) return;

  const [last] = await db.select({ sentAt: passwordResets.sentAt }).from(passwordResets).where(eq(passwordResets.playerId, player.id));
  if (last && Date.now() - last.sentAt.getTime() < RESEND_SECONDS * 1000) return;

  const token = randomBytes(32).toString("base64url");
  const row = { tokenHash: hashToken(token), sentAt: new Date(), expiresAt: new Date(Date.now() + LINK_MINUTES * 60_000) };
  await db.insert(passwordResets).values({ playerId: player.id, ...row }).onConflictDoUpdate({ target: passwordResets.playerId, set: row });

  // Built from SITE_URL, never the request's Host header, so a forged host can't redirect the link.
  const url = `${siteUrl()}/reset-password?token=${token}`;
  try {
    await sendEmail({
      to: player.email,
      subject: "Reset your Knights Hack password",
      body: createElement(ResetPasswordEmail, { name: player.name, url, minutes: LINK_MINUTES }),
    });
  } catch (err) {
    console.error("[reset] sending link failed", err);
    // Drop the unsent link so the cooldown doesn't block an immediate retry.
    await db.delete(passwordResets).where(eq(passwordResets.playerId, player.id));
  }
}

/** Whether a link is still usable, without using it up (mail scanners open links too). */
export async function isResetTokenValid(token: string) {
  if (!TOKEN_FORMAT.test(token)) return false;
  const db = await getDb();
  const [row] = await db
    .select({ playerId: passwordResets.playerId })
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, hashToken(token)), gt(passwordResets.expiresAt, new Date())));
  return Boolean(row);
}

/**
 * Uses up the link and sets the new password. Returns the student's id, or null if the link is
 * invalid, expired or already used. Following the link proves they own the email, so it also
 * counts as verifying it. Every existing session is signed out (see getSession).
 */
export async function resetPassword(token: string, password: string) {
  if (!TOKEN_FORMAT.test(token)) return null;
  const passwordHash = await hashPassword(password);
  const db = await getDb();
  // Deleting and reading in one statement means two submits at once can't both use the link.
  const [used] = await db
    .delete(passwordResets)
    .where(and(eq(passwordResets.tokenHash, hashToken(token)), gt(passwordResets.expiresAt, new Date())))
    .returning({ playerId: passwordResets.playerId });
  if (!used) return null;

  await db
    .update(players)
    .set({
      passwordHash,
      passwordChangedAt: new Date(),
      emailVerifiedAt: sql`coalesce(${players.emailVerifiedAt}, now())`,
    })
    .where(eq(players.id, used.playerId));
  return used.playerId;
}
