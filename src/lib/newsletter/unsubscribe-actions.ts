"use server";

import { redirect } from "next/navigation";
import { setSubscribed } from "./subscription";
import { verifyUnsubscribe } from "./unsubscribe";

/** The button on /unsubscribe. The signed link is the only credential, so check it every time. */
export async function setSubscriptionAction(fd: FormData) {
  const u = fd.get("u");
  const t = fd.get("t");
  const id = verifyUnsubscribe(u, t);
  if (!id) redirect("/unsubscribe");
  await setSubscribed(id, fd.get("subscribe") === "1");
  redirect(`/unsubscribe?u=${id}&t=${encodeURIComponent(String(t))}`);
}
