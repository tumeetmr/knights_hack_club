import { NextRequest } from "next/server";
import { clean, flagBlock, spookyPage } from "../_lib/spooky-page";

// Halloween CTF "The Graveyard Riddle": the first letter of each name on the graves spells the password (BANSHEE).
// Checked here on the server, so the answer isn't sitting in the page source.
const graves = [
  ["Boris Bonecrusher", "1802 – 1847", "He went out for a midnight snack."],
  ["Agatha Ashgrove", "1811 – 1866", "She told you she was sick."],
  ["Nigel Nightshade", "1790 – 1834", "Tried the mystery mushrooms."],
  ["Sybil Spindlewood", "1823 – 1871", "Still knitting on the other side."],
  ["Hector Hollowell", "1799 – 1850", "Dug his own grave. Literally."],
  ["Edna Evergloom", "1830 – 1888", "Gloomy in life, gloomier now."],
  ["Elmer Emberfall", "1815 – 1859", "Last seen holding a candle near the hay."],
];

export function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("password") ?? "").trim();

  if (raw.toLowerCase() === "banshee") {
    return spookyPage(
      "The Crypt",
      `<h1>⚰️ The crypt door creaks open…</h1><p>A banshee shrieks, then hands you a dusty scroll.</p>${flagBlock("KH{the_dead_tell_tales}")}`,
    );
  }

  const stones = graves
    .map(([name, years, line]) => `<div class="card"><p style="margin:0;font-weight:800;font-size:1.15rem">🪦 ${name}</p><p class="muted" style="margin:0">${years}</p><p style="margin:.4em 0 0;font-style:italic">“${line}”</p></div>`)
    .join("");

  const wrong = raw
    ? `<p style="color:#fca5a5">The door doesn't budge for “${clean(raw)}”. A crow laughs at you.</p>`
    : "";

  return spookyPage(
    "The Graveyard",
    `<p class="muted">Knights Hack Cemetery · est. 1790</p><h1>🌙 The Graveyard</h1>
<p>Seven graves stand in a row in front of a locked crypt. A note is nailed to the door:</p>
<p class="card" style="font-style:italic">“The password is written in stone, for all to see. Just start at the beginning of each one.”</p>
${stones}
<form class="card" method="get"><label for="password" style="font-weight:700">🔒 Crypt password</label><input id="password" name="password" autocomplete="off" autocapitalize="off" placeholder="whisper it here"><button type="submit">Knock on the crypt</button></form>${wrong}`,
  );
}
