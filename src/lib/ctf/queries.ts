import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { challenges, contest } from "@/db/schema";

export async function getContest() {
  const db = await getDb();
  const [row] = await db.select().from(contest).where(eq(contest.id, 1));
  return row;
}

export async function listChallenges() {
  const db = await getDb();
  return db.select().from(challenges).orderBy(asc(challenges.position), asc(challenges.id));
}

export async function getChallenge(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(challenges).where(eq(challenges.id, id));
  return row;
}
