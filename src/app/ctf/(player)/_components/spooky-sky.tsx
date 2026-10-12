import type { CSSProperties } from "react";

const bats = [
  { top: "22%", left: "62%", size: "1.75rem", t: "7s", x: "-60px", y: "-20px", d: "0ms" },
  { top: "34%", left: "78%", size: "1.25rem", t: "9s", x: "40px", y: "-28px", d: "-2s" },
  { top: "16%", left: "86%", size: "1rem", t: "6s", x: "-30px", y: "16px", d: "-4s" },
  { top: "48%", left: "92%", size: "1.4rem", t: "8s", x: "-50px", y: "-10px", d: "-1s" },
];

/** Halloween dressing for the dark hero panels: a moon, a purple haze, a cobweb and a few bats. */
export function SpookySky() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="glow glow-purple absolute -bottom-40 -left-24 size-[300px] sm:size-[460px]" />
      <div className="absolute right-6 top-24 size-20 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff7e0,#fde68a_45%,#f59e0b)] opacity-90 shadow-[0_0_80px_20px_rgb(253_230_138/0.25)] sm:right-14 sm:top-28 sm:size-32" />
      {bats.map((b, i) => (
        <span
          key={i}
          className="bat hidden min-[480px]:block"
          style={{ top: b.top, left: b.left, fontSize: b.size, "--bat-t": b.t, "--bat-x": b.x, "--bat-y": b.y, "--d": b.d } as CSSProperties}
        >
          <span>🦇</span>
        </span>
      ))}
      <svg viewBox="0 0 120 120" className="absolute left-0 top-0 size-28 text-white/15 sm:size-40" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 0 L120 40 M0 0 L90 90 M0 0 L40 120" />
        <path d="M0 30 Q15 18 24 9 M0 60 Q30 36 48 18 M0 90 Q45 54 72 24 M15 120 Q48 72 96 32" />
      </svg>
    </div>
  );
}
