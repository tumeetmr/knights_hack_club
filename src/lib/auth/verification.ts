import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { createElement } from "react";
import { getDb } from "@/db";
import { emailCodes, players } from "@/db/schema";
import { VerifyCodeEmail } from "@/emails/verify-code";
import { sendEmail } from "@/lib/email/send";
import { secret } from "./secret";

/**
 * Accounts created from this moment on must confirm their email before playing. Older
 * accounts keep working unverified; move this date back (or drop the check) to require
 * it from everyone.
 */
export const VERIFY_REQUIRED_SINCE = new Date("2026-10-08T21:20:00Z");

const CODE_MINUTES = 10;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;

export const needsVerification = (p: { emailVerifiedAt: Date | null; createdAt: Date }) =>
  !p.emailVerifiedAt && p.createdAt >= VERIFY_REQUIRED_SINCE;

// Keyed to the student so a stored hash is useless for any other account.
const hashCode = (playerId: number, code: string) =>
  createHmac("sha256", secret()).update(`email-code:${playerId}:${code}`).digest("hex");

export type SendResult = { ok: true } | { ok: false; error: string };

/** Emails a fresh 6-digit code, replacing any earlier one. Rate limited per student. */
export async function sendVerificationCode(player: { id: number; name: string; email: string }): Promise<SendResult> {
  const db = await getDb();
  const [last] = await db.select({ sentAt: emailCodes.sentAt }).from(emailCodes).where(eq(emailCodes.playerId, player.id));
  const waitMs = last ? last.sentAt.getTime() + RESEND_SECONDS * 1000 - Date.now() : 0;
  if (waitMs > 0) return { ok: false, error: `Wait ${Math.ceil(waitMs / 1000)} seconds before asking for a new code.` };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const row = {
    codeHash: hashCode(player.id, code),
    attempts: 0,
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + CODE_MINUTES * 60_000),
  };
  await db.insert(emailCodes).values({ playerId: player.id, ...row }).onConflictDoUpdate({ target: emailCodes.playerId, set: row });

  try {
    await sendEmail({
      to: player.email,
      subject: `${code} is your Knights Hack code`,
      body: createElement(VerifyCodeEmail, { name: player.name, code, minutes: CODE_MINUTES }),
    });
    return { ok: true };
  } catch (err) {
    console.error("[verify] sending code failed", err);
    // Drop the unsent code so the cooldown doesn't block an immediate retry.
    await db.delete(emailCodes).where(eq(emailCodes.playerId, player.id));
    return { ok: false, error: "We couldn't send the email. Try again in a moment." };
  }
}

/** Checks a code and marks the email verified. Each guess uses up an attempt before comparing. */
export async function checkVerificationCode(playerId: number, code: string): Promise<SendResult> {
  const db = await getDb();
  // Counting first, in one statement, stops parallel requests from getting extra guesses.
  const [row] = await db
    .update(emailCodes)
    .set({ attempts: sql`${emailCodes.attempts} + 1` })
    .where(and(eq(emailCodes.playerId, playerId), lt(emailCodes.attempts, MAX_ATTEMPTS), gt(emailCodes.expiresAt, new Date())))
    .returning({ codeHash: emailCodes.codeHash, attempts: emailCodes.attempts });
  if (!row) return { ok: false, error: "That code has expired or had too many tries. Send a new one." };

  const expected = Buffer.from(row.codeHash, "hex");
  const actual = Buffer.from(hashCode(playerId, code), "hex");
  if (!timingSafeEqual(expected, actual)) {
    const left = MAX_ATTEMPTS - row.attempts;
    return {
      ok: false,
      error: left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "That code isn't right. Send a new one.",
    };
  }

  await db.update(players).set({ emailVerifiedAt: new Date() }).where(eq(players.id, playerId));
  await db.delete(emailCodes).where(eq(emailCodes.playerId, playerId));
  return { ok: true };
}
