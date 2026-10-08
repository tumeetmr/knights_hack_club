import { NextResponse, type NextRequest } from "next/server";
import { getChanges, getWall } from "@/lib/pixels/wall";

/**
 * Public Pixel Wall state. No ?since= returns the whole wall; ?since=<cursor> returns only newer
 * placements. Every viewer polls this, so the CDN may serve it for a second.
 */
export async function GET(req: NextRequest) {
  const since = Number(req.nextUrl.searchParams.get("since"));
  try {
    const body = Number.isInteger(since) && since > 0 ? await getChanges(since) : await getWall();
    return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=1, stale-while-revalidate=1" } });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
