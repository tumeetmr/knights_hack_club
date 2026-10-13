import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import { loginHref, verifyHref } from "./next";
import { secret } from "./secret";
import { needsVerification } from "./verification";

// One student account works across the site (CTF, Pixel Wall, ...). The cookie name and
// "player" role predate that and are kept so existing sign-ins stay valid.
export const STUDENT_COOKIE = "kh_player";
const SESSION_DAYS = 14;

export async function createStudentSession(studentId: number) {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const token = await new SignJWT({ role: "player" })
    .setSubject(String(studentId))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret());

  (await cookies()).set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteStudentSession() {
  (await cookies()).delete({ name: STUDENT_COOKIE, path: "/" });
}

// A password change or reset signs out every session made before it. JWT times are in whole
// seconds, so the cookie made right after the change counts as after it.
const issuedAfter = (iat: number | undefined, changedAt: Date | null) =>
  !changedAt || (iat ?? 0) >= Math.floor(changedAt.getTime() / 1000);

/**
 * Whoever holds a valid student cookie, verified or not. Only the sign-in, sign-up and
 * verify flow should use this; everything else uses getStudent. Cached per request.
 */
export const getSession = cache(async () => {
  const token = (await cookies()).get(STUDENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (payload.role !== "player" || !id) return null;
    const db = await getDb();
    const [row] = await db
      .select({
        id: players.id,
        name: players.name,
        email: players.email,
        emailVerifiedAt: players.emailVerifiedAt,
        passwordChangedAt: players.passwordChangedAt,
      })
      .from(players)
      .where(eq(players.id, id));
    if (row && !issuedAfter(payload.iat, row.passwordChangedAt)) return null;
    return row ? { id: row.id, name: row.name, email: row.email, needsVerification: needsVerification(row) } : null;
  } catch {
    return null;
  }
});

/** The signed-in student, or null. Someone who still has to confirm their email counts as signed out. */
export const getStudent = cache(async () => {
  const session = await getSession();
  return session && !session.needsVerification ? { id: session.id, name: session.name } : null;
});

/**
 * Call first in every student-only page and server action; actions are public endpoints.
 * `next` is where to come back to after signing in.
 */
export async function requireStudent(next = "/") {
  const student = await getStudent();
  if (!student) redirect((await getSession()) ? verifyHref(next) : loginHref(next));
  return student;
}
