"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import { rawValues, type FormState } from "@/lib/form";
import { clearAttempts, clientIp, tooMany } from "@/lib/rate-limit";
import { loginHref, safeNext } from "./next";
import { hashPassword, verifyPassword } from "./password";
import { createStudentSession, deleteStudentSession } from "./session";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name (2 characters or more)").max(40, "Name is too long (40 characters max)"),
  email: z.string().trim().toLowerCase().max(120, "Email is too long").pipe(z.email("Enter a valid email address")),
  password: z.string().min(8, "Password needs at least 8 characters").max(100, "Password is too long (100 characters max)"),
});

export async function registerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = rawValues(fd);
  const safe = { name: values.name ?? "", email: values.email ?? "" };

  // A whole room on campus Wi-Fi shares one IP, so this only stops scripted sign-up floods.
  if (tooMany(`register:${await clientIp()}`, 150, 3_600_000)) {
    return { error: "Too many sign-ups from this network. Try again later.", values: safe };
  }
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: safe };

  const db = await getDb();
  const [created] = await db
    .insert(players)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    })
    .onConflictDoNothing()
    .returning({ id: players.id });
  if (!created) return { error: "That email is already registered. Sign in instead.", values: safe };

  await createStudentSession(created.id);
  redirect(safeNext(fd.get("next")));
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  // Brute-force guard is per account, from any network: 10 tries per email per 10 minutes.
  // The per-IP cap is high enough for a shared campus IP but stops one machine spraying many accounts.
  const accountKey = `login:${email}`;
  const tooManyForAccount = tooMany(accountKey, 10, 600_000);
  const tooManyForIp = tooMany(`login-ip:${await clientIp()}`, 150, 600_000);
  if (tooManyForAccount || tooManyForIp) {
    return { error: "Too many attempts. Try again in a few minutes.", values: { email } };
  }

  const db = await getDb();
  const [row] = await db.select().from(players).where(eq(players.email, email));
  // Hash even for unknown emails so response time doesn't reveal who's registered.
  const ok = await verifyPassword(password, row?.passwordHash ?? "00:00");
  if (!row || !ok) return { error: "Wrong email or password.", values: { email } };

  clearAttempts(accountKey);
  await createStudentSession(row.id);
  redirect(safeNext(fd.get("next")));
}

/** Signs out, then shows the sign-in page that leads back to `next` (the page the student was on). */
export async function logoutAction(fd: FormData) {
  await deleteStudentSession();
  redirect(loginHref(safeNext(fd.get("next"))));
}
