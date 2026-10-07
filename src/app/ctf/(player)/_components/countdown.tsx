"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Ticking d/h/m/s to a moment; refreshes the page when it arrives so state flips on its own. */
export function Countdown({ to, className = "" }: { to: string; className?: string }) {
  const router = useRouter();
  // Null until mounted so server and client markup match.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(to).getTime();
    let done = false;
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      setLeft(ms);
      if (ms === 0 && !done) {
        done = true;
        router.refresh();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to, router]);

  const s = Math.floor((left ?? 0) / 1000);
  const parts = [
    ["days", Math.floor(s / 86400)],
    ["hrs", Math.floor((s % 86400) / 3600)],
    ["min", Math.floor((s % 3600) / 60)],
    ["sec", s % 60],
  ] as const;

  return (
    <div className={`flex gap-2 sm:gap-3 ${className}`} role="timer" aria-label="Time remaining">
      {parts.map(([unit, n]) => (
        <div key={unit} className="min-w-16 rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15 sm:min-w-20 sm:px-4">
          <p className="headline text-4xl tabular-nums sm:text-5xl">{left === null ? "--" : pad(n)}</p>
          <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-wider text-white/55">{unit}</p>
        </div>
      ))}
    </div>
  );
}
