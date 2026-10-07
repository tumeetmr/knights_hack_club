"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-fetches the page's server data on an interval while the tab is visible, and
 * right away when the player switches back to it (e.g. from a challenge tab).
 */
export function AutoRefresh({ every = 20_000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      last = Date.now();
      router.refresh();
    };
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, every);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - last > 5_000) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, every]);
  return null;
}
