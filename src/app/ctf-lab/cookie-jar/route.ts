import { NextRequest } from "next/server";
import { flagBlock, labPage } from "../_lib/lab-page";

// CTF "Cookie Jar": the page trusts a cookie that anyone can edit. The cookie is base64 JSON, so players
// have to decode it, change the role, encode it again and set it in DevTools. Deliberately not real auth.
const COOKIE = "knight_pass";
const encode = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64");

export function GET(req: NextRequest) {
  const raw = req.cookies.get(COOKIE)?.value;

  if (!raw) {
    const res = labPage(
      "The Royal Gate",
      `<h1>🏰 The Royal Gate</h1><p>The guard hands you a pass and says you may look around, but only the <b>king</b> may enter the throne room.</p><p class="card">Your pass is now stored in your browser. <a class="btn" href="">Show it to the guard</a></p>`,
    );
    res.cookies.set(COOKIE, encode({ user: "squire_" + Math.floor(Math.random() * 900 + 100), role: "squire" }), { path: "/ctf-lab/cookie-jar", sameSite: "lax" });
    return res;
  }

  let pass: { user?: unknown; role?: unknown } | null = null;
  try {
    pass = JSON.parse(Buffer.from(decodeURIComponent(raw), "base64").toString("utf8"));
  } catch {}

  if (!pass || typeof pass !== "object") {
    return labPage("The Royal Gate", `<h1>🤨 This pass looks forged</h1><p>The guard can't read it. Delete the cookie to get a fresh one, or fix what you changed.</p>`);
  }
  if (pass.role === "king") {
    return labPage("The Throne Room", `<h1>👑 Long live the king!</h1><p>The guard bows and opens the doors.</p>${flagBlock("KH{cookies_are_not_secrets}")}`);
  }
  return labPage(
    "The Royal Gate",
    `<h1>🛡️ Halt, ${typeof pass.user === "string" ? pass.user.slice(0, 20).replace(/[^\w-]/g, "") : "stranger"}</h1><p>Your pass says you are a <b>${typeof pass.role === "string" ? pass.role.slice(0, 20).replace(/[^\w-]/g, "") : "?"}</b>. Only the king may enter.</p><p class="card muted">The pass is stored in your browser, not on this server. Who else could change it?</p>`,
  );
}
