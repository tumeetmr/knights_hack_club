"use client";

import { useEffect, useRef, useState } from "react";

type Step = {
  label: string;
  title: string;
  kicker: string;
  body: string;
  snippet: string;
};

/**
 * On large screens the section is three viewports tall and the card sticks
 * while scroll progress picks the active step. On small screens the steps
 * simply stack.
 */
export function Steps({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.999);
      setActive(Math.floor(progress * steps.length));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  return (
    <div ref={ref} className="relative lg:h-[300vh]">
      <div className="px-3 py-20 sm:px-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:items-center lg:py-0">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-paper text-ink shadow-2xl shadow-knight-900/30">
          <div className="flex h-14 items-stretch justify-between border-b border-ink/10">
            <p className="flex items-center px-6 font-mono text-xs font-medium uppercase tracking-wider text-knight-600">
              What we do / 3 steps
            </p>
            <div className="hidden items-stretch lg:flex" aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={s.label}
                  className={`grid w-16 place-items-center border-l border-ink/10 font-mono text-sm font-bold transition-colors duration-500 ${
                    i === active ? "bg-knight-600 text-white" : "text-ink/40"
                  }`}
                >
                  0{i + 1}
                </span>
              ))}
            </div>
          </div>

          <ol className="grid">
            {steps.map((s, i) => (
              <li
                key={s.label}
                aria-current={i === active ? "step" : undefined}
                className={`grid gap-8 border-ink/10 p-6 not-first:border-t sm:p-10 lg:col-start-1 lg:row-start-1 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-14 lg:border-t-0 lg:p-14 lg:transition-all lg:duration-700 ${
                  i === active
                    ? "lg:translate-y-0 lg:opacity-100"
                    : "lg:pointer-events-none lg:translate-y-8 lg:opacity-0"
                }`}
              >
                <div>
                  <p className="headline text-[clamp(5rem,14vw,11rem)] text-knight-600">
                    0{i + 1}
                  </p>
                  <h3 className="headline mt-4 text-5xl sm:text-7xl">{s.title}</h3>
                </div>
                <div>
                  <p className="font-mono text-xs font-medium uppercase tracking-wider text-knight-600">
                    {s.label} / {s.kicker}
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-ink/75">{s.body}</p>
                  <pre className="mt-8 overflow-x-auto rounded-2xl bg-ink p-5 font-mono text-sm leading-relaxed text-knight-300">
                    {s.snippet}
                  </pre>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
