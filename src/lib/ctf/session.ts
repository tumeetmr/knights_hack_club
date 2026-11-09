import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import { getStudent } from "@/lib/auth/session";

/** True when the signed-in student has `is_admin` set in the database. Cached per request. */
export const isAdmin = cache(async () => {
  const student = await getStudent();
  if (!student) return false;
  const db = await getDb();
  const [row] = await db.select({ isAdmin: players.isAdmin }).from(players).where(eq(players.id, student.id));
  return row?.isAdmin === true;
});

/** Call first in every admin page and server action; actions are public endpoints. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/ctf/admin/login");
}
