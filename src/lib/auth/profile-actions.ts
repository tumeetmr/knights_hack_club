"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import type { FormState } from "@/lib/form";
import { tooMany } from "@/lib/rate-limit";
import { hashPassword, verifyPassword } from "./password";
import { createStudentSession, requireStudent } from "./session";

const nameSchema = z.string().trim().min(2, "Enter your name (2 characters or more)").max(40, "Name is too long (40 characters max)");
const passwordSchema = z.string().min(8, "New password needs at least 8 characters").max(100, "Password is too long (100 characters max)");

export async function updateNameAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const student = await requireStudent("/profile");
  const values = { name: String(fd.get("name") ?? "") };
  const parsed = nameSchema.safeParse(values.name);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  if (parsed.data === student.name) return { values: { name: parsed.data } };

  const db = await getDb();
  await db.update(players).set({ name: parsed.data }).where(eq(players.id, student.id));
  // The name shows on the leaderboard, solver lists and the Pixel Wall too.
  revalidatePath("/", "layout");
  return { ok: "Name updated.", values: { name: parsed.data } };
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const student = await requireStudent("/profile");
  // Same budget as sign-in, so this can't be used to guess the current password faster.
  if (tooMany(`password-change:${student.id}`, 10, 600_000)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const current = String(fd.get("current") ?? "");
  const parsed = passwordSchema.safeParse(String(fd.get("password") ?? ""));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data !== String(fd.get("confirm") ?? "")) return { error: "The new passwords don't match." };

  const db = await getDb();
  const [row] = await db.select({ passwordHash: players.passwordHash }).from(players).where(eq(players.id, student.id));
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { error: "Your current password isn't right." };

  // Signs out every other device; this one gets a fresh session.
  await db
    .update(players)
    .set({ passwordHash: await hashPassword(parsed.data), passwordChangedAt: new Date() })
    .where(eq(players.id, student.id));
  await createStudentSession(student.id);
  return { ok: "Password changed. Other devices have been signed out." };
}
