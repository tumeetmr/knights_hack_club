import { NextResponse, type NextRequest } from "next/server";

// Same cookie as STUDENT_COOKIE in lib/auth/session (not imported: that module pulls in the database).
const STUDENT_COOKIE = "kh_player";

// Optimistic check only: bounce visitors without a student cookie to the login page.
// The real verification happens in requireAdmin(), next to the data.
export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/ctf/admin/login") return NextResponse.next();
  if (!req.cookies.has(STUDENT_COOKIE)) {
    return NextResponse.redirect(new URL("/ctf/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/ctf/admin/:path*"] };
