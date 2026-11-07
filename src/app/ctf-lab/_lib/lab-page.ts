import { NextResponse } from "next/server";

const css = `body{font-family:system-ui,sans-serif;background:#0b1020;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px 16px;box-sizing:border-box;text-align:center;line-height:1.5}main{max-width:560px;width:100%}h1{font-size:2rem;margin:.2em 0}.muted{color:#ffffff99;font-size:.9rem}code{background:#ffffff1f;padding:2px 8px;border-radius:8px;word-break:break-all}a.btn,button{display:inline-block;font:inherit;font-weight:700;border:0;border-radius:999px;background:#fff;color:#0b1020;padding:14px 28px;min-height:48px;margin:6px 4px 0;text-decoration:none;box-sizing:border-box;cursor:pointer}a.ghost{background:#ffffff1f;color:#fff}input{font:inherit;font-size:16px;border:0;border-radius:999px;padding:14px 20px;min-height:48px;width:100%;box-sizing:border-box;text-align:center;margin-top:8px}.card{background:#ffffff12;border:1px solid #ffffff1f;border-radius:20px;padding:16px;margin-top:16px;text-align:left}pre{margin:0;white-space:pre-wrap;word-break:break-all;font-size:.85rem}`;

/** A small standalone page for the CTF lab, same navy look as the other lab pages. */
export function labPage(title: string, body: string, init: ResponseInit = {}) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>${css}</style></head><body><main>${body}</main></body></html>`,
    {
      ...init,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...init.headers },
    },
  );
}

/** The flag plus a copy button. */
export const flagBlock = (flag: string) =>
  `<p><code>${flag}</code></p><button onclick="navigator.clipboard.writeText('${flag}').then(()=>this.textContent='Copied ✓')">Copy flag</button>`;

/** Echo user input back safely. */
export const clean = (s: string, max = 60) => s.slice(0, max).replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
