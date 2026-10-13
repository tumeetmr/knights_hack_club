import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { createElement } from "react";
import { getDb } from "@/db";
import { emailCodes, players } from "@/db/schema";
import { VerifyCodeEmail } from "@/emails/verify-code";
import { sendEmail } from "@/lib/email/send";
import { RESEND_SECONDS } from "./cooldown";
import { secret } from "./secret";

const CODE_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Every account must confirm its email before playing, including ones made before codes existed. */
export const needsVerification = (p: { emailVerifiedAt: Date | null }) => !p.emailVerifiedAt;

/** Whether the student has an unexpired code waiting, so the verify page knows whether to say "we sent". */
export async function hasPendingCode(playerId: number) {
  const db = await getDb();
  const [row] = await db
    .select({ playerId: emailCodes.playerId })
    .from(emailCodes)
    .where(and(eq(emailCodes.playerId, playerId), lt(emailCodes.attempts, MAX_ATTEMPTS), gt(emailCodes.expiresAt, new Date())));
  return Boolean(row);
}

/** Seconds until the student may ask for another code, so the verify page can start its countdown. */
export async function resendWaitSeconds(playerId: number) {
  const db = await getDb();
  const [last] = await db.select({ sentAt: emailCodes.sentAt }).from(emailCodes).where(eq(emailCodes.playerId, playerId));
  const waitMs = last ? last.sentAt.getTime() + RESEND_SECONDS * 1000 - Date.now() : 0;
  return Math.max(0, Math.ceil(waitMs / 1000));
}

// Keyed to the student so a stored hash is useless for any other account.
const hashCode = (playerId: number, code: string) =>
  createHmac("sha256", secret()).update(`email-code:${playerId}:${code}`).digest("hex");

export type SendResult = { ok: true } | { ok: false; error: string };

/** Emails a fresh 6-digit code, replacing any earlier one. Rate limited per student. */
export async function sendVerificationCode(player: { id: number; name: string; email: string }): Promise<SendResult> {
  const wait = await resendWaitSeconds(player.id);
  if (wait > 0) return { ok: false, error: `Wait ${wait} seconds before asking for a new code.` };

  const db = await getDb();

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
