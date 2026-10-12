import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { players } from "@/db/schema";

export async function getSubscription(playerId: number) {
  const db = await getDb();
  const [row] = await db
    .select({ email: players.email, unsubscribedAt: players.unsubscribedAt })
    .from(players)
    .where(eq(players.id, playerId));
  return row ?? null;
}

export async function setSubscribed(playerId: number, subscribed: boolean) {
  const db = await getDb();
  await db
    .update(players)
    .set({ unsubscribedAt: subscribed ? null : new Date() })
    .where(eq(players.id, playerId));
}
