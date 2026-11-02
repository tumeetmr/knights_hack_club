import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { players, scratchProjects } from "@/db/schema";

const columns = {
  id: scratchProjects.id,
  scratchId: scratchProjects.scratchId,
  title: scratchProjects.title,
  description: scratchProjects.description,
  scratchAuthor: scratchProjects.scratchAuthor,
  approved: scratchProjects.approved,
  createdAt: scratchProjects.createdAt,
  maker: players.name,
};

/** Approved projects for the public gallery, newest first. */
export async function listApprovedProjects() {
  const db = await getDb();
  return db
    .select(columns)
    .from(scratchProjects)
    .innerJoin(players, eq(players.id, scratchProjects.playerId))
    .where(eq(scratchProjects.approved, true))
    .orderBy(desc(scratchProjects.createdAt));
}

export async function getApprovedProject(scratchId: number) {
  const db = await getDb();
  const [row] = await db
    .select(columns)
    .from(scratchProjects)
    .innerJoin(players, eq(players.id, scratchProjects.playerId))
    .where(and(eq(scratchProjects.scratchId, scratchId), eq(scratchProjects.approved, true)));
  return row ?? null;
}

/** A student's own projects, approved or not. */
export async function listProjectsByPlayer(playerId: number) {
  const db = await getDb();
  return db
    .select(columns)
    .from(scratchProjects)
    .innerJoin(players, eq(players.id, scratchProjects.playerId))
    .where(eq(scratchProjects.playerId, playerId))
    .orderBy(desc(scratchProjects.createdAt));
}

/** Everything, for the admin review screen: waiting projects first. */
export async function listAllProjects() {
  const db = await getDb();
  return db
    .select(columns)
    .from(scratchProjects)
    .innerJoin(players, eq(players.id, scratchProjects.playerId))
    .orderBy(scratchProjects.approved, desc(scratchProjects.createdAt));
}
