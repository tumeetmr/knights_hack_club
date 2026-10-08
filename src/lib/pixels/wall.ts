import "server-only";
import { desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { pixels, players } from "@/db/schema";
import { COOLDOWN_MS, GRID_SIZE, PIXEL_COLORS, type PlaceResult, type PixelTuple, type WallResponse } from "./config";

const MAX_DIFF = 2_000;

const columns = { id: pixels.id, x: pixels.x, y: pixels.y, color: pixels.color, name: players.name };
const toTuple = (r: { x: number; y: number; color: string; name: string | null }): PixelTuple => [
  r.x,
  r.y,
  r.color,
  r.name ?? "",
];

/** The current color of every painted cell (the latest placement per cell). */
export async function getWall(): Promise<WallResponse> {
  const db = await getDb();
  const rows = await db
    .selectDistinctOn([pixels.x, pixels.y], columns)
    .from(pixels)
    .leftJoin(players, eq(players.id, pixels.playerId))
    .orderBy(pixels.x, pixels.y, desc(pixels.id));
  // The newest placement overall is also the newest in its cell, so it's in `rows`.
  return { cursor: rows.reduce((max, r) => Math.max(max, r.id), 0), pixels: rows.map(toTuple) };
}

/** Placements after `since`, oldest first so later ones paint over earlier ones. */
export async function getChanges(since: number): Promise<WallResponse> {
  const db = await getDb();
  const rows = await db
    .select(columns)
    .from(pixels)
    .leftJoin(players, eq(players.id, pixels.playerId))
    .where(gt(pixels.id, since))
    .orderBy(pixels.id)
    .limit(MAX_DIFF + 1);
  if (rows.length > MAX_DIFF) return { cursor: since, pixels: [], reset: true };
  return { cursor: rows.at(-1)?.id ?? since, pixels: rows.map(toTuple) };
}

/** How long until the student may place their next pixel, in ms. */
export async function getWaitMs(studentId: number) {
  const db = await getDb();
  const [last] = await db
    .select({ placedAt: pixels.placedAt })
    .from(pixels)
    .where(eq(pixels.playerId, studentId))
    .orderBy(desc(pixels.id))
    .limit(1);
  return last ? Math.max(0, last.placedAt.getTime() + COOLDOWN_MS - Date.now()) : 0;
}

export async function placePixel(studentId: number, x: number, y: number, color: string): Promise<PlaceResult> {
  const inGrid = (n: number) => Number.isInteger(n) && n >= 0 && n < GRID_SIZE;
  if (!inGrid(x) || !inGrid(y)) return { ok: false, error: "That spot is off the wall." };
  if (!PIXEL_COLORS.includes(color)) return { ok: false, error: "Pick a color from the palette." };

  const db = await getDb();
  return db.transaction(async (tx) => {
    // Lock the student's row so two quick clicks (or two tabs) can't both pass the cooldown check.
    await tx.select({ id: players.id }).from(players).where(eq(players.id, studentId)).for("update");
    const [last] = await tx
      .select({ placedAt: pixels.placedAt })
      .from(pixels)
      .where(eq(pixels.playerId, studentId))
      .orderBy(desc(pixels.id))
      .limit(1);
    const waitMs = last ? last.placedAt.getTime() + COOLDOWN_MS - Date.now() : 0;
    if (waitMs > 0) return { ok: false, error: "Your next pixel isn't ready yet.", waitMs } as const;
    await tx.insert(pixels).values({ x, y, color, playerId: studentId });
    return { ok: true, waitMs: COOLDOWN_MS } as const;
  });
}
