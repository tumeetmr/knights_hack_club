import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import { secret } from "./session";

export const PLAYER_COOKIE = "kh_player";
const SESSION_DAYS = 14;

export async function createPlayerSession(playerId: number) {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const token = await new SignJWT({ role: "player" })
    .setSubject(String(playerId))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret());

  (await cookies()).set(PLAYER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deletePlayerSession() {
  (await cookies()).delete({ name: PLAYER_COOKIE, path: "/" });
}

/** The signed-in player, or null. Cached per request. */
export const getPlayer = cache(async () => {
  const token = (await cookies()).get(PLAYER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (payload.role !== "player" || !id) return null;
    const db = await getDb();
    const [row] = await db
      .select({ id: players.id, name: players.name, email: players.email })
      .from(players)
      .where(eq(players.id, id));
    return row ?? null;
  } catch {
    return null;
  }
});

/** Call first in every player-only page and server action; actions are public endpoints. */
export async function requirePlayer() {
  const player = await getPlayer();
  if (!player) redirect("/ctf/login");
  return player;
}
