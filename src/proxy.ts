import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/ctf/session";

// Optimistic check only: bounce visitors without an admin cookie to the login page.
// The real verification happens in requireAdmin(), next to the data.
export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/ctf/admin/login") return NextResponse.next();
  if (!req.cookies.has(ADMIN_COOKIE)) {
    return NextResponse.redirect(new URL("/ctf/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/ctf/admin/:path*"] };
