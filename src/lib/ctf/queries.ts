import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { challenges, contest, players, solves } from "@/db/schema";

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

// --- Player side -----------------------------------------------------------

/** Published challenges without flag or admin notes, safe to send to the browser. */
export async function listPublicChallenges() {
  const db = await getDb();
  return db
    .select({
      id: challenges.id,
      title: challenges.title,
      category: challenges.category,
      description: challenges.description,
      hint: challenges.hint,
      points: challenges.points,
      solveCount: sql<number>`(select count(*)::int from ${solves} where ${solves.challengeId} = ${challenges.id})`,
    })
    .from(challenges)
    .where(eq(challenges.published, true))
    .orderBy(asc(challenges.position), asc(challenges.id));
}

export async function listPlayerSolves(playerId: number) {
  const db = await getDb();
  return db
    .select({ challengeId: solves.challengeId, points: solves.points })
    .from(solves)
    .where(eq(solves.playerId, playerId));
}

export type LeaderboardRow = {
  playerId: number;
  name: string;
  score: number;
  solved: number;
  lastSolveAt: Date;
};

/** Ranked by score, then by who reached it first. Players with no solves are left off. */
export async function getLeaderboard(limit = 100): Promise<LeaderboardRow[]> {
  const db = await getDb();
  const score = sql<number>`sum(${solves.points})::int`;
  const last = sql<Date>`max(${solves.solvedAt})`.mapWith((v) => new Date(v));
  return db
    .select({
      playerId: players.id,
      name: players.name,
      score,
      solved: sql<number>`count(*)::int`,
      lastSolveAt: last,
    })
    .from(solves)
    .innerJoin(players, eq(players.id, solves.playerId))
    .groupBy(players.id, players.name)
    .orderBy(desc(score), asc(last), asc(players.id))
    .limit(limit);
}

/** 1-based leaderboard position (same ordering as getLeaderboard), or null with no solves. */
export async function getPlayerRank(playerId: number): Promise<number | null> {
  const db = await getDb();
  const rows = await db.execute<{ rank: number }>(sql`
    with t as (
      select player_id, sum(points) as score, max(solved_at) as last
      from solves group by player_id
    )
    select (
      select count(*)::int from t o
      where o.score > me.score
         or (o.score = me.score and (o.last < me.last or (o.last = me.last and o.player_id < me.player_id)))
    ) + 1 as rank
    from t me where me.player_id = ${playerId}
  `);
  return rows[0]?.rank ?? null;
}

export async function countPlayers() {
  const db = await getDb();
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(players);
  return row.n;
}
