import { NextRequest, NextResponse } from "next/server";

// Halloween CTF "Ghost Registry API": a tiny read-only JSON API. The list skips ghost #4,
// and asking for /ghosts/4 directly reveals it. Teaches reading JSON and guessing API paths.
const BASE = "/ctf-lab/ghost-api";

const ghosts = [
  { id: 1, name: "Casper Jr.", haunts: "the school library", scariness: 1, note: "Only wants a friend." },
  { id: 2, name: "Lady Moanalot", haunts: "the girls' washroom", scariness: 4, note: "Very dramatic." },
  { id: 3, name: "Sir Clanksalot", haunts: "the gym storage room", scariness: 3, note: "Drags chains during basketball practice." },
  { id: 4, name: "The Flag Phantom", haunts: "this API", scariness: 10, note: "You found me. Take this and run.", flag: "KH{ghost_number_four_found}" },
  { id: 5, name: "Wifi Wraith", haunts: "the computer lab", scariness: 7, note: "Why your downloads stop at 99%." },
  { id: 6, name: "Mr. Boo-lean", haunts: "the math wing", scariness: 2, note: "Can only say true or false." },
];

/** Left out of the list, but still readable by id. */
const HIDDEN = new Set([4]);

const json = (data: unknown, status = 200) =>
  new NextResponse(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });

export async function GET(_req: NextRequest, { params }: RouteContext<"/ctf-lab/ghost-api/[[...path]]">) {
  const path = (await params).path ?? [];

  if (path.length === 0) {
    return json({
      api: "Ghost Registry",
      version: "1.0",
      message: "Welcome! This API lists every registered ghost in the school.",
      endpoints: {
        all_ghosts: `${BASE}/ghosts`,
        one_ghost: `${BASE}/ghosts/{id}`,
      },
    });
  }

  if (path[0] === "ghosts" && path.length === 1) {
    const visible = ghosts.filter((g) => !HIDDEN.has(g.id)).map(({ id, name, haunts }) => ({ id, name, haunts, details: `${BASE}/ghosts/${id}` }));
    return json({ count: visible.length, ghosts: visible });
  }

  if (path[0] === "ghosts" && path.length === 2) {
    const ghost = ghosts.find((g) => String(g.id) === path[1]);
    if (!ghost) return json({ error: `No ghost with id "${path[1].slice(0, 20)}". Spooky.` }, 404);
    return json(ghost);
  }

  return json({ error: "Unknown endpoint. Try the API home.", home: BASE }, 404);
}
