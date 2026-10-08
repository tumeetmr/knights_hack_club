"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { challenges, contest, players } from "@/db/schema";
import { parseChallenge, type ChallengeInput } from "./challenge-input";
import { fromLocalInput } from "./contest";
import { generateFlag } from "./flag";
import { hashPassword } from "@/lib/auth/password";
import { rawValues, toId, type FormState } from "@/lib/form";
import { clearAttempts, clientIp, tooMany } from "@/lib/rate-limit";
import { createAdminSession, deleteAdminSession, requireAdmin } from "./session";

// Every admin tab shows contest and challenge data, so refresh them all.
const refresh = () => revalidatePath("/ctf/admin", "layout");

// --- Sign in / out -------------------------------------------------------

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "ADMIN_PASSWORD is not configured on the server." };

  const key = `admin:${await clientIp()}`;
  if (tooMany(key, 8, 600_000)) return { error: "Too many attempts. Try again in a few minutes." };

  const given = String(fd.get("password") ?? "");
  if (!timingSafeEqual(digest(given), digest(expected))) {
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Wrong password." };
  }

  clearAttempts(key);
  await createAdminSession();
  redirect("/ctf/admin");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/ctf/admin/login");
}

// --- Contest settings ----------------------------------------------------

export async function saveContestAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values = rawValues(fd);

  const title = (values.title ?? "").trim() || "Knights Hack CTF";
  if (title.length > 80) return { error: "Contest name is too long (80 characters max)", values };

  const startAt = fromLocalInput(values.start ?? "");
  const endAt = fromLocalInput(values.end ?? "");
  if (startAt && endAt && endAt <= startAt) {
    return { error: "The end must be after the start.", values };
  }

  const db = await getDb();
  await db
    .update(contest)
    .set({ title, startAt, endAt, paused: values.paused === "on" })
    .where(eq(contest.id, 1));
  refresh();
  return { ok: "Contest settings saved.", values };
}

/** The quick open/close switch on the overview. */
export async function toggleContestPausedAction() {
  await requireAdmin();
  const db = await getDb();
  await db
    .update(contest)
    .set({ paused: sql`not ${contest.paused}` })
    .where(eq(contest.id, 1));
  refresh();
}

// --- Challenges ----------------------------------------------------------

const nextPosition = sql<number>`coalesce(max(${challenges.position}), 0) + 1`;

export async function saveChallengeAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values = rawValues(fd);
  const id = toId(values.id);
  const db = await getDb();

  const existing = id
    ? (await db.select({ flag: challenges.flag }).from(challenges).where(eq(challenges.id, id)))[0]
    : undefined;
  if (id && !existing) return { error: "That challenge no longer exists.", values };

  const parsed = parseChallenge({ ...values, published: values.published === "on" }, existing?.flag);
  if ("error" in parsed) return { error: parsed.error, values };
  const data = parsed.data;

  if (id) {
    await db.update(challenges).set(data).where(eq(challenges.id, id));
    refresh();
    return { ok: "Saved.", values: { ...values, flag: data.flag } };
  }

  const [{ position }] = await db.select({ position: nextPosition }).from(challenges);
  await db.insert(challenges).values({ ...data, position });
  refresh();

  if (values.intent === "another") {
    const next = new URLSearchParams({
      added: data.title,
      category: data.category,
      points: String(data.points),
    });
    redirect(`/ctf/admin/challenges/new?${next}`);
  }
  redirect(`/ctf/admin/challenges?${new URLSearchParams({ added: data.title })}`);
}

export async function togglePublishedAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (!id) return;
  const db = await getDb();
  await db
    .update(challenges)
    .set({ published: sql`not ${challenges.published}` })
    .where(eq(challenges.id, id));
  refresh();
}

export async function moveChallengeAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (!id) return;
  const dir = fd.get("dir") === "up" ? -1 : 1;
  const db = await getDb();

  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: challenges.id })
      .from(challenges)
      .orderBy(asc(challenges.position), asc(challenges.id));
    const from = rows.findIndex((r) => r.id === id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= rows.length) return;
    [rows[from], rows[to]] = [rows[to], rows[from]];
    for (const [i, row] of rows.entries()) {
      await tx.update(challenges).set({ position: i + 1 }).where(eq(challenges.id, row.id));
    }
  });
  refresh();
}

export async function duplicateChallengeAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (!id) return;
  const db = await getDb();
  const [source] = await db.select().from(challenges).where(eq(challenges.id, id));
  if (!source) return;

  const [{ position }] = await db.select({ position: nextPosition }).from(challenges);
  const [copy] = await db
    .insert(challenges)
    .values({ ...source, id: undefined, title: `${source.title} (copy)`.slice(0, 80), flag: generateFlag(), published: false, position })
    .returning({ id: challenges.id });
  refresh();
  redirect(`/ctf/admin/challenges/${copy.id}`);
}

export async function deleteChallengeAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (id) {
    const db = await getDb();
    await db.delete(challenges).where(eq(challenges.id, id));
  }
  refresh();
  redirect("/ctf/admin/challenges");
}

// --- Bulk import ---------------------------------------------------------

export async function importChallengesAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const source = String(fd.get("json") ?? "");

  let list: unknown;
  try {
    list = JSON.parse(source);
  } catch {
    return { error: "That isn't valid JSON. Check for missing commas or quotes.", values: { json: source } };
  }
  if (list && typeof list === "object" && !Array.isArray(list) && "challenges" in list) {
    list = (list as { challenges: unknown }).challenges;
  }
  if (!Array.isArray(list) || list.length === 0) {
    return { error: "Expected a list of challenges, like [ { ... }, { ... } ].", values: { json: source } };
  }
  if (list.length > 200) return { error: "Import 200 challenges or fewer at a time.", values: { json: source } };

  const rows: ChallengeInput[] = [];
  for (const [i, item] of list.entries()) {
    const parsed = parseChallenge(item && typeof item === "object" ? (item as Record<string, unknown>) : {});
    if ("error" in parsed) {
      return { error: `Challenge #${i + 1}: ${parsed.error}`, values: { json: source } };
    }
    rows.push(parsed.data);
  }

  const db = await getDb();
  await db.transaction(async (tx) => {
    const [{ position }] = await tx.select({ position: nextPosition }).from(challenges);
    await tx.insert(challenges).values(rows.map((r, i) => ({ ...r, position: position + i })));
  });
  refresh();
  return { ok: `Imported ${rows.length} challenge${rows.length === 1 ? "" : "s"}. Challenges are drafts unless they set "published": true.` };
}

// --- Players ---------------------------------------------------------------

/** For players who forgot their password: an organizer sets a temporary one and tells them in person. */
export async function resetPlayerPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email) return { error: "Enter the player's email." };
  if (password.length < 8 || password.length > 100) {
    return { error: "The new password needs 8 to 100 characters.", values: { email } };
  }

  const db = await getDb();
  const [row] = await db
    .update(players)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(players.email, email))
    .returning({ name: players.name });
  if (!row) return { error: "No player is registered with that email.", values: { email } };

  clearAttempts(`login:${email}`);
  return { ok: `Password reset for ${row.name}. They can sign in with the new password now.` };
}
