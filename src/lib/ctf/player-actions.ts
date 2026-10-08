"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { challenges, solves } from "@/db/schema";
import { requireStudent } from "@/lib/auth/session";
import { toId } from "@/lib/form";
import { tooMany } from "@/lib/rate-limit";
import { contestStatus } from "./contest";
import { getContest } from "./queries";
import { challengeValue } from "./scoring";

export type SubmitState = {
  /** Which challenge this result belongs to, so only its card shows it. */
  id?: number;
  error?: string;
  ok?: string;
};

export async function submitFlagAction(_prev: SubmitState, fd: FormData): Promise<SubmitState> {
  const player = await requireStudent("/ctf");
  const id = toId(fd.get("id"));
  // Phones add invisible characters and smart quotes when copying; strip them before comparing.
  const guess = String(fd.get("flag") ?? "")
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .trim()
    .replace(/^["'`\u2018\u2019\u201c\u201d]+|["'`\u2018\u2019\u201c\u201d]+$/g, "");
  if (!id) return { error: "Unknown challenge." };
  if (!guess) return { id, error: "Enter a flag first." };

  if (tooMany(`flag:${player.id}`, 20, 60_000)) {
    return { id, error: "Slow down. Wait a minute before trying again." };
  }
  const contest = await getContest();
  if (contestStatus(contest) !== "live") return { id, error: "The contest isn't accepting flags right now." };

  const db = await getDb();
  const [challenge] = await db
    .select()
    .from(challenges)
    .where(and(eq(challenges.id, id), eq(challenges.published, true)));
  if (!challenge) return { id, error: "That challenge isn't available." };

  if (guess !== challenge.flag) {
    // Beginners often paste only the inside of the braces or change the capitals; say so.
    if (guess.toLowerCase() === challenge.flag.toLowerCase()) {
      return { id, error: "So close! Flags care about capital letters. Copy it exactly as you found it." };
    }
    if (!/^KH\{.+\}$/i.test(guess)) {
      return { id, error: "Flags look like KH{...}. Copy the whole thing, including KH{ and the closing }." };
    }
    return { id, error: "Not quite. Check the flag and try again." };
  }

  const [row] = await db
    .insert(solves)
    .values({ playerId: player.id, challengeId: id, points: challenge.points })
    .onConflictDoNothing()
    .returning({ id: solves.id });
  if (!row) return { id, ok: "You already solved this one." };

  // Worth is counted after this solve, so it matches what the board now shows.
  const [{ value }] = await db.select({ value: challengeValue }).from(challenges).where(eq(challenges.id, id));
  await db.update(solves).set({ points: value }).where(eq(solves.id, row.id));

  revalidatePath("/ctf", "layout");
  return { id, ok: `Correct! +${value} points.` };
}
