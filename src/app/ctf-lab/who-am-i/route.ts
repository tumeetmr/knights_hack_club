import { NextRequest, NextResponse } from "next/server";

// Beginner CTF "Who Am I?": trusting a value from the address bar. Deliberately not real auth.
const page = (body: string) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Who Am I?</title><style>body{font-family:system-ui,sans-serif;background:#0b1020;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}code{background:#ffffff1f;padding:2px 8px;border-radius:8px;word-break:break-all}button{font:inherit;font-weight:700;border:0;border-radius:999px;background:#fff;color:#0b1020;padding:14px 28px;min-height:48px;margin-top:12px}</style></head><body><div>${body}</div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

export function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  if (role === "admin") {
    return page(
      `<h1>👑 Welcome, admin!</h1><p><code>KH{url_tricks_are_fun}</code></p><button onclick="navigator.clipboard.writeText('KH{url_tricks_are_fun}').then(()=>this.textContent='Copied ✓')">Copy flag</button>`,
    );
  }
  return page(
    `<h1>🚪 Hello, guest.</h1><p>The flag is for admins only.</p><p>This page decided who you are from the address bar: <code>?role=guest</code></p>`,
  );
}
