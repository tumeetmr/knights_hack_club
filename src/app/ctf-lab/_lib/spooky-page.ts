import { NextResponse } from "next/server";

const css = `body{font-family:system-ui,sans-serif;background:radial-gradient(60rem 40rem at 80% -10%,#3b1360,transparent 60%),#0c0614;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px 16px;box-sizing:border-box;text-align:center;line-height:1.5}main{max-width:520px;width:100%}h1{font-size:2rem;margin:.2em 0}.muted{color:#ffffff99;font-size:.9rem}code{background:#ffffff1f;padding:2px 8px;border-radius:8px;word-break:break-all}a.btn,button{display:inline-block;font:inherit;font-weight:700;border:0;border-radius:999px;background:#fb923c;color:#160b22;padding:14px 28px;min-height:48px;margin:6px 4px 0;text-decoration:none;box-sizing:border-box;cursor:pointer}a.ghost{background:#ffffff1f;color:#fff}input{font:inherit;font-size:16px;border:0;border-radius:999px;padding:14px 20px;min-height:48px;width:100%;box-sizing:border-box;text-align:center;margin-top:8px}.card{background:#ffffff12;border:1px solid #ffffff1f;border-radius:20px;padding:16px;margin-top:16px}`;

/** A small standalone Halloween page for the CTF lab, matching the other lab pages but in orange and purple. */
export function spookyPage(title: string, body: string) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>${css}</style></head><body><main>${body}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

/** The flag plus a copy button, same as the other lab pages. */
export const flagBlock = (flag: string) =>
  `<p><code>${flag}</code></p><button onclick="navigator.clipboard.writeText('${flag}').then(()=>this.textContent='Copied ✓')">Copy flag</button>`;

/** Echo user input back safely. */
export const clean = (s: string) => s.slice(0, 30).replace(/[<>&"']/g, "");
