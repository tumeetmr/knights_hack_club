import { NextResponse } from "next/server";
import { contestStatus } from "@/lib/ctf/contest";
import { countPlayers, getContest, getLeaderboard } from "@/lib/ctf/queries";

/** Public, flag-free snapshot for the landing page teaser. */
export async function GET() {
  try {
    const [contest, top, players] = await Promise.all([getContest(), getLeaderboard(3), countPlayers()]);
    return NextResponse.json(
      {
        title: contest.title,
        status: contestStatus(contest),
        startAt: contest.startAt,
        players,
        top: top.map((r) => ({ name: r.name, score: r.score })),
      },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } },
    );
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
