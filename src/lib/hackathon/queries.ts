import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { hackathonRegistrations, players } from "@/db/schema";

/** Every sign-up with the student's name and email from their account, newest first. */
export async function listRegistrations() {
  const db = await getDb();
  return db
    .select({
      id: hackathonRegistrations.id,
      name: players.name,
      email: players.email,
      program: hackathonRegistrations.program,
      year: hackathonRegistrations.year,
      experience: hackathonRegistrations.experience,
      interests: hackathonRegistrations.interests,
      dietary: hackathonRegistrations.dietary,
      notes: hackathonRegistrations.notes,
      createdAt: hackathonRegistrations.createdAt,
    })
    .from(hackathonRegistrations)
    .innerJoin(players, eq(players.id, hackathonRegistrations.playerId))
    .orderBy(desc(hackathonRegistrations.createdAt));
}

export async function getRegistration(playerId: number) {
  const db = await getDb();
  const [row] = await db.select().from(hackathonRegistrations).where(eq(hackathonRegistrations.playerId, playerId));
  return row ?? null;
}
