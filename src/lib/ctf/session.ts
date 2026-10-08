import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { secret } from "@/lib/auth/secret";

export const ADMIN_COOKIE = "kh_admin";
const SESSION_HOURS = 12;

export async function createAdminSession() {
  const expires = new Date(Date.now() + SESSION_HOURS * 3_600_000);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret());

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/ctf/admin",
    expires,
  });
}

export async function deleteAdminSession() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/ctf/admin" });
}

/** True when the request carries a valid admin cookie. Cached per request. */
export const isAdmin = cache(async () => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
});

/** Call first in every admin page and server action; actions are public endpoints. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/ctf/admin/login");
}
