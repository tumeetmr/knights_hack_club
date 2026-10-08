import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { players } from "@/db/schema";
import { loginHref } from "./next";
import { secret } from "./secret";

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

/** The signed-in student, or null. Cached per request. */
export const getStudent = cache(async () => {
  const token = (await cookies()).get(STUDENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    if (payload.role !== "player" || !id) return null;
    const db = await getDb();
    const [row] = await db
      .select({ id: players.id, name: players.name })
      .from(players)
      .where(eq(players.id, id));
    return row ?? null;
  } catch {
    return null;
  }
});

/**
 * Call first in every student-only page and server action; actions are public endpoints.
 * `next` is where to come back to after signing in.
 */
export async function requireStudent(next = "/") {
  const student = await getStudent();
  if (!student) redirect(loginHref(next));
  return student;
}
