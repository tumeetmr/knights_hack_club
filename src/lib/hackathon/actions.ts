"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { hackathonRegistrations } from "@/db/schema";
import { requireStudent } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/ctf/session";
import { rawValues, toId, type FormState } from "@/lib/form";
import { tooMany } from "@/lib/rate-limit";
import { DEADLINE_LABEL, REGISTER_PATH, registrationOpen, EXPERIENCE_IDS, INTEREST_IDS, YEARS } from "./config";

const text = (max: number) => z.string().trim().max(max);

const schema = z.object({
  program: text(100).min(2, "Enter your program of study."),
  year: z.enum(YEARS, "Pick your year."),
  experience: z.string().refine((v) => EXPERIENCE_IDS.includes(v), "Pick your experience level."),
  dietary: text(200),
  notes: text(500),
});

export async function registerHackathonAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const student = await requireStudent(REGISTER_PATH);
  const values = rawValues(fd);
  // Checkbox groups send one entry per ticked box; keep them for the redisplay too.
  const interests = fd.getAll("interests").filter((v): v is string => typeof v === "string" && INTEREST_IDS.includes(v));
  values.interests = interests.join(",");

  if (tooMany(`hackathon:${student.id}`, 15, 600_000)) {
    return { error: "Too many tries. Wait a few minutes and try again.", values };
  }
  if (values.rules !== "on") return { error: "Please agree to the code of conduct to register.", values };

  const parsed = schema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const d = parsed.data;

  const fields = { ...d, interests };
  const db = await getDb();
  const [existing] = await db
    .select({ id: hackathonRegistrations.id })
    .from(hackathonRegistrations)
    .where(eq(hackathonRegistrations.playerId, student.id));
  if (!existing && !registrationOpen()) {
    return { error: `Applications closed on ${DEADLINE_LABEL}.`, values };
  }
  await db
    .insert(hackathonRegistrations)
    .values({ playerId: student.id, ...fields })
    .onConflictDoUpdate({ target: hackathonRegistrations.playerId, set: fields });

  revalidatePath(REGISTER_PATH);
  revalidatePath("/ctf/admin/hackathon");
  return {
    ok: existing
      ? "Your registration is updated."
      : "You're in! See you on Nov 30. We'll email the room as soon as they're confirmed.",
  };
}

/** A student withdraws their own sign-up. */
export async function cancelRegistrationAction() {
  const student = await requireStudent(REGISTER_PATH);
  const db = await getDb();
  await db.delete(hackathonRegistrations).where(eq(hackathonRegistrations.playerId, student.id));
  revalidatePath(REGISTER_PATH);
  revalidatePath("/ctf/admin/hackathon");
}

export async function deleteRegistrationAction(fd: FormData) {
  await requireAdmin();
  const id = toId(fd.get("id"));
  if (!id) return;
  const db = await getDb();
  await db.delete(hackathonRegistrations).where(eq(hackathonRegistrations.id, id));
  revalidatePath("/ctf/admin/hackathon");
}
