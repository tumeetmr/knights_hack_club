"use client";

import { useEffect } from "react";

/**
 * Animates `[data-reveal]` elements in as they scroll into view.
 * Only elements that start below the fold are hidden, so nothing that is
 * already on screen flashes, and without JS everything simply stays visible.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealState = "in";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.dataset.revealState = "pending";
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
