import "server-only";
import { and, count, desc, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { newsletters, players } from "@/db/schema";

/** Verified students who haven't opted out: the newsletter's audience. */
export const audience = and(isNotNull(players.emailVerifiedAt), isNull(players.unsubscribedAt));

export async function countRecipients() {
  const db = await getDb();
  const [row] = await db.select({ n: count() }).from(players).where(audience);
  return row.n;
}

export async function listNewsletters() {
  const db = await getDb();
  return db.select().from(newsletters).orderBy(desc(newsletters.sentAt)).limit(10);
}
