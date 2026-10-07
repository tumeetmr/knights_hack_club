"use client";

import { useEffect } from "react";

/**
 * Runs `fn` once the page has loaded and the browser has restored the scroll
 * position. On a refresh mid-page, measuring any earlier would see the top of the
 * page and hide content that is about to be on screen. Returns a cleanup.
 */
export function afterScrollRestore(fn: () => void) {
  let frame = 0;
  const run = () => {
    frame = requestAnimationFrame(fn);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.removeEventListener("load", run);
    cancelAnimationFrame(frame);
  };
}

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

    const cancel = afterScrollRestore(() => {
      for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
        if (el.getBoundingClientRect().top > window.innerHeight) {
          el.dataset.revealState = "pending";
          observer.observe(el);
        }
      }
    });

    return () => {
      cancel();
      observer.disconnect();
    };
  }, []);

  return null;
}
