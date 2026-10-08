"use server";

import { getStudent } from "@/lib/auth/session";
import { clientIp, tooMany } from "@/lib/rate-limit";
import type { PlaceResult } from "./config";
import { placePixel } from "./wall";

export async function placePixelAction(x: number, y: number, color: string): Promise<PlaceResult> {
  const student = await getStudent();
  if (!student) return { ok: false, error: "Sign in to place pixels.", signIn: true };

  // The real 30s cooldown lives in the database. This only stops one network hammering the endpoint.
  if (tooMany(`pixel-ip:${await clientIp()}`, 300, 60_000)) {
    return { ok: false, error: "Too many pixels from this network. Try again in a minute." };
  }
  try {
    return await placePixel(student.id, x, y, color);
  } catch {
    return { ok: false, error: "Couldn't place that pixel. Try again." };
  }
}
