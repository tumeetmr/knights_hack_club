"use client";

import { useEffect } from "react";

/**
 * Page-level effects for the hackathon microsite:
 * - `[data-kh]` elements below the fold fade up when scrolled into view,
 * - `--scroll` on <html> (0 to 1) drives the progress bar.
 * Nothing is hidden without JS, and reduced motion skips the reveals.
 */
export function HackathonFx() {
  useEffect(() => {
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--scroll", String(max > 0 ? window.scrollY / max : 0));
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.khIn = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    if (!still) {
      for (const el of document.querySelectorAll<HTMLElement>("[data-kh]")) {
        if (el.getBoundingClientRect().top > window.innerHeight) {
          el.dataset.khWait = "";
          io.observe(el);
        }
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      root.style.removeProperty("--scroll");
    };
  }, []);

  return null;
}
