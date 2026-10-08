import { NextResponse } from "next/server";
import { getStudent } from "@/lib/auth/session";
import type { PixelMe } from "@/lib/pixels/config";
import { getWaitMs } from "@/lib/pixels/wall";

/** Who's viewing the Pixel Wall and when they can place next. Kept out of the page so it stays static. */
export async function GET() {
  try {
    const student = await getStudent();
    const body: PixelMe = student
      ? { name: student.name, waitMs: await getWaitMs(student.id) }
      : { name: null, waitMs: 0 };
    return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
