import { NextRequest } from "next/server";
import { clean, labPage } from "../_lib/lab-page";

// CTF "Oops, Committed It": a tiny fake git history viewer. A secret was committed, then "deleted" in a later
// commit, but it's still in history. The key is base64, so players also have to decode it.
const commits = [
  { id: "a91f3c2", msg: "Add README", date: "Mar 3", diff: `+ # Weather Bot\n+ Posts the weather to the club chat every morning.` },
  { id: "5be07d1", msg: "Add weather fetching", date: "Mar 5", diff: `+ import requests\n+ def get_weather(city):\n+     return requests.get(f"https://api.example.com/{city}").json()` },
  { id: "c3d82e9", msg: "Add config for bot", date: "Mar 6", diff: `+ # config.env\n+ CHAT_CHANNEL=#general\n+ CITY=Orlando\n+ API_KEY=S0h7c2VjcmV0c19saXZlX2luX2hpc3Rvcnl9` },
  { id: "7f4a10b", msg: "Fix typo in README", date: "Mar 7", diff: `- Posts the weather to the club chat every morning.\n+ Posts the weather to the club chat every morning.\n+ (Runs at 8 am.)` },
  { id: "e2c6b58", msg: "Remove secret key from config", date: "Mar 9", diff: `  # config.env\n  CHAT_CHANNEL=#general\n  CITY=Orlando\n- API_KEY=S0h7c2VjcmV0c19saXZlX2luX2hpc3Rvcnl9\n+ API_KEY=<set this in your environment>` },
  { id: "1d9e4f6", msg: "Add error handling", date: "Mar 12", diff: `+ try:\n+     data = get_weather(CITY)\n+ except Exception:\n+     post("Weather is down 😢")` },
];

export function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("commit") ?? "").trim();
  const head = `<p class="muted">weather-bot · branch main</p><h1>📂 Weather Bot Repo</h1>`;

  if (id) {
    const c = commits.find((x) => x.id === id);
    if (!c) return labPage("Commit not found", head + `<p>No commit “${clean(id, 20)}”.</p><a class="btn ghost" href="?">Back to history</a>`);
    const lines = c.diff
      .split("\n")
      .map((l) => `<span style="color:${l.startsWith("+") ? "#4ade80" : l.startsWith("-") ? "#fca5a5" : "#ffffffb3"}">${l.replace(/[<>&]/g, (ch) => `&#${ch.charCodeAt(0)};`)}</span>`)
      .join("\n");
    return labPage(
      `Commit ${c.id}`,
      head + `<div class="card"><p style="margin:0"><code>${c.id}</code> · ${c.date}</p><p style="margin:.3em 0 .6em;font-weight:800">${c.msg}</p><pre>${lines}</pre></div><a class="btn ghost" href="?">← Back to history</a>`,
    );
  }

  const list = [...commits]
    .reverse()
    .map((c) => `<a class="card" style="display:block;color:#fff;text-decoration:none" href="?commit=${c.id}"><code>${c.id}</code> <span class="muted">${c.date}</span><br><b>${c.msg}</b></a>`)
    .join("");
  return labPage(
    "Weather Bot Repo",
    head + `<p>A teammate says they cleaned up a leaked secret. Anything deleted from the code is gone forever, right?</p>${list}<p class="muted" style="margin-top:16px">Click a commit to see what changed.</p>`,
  );
}
