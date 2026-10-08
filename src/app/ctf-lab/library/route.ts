import { NextRequest, NextResponse } from "next/server";

// Beginner CTF "Page Zero": pages 1-3 are a story, the flag sits on page 0 because programmers count from zero.
const page = (body: string) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>The Royal Library</title><style>body{font-family:system-ui,sans-serif;background:#0b1020;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center;line-height:1.5}main{max-width:480px}code{background:#ffffff1f;padding:2px 8px;border-radius:8px;word-break:break-all}a,button{display:inline-block;font:inherit;font-weight:700;border:0;border-radius:999px;background:#fff;color:#0b1020;padding:14px 28px;min-height:48px;margin-top:12px;text-decoration:none;box-sizing:border-box}.muted{color:#ffffff99;font-size:.9rem}</style></head><body><main>${body}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

const story = [
  "Once upon a time, the Knights of the Hack Club guarded a book of secrets.",
  "Every knight read pages 1, 2 and 3, and every knight found nothing.",
  "The librarian smiled. “You all start counting in the wrong place,” she said.",
];

export function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("page") ?? "1").trim();
  // Only real numbers count, so "?page=" (blank) doesn't read as 0 and leak the flag.
  const n = /^-?\d{1,6}$/.test(raw) ? Number(raw) : NaN;

  if (n === 0) {
    return page(
      `<h1>📖 Page 0</h1><p>The secret first page! Programmers start counting at zero.</p><p><code>KH{programmers_count_from_zero}</code></p><button onclick="navigator.clipboard.writeText('KH{programmers_count_from_zero}').then(()=>this.textContent='Copied ✓')">Copy flag</button>`,
    );
  }
  if (Number.isInteger(n) && n >= 1 && n <= story.length) {
    const next = n < story.length ? `<a href="?page=${n + 1}">Next page →</a>` : `<p class="muted">The end. Or is it the beginning?</p>`;
    return page(`<p class="muted">The Royal Library · page ${n} of ${story.length}</p><h1>📜</h1><p>${story[n - 1]}</p>${next}`);
  }
  return page(`<h1>🤔 No such page</h1><p>This book doesn't have a page “${raw.slice(0, 20).replace(/[<>&"]/g, "")}”.</p><a href="?page=1">Back to page 1</a>`);
}
