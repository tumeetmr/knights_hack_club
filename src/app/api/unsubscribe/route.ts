import { setSubscribed } from "@/lib/newsletter/subscription";
import { verifyUnsubscribe } from "@/lib/newsletter/unsubscribe";

/**
 * One-click unsubscribe (RFC 8058) from the List-Unsubscribe header: Gmail and Apple Mail
 * POST here when someone presses their built-in "Unsubscribe" button.
 */
export async function POST(req: Request) {
  const params = new URL(req.url).searchParams;
  const id = verifyUnsubscribe(params.get("u"), params.get("t"));
  if (!id) return new Response("Invalid link", { status: 400 });
  await setSubscribed(id, false);
  return new Response("Unsubscribed");
}
