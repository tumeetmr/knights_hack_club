import { NextRequest } from "next/server";
import { clean, flagBlock, spookyPage } from "../_lib/spooky-page";

// Halloween CTF "The Haunted House": the basement has no link, so players type ?room=basement themselves,
// then find the key in the attic and add it with &key=skeleton. Teaches reading and combining URL parameters.
const nav = (rooms: string[]) => rooms.map((r) => `<a class="btn ghost" href="?room=${r}">${r[0].toUpperCase() + r.slice(1)}</a>`).join("");
const back = `<p>${nav(["hallway"])}</p>`;

const rooms: Record<string, string> = {
  hallway: `<h1>🏚️ The Hallway</h1><p>The front door slams shut behind you. Candles flicker. Look at your address bar: this house tracks where you are with <code>?room=hallway</code>.</p><p>Where to?</p><p>${nav(["kitchen", "library", "attic"])}</p>`,
  kitchen: `<h1>🍲 The Kitchen</h1><p>A cauldron bubbles on the stove. Something is cooking… you'd rather not know what.</p><p class="card">You hear moaning coming from <b>below</b> the floor. There's a door to the <b>basement</b> somewhere, but nobody built a button for it.</p>${back}`,
  library: `<h1>📚 The Library</h1><p>The books whisper as you walk past. One falls open:</p><p class="card" style="font-style:italic">“Doors in this house open when you tell them which room you want. Some doors also want a <b>key</b>, given the same way, joined with an <b>&amp;</b>.”</p>${back}`,
  attic: `<h1>🕸️ The Attic</h1><p>Cobwebs everywhere. A rocking chair rocks by itself.</p><p class="card">Scratched into the floorboards: <br><b>“the basement key is the one that opens every lock: skeleton”</b></p>${back}`,
};

export function GET(req: NextRequest) {
  const room = (req.nextUrl.searchParams.get("room") ?? "hallway").trim().toLowerCase();
  const key = (req.nextUrl.searchParams.get("key") ?? "").trim().toLowerCase();

  if (room === "basement") {
    if (key === "skeleton") {
      return spookyPage(
        "The Basement",
        `<h1>💀 The Basement</h1><p>The skeleton key turns. Inside, a ghost sits on a pile of candy and hands you a note.</p>${flagBlock("KH{skeleton_key_unlocked}")}`,
      );
    }
    const msg = key ? `The key “${clean(key)}” doesn't fit.` : "You found the basement door! It's locked tight.";
    return spookyPage(
      "The Basement Door",
      `<h1>🚪 The Basement Door</h1><p>${msg}</p><p class="card">The keyhole is shaped like a bone. Maybe someone in this house wrote down the key.</p>${back}`,
    );
  }

  const body = rooms[room];
  if (body) return spookyPage(`Haunted House · ${room}`, `<p class="muted">The Haunted House</p>${body}`);
  return spookyPage(
    "Haunted House",
    `<h1>👻 Nothing here</h1><p>There's no room called “${clean(room)}”. Just cold air.</p>${back}`,
  );
}
