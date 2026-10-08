import { sql } from "drizzle-orm";
import { challenges, solves } from "@/db/schema";

/**
 * Dynamic scoring: a challenge is worth its full points to the first solver and loses value
 * along a curve as more people solve it, bottoming out at MIN_PERCENT of the original.
 * Everyone who solved it gets the current value, including earlier solvers, so a score only
 * reflects how rare each solve is, not how early someone showed up. Ties on score go to
 * whoever got there first (see getLeaderboard).
 */

/** The lowest a challenge can drop to, as a percent of its original points. */
export const MIN_PERCENT = 25;
/** How many solves it takes to reach that floor. */
export const DECAY_SOLVES = 20;

// Names spelled out: Drizzle drops table prefixes in single-table selects, and an unqualified
// "id" inside this subquery would match the inner solves row instead of the outer challenge.
const solveCount = sql`(select count(*) from ${solves} as s where s.challenge_id = "challenges"."id")`;
const floorPoints = sql`greatest(1, ${challenges.points} * ${MIN_PERCENT} / 100)`;

/**
 * Current value of the `challenges` row in scope. Integer math throughout:
 * points - (points - floor) * (solves - 1)^2 / DECAY^2, never below the floor.
 */
export const challengeValue = sql<number>`greatest(
  ${floorPoints},
  ${challenges.points} - (${challenges.points} - ${floorPoints})::bigint
    * power(greatest(${solveCount} - 1, 0), 2)::bigint / ${DECAY_SOLVES * DECAY_SOLVES}
)::int`;
