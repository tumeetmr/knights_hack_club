import { NextResponse } from "next/server";
import { contestStatus } from "@/lib/ctf/contest";
import { countPlayers, getContest, getLeaderboard } from "@/lib/ctf/queries";

/** Public, flag-free leaderboard snapshot the leaderboard page polls for live updates. */
export async function GET() {
  try {
    const [contest, rows, registered] = await Promise.all([getContest(), getLeaderboard(100), countPlayers()]);
    return NextResponse.json(
      {
        status: contestStatus(contest),
        registered,
        rows: rows.map(({ playerId, name, score, solved }) => ({ playerId, name, score, solved })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
