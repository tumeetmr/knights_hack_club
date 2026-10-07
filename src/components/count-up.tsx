"use client";

import { useEffect, useRef } from "react";
import { afterScrollRestore } from "./reveal";

/** Renders the final number on the server, then ticks up from 0 when scrolled into view. */
export function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = String(Math.round(to * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    const cancel = afterScrollRestore(() => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.textContent = "0";
      observer.observe(el);
    });

    return () => {
      cancel();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return <span ref={ref}>{to}</span>;
}
