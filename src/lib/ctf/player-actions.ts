"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { challenges, players, solves } from "@/db/schema";
import { contestStatus } from "./contest";
import { rawValues, toId, type FormState } from "./form";
import { hashPassword, verifyPassword } from "./password";
import { createPlayerSession, deletePlayerSession, requirePlayer } from "./player-session";
import { getContest } from "./queries";
import { clearAttempts, clientIp, tooMany } from "./rate-limit";

// --- Register / sign in / out ----------------------------------------------

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

  await createPlayerSession(created.id);
  redirect("/ctf");
}

export async function loginPlayerAction(_prev: FormState, fd: FormData): Promise<FormState> {
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
  await createPlayerSession(row.id);
  redirect("/ctf");
}

export async function logoutPlayerAction() {
  await deletePlayerSession();
  redirect("/ctf/login");
}

// --- Flag submission ---------------------------------------------------------

export type SubmitState = {
  /** Which challenge this result belongs to, so only its card shows it. */
  id?: number;
  error?: string;
  ok?: string;
};

export async function submitFlagAction(_prev: SubmitState, fd: FormData): Promise<SubmitState> {
  const player = await requirePlayer();
  const id = toId(fd.get("id"));
  // Phones add invisible characters and smart quotes when copying; strip them before comparing.
  const guess = String(fd.get("flag") ?? "")
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .trim()
    .replace(/^["'`\u2018\u2019\u201c\u201d]+|["'`\u2018\u2019\u201c\u201d]+$/g, "");
  if (!id) return { error: "Unknown challenge." };
  if (!guess) return { id, error: "Enter a flag first." };

  if (tooMany(`flag:${player.id}`, 20, 60_000)) {
    return { id, error: "Slow down. Wait a minute before trying again." };
  }
  const contest = await getContest();
  if (contestStatus(contest) !== "live") return { id, error: "The contest isn't accepting flags right now." };

  const db = await getDb();
  const [challenge] = await db
    .select()
    .from(challenges)
    .where(and(eq(challenges.id, id), eq(challenges.published, true)));
  if (!challenge) return { id, error: "That challenge isn't available." };

  if (guess !== challenge.flag) return { id, error: "Not quite. Check the flag and try again." };

  const [row] = await db
    .insert(solves)
    .values({ playerId: player.id, challengeId: id, points: challenge.points })
    .onConflictDoNothing()
    .returning({ id: solves.id });

  revalidatePath("/ctf", "layout");
  return { id, ok: row ? `Correct! +${challenge.points} points.` : "You already solved this one." };
}
