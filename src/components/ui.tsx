import type { CSSProperties, ReactNode } from "react";

export const TOTAL_SECTIONS = 8;

/** Condensed all-caps heading whose words flip in, either on load or on scroll. */
export function Headline({
  lines,
  as: Tag = "h2",
  onLoad = false,
  className = "",
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3";
  onLoad?: boolean;
  className?: string;
}) {
  // Word index where each line starts, so the stagger runs across lines.
  const starts = lines.map((_, i) =>
    lines.slice(0, i).reduce((n, line) => n + line.split(" ").length, 0),
  );

  return (
    <Tag
      className={`headline ${onLoad ? "headline-load" : ""} ${className}`}
      data-reveal={onLoad ? undefined : "words"}
    >
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, li) => (
        <span key={line} className="headline-line" aria-hidden>
          {line.split(" ").map((word, wi) => (
            <span key={wi}>
              {wi > 0 && " "}
              <span className="word" style={{ "--i": starts[li] + wi } as CSSProperties}>
                {word}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

const blockTones = {
  light: "bg-paper text-ink ring-ink/10",
  mist: "bg-mist text-ink ring-ink/5",
  dark: "bg-white/5 text-white ring-white/15",
};

/** Small label card: a caption and icon cell on top, a short body underneath. */
export function SectionBlock({
  label,
  icon,
  tone = "light",
  className = "",
  children,
}: {
  label: string;
  icon: ReactNode;
  tone?: keyof typeof blockTones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-reveal="up"
      className={`overflow-hidden rounded-2xl ring-1 ${blockTones[tone]} ${className}`}
    >
      <div className="flex h-14 items-stretch justify-between border-b border-current/10">
        <p className="flex items-center px-5 font-mono text-xs font-medium uppercase tracking-wider opacity-70">
          {label}
        </p>
        <span className="grid w-14 place-items-center border-l border-current/10" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="p-5 leading-relaxed">{children}</div>
    </div>
  );
}

export function SectionCounter({ n, className = "" }: { n: number; className?: string }) {
  return (
    <p className={`font-mono text-xs font-medium tracking-wider ${className}`} aria-hidden>
      {String(n).padStart(2, "0")} / {String(TOTAL_SECTIONS).padStart(2, "0")}
    </p>
  );
}

/** Pill link whose label rolls up to a duplicate on hover. */
export function RollLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: string;
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={`roll inline-flex items-center justify-center rounded-full px-7 py-4 font-bold transition-[color,background-color,border-color,scale] active:scale-[0.98] ${className}`}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className="roll-label">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </a>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const icons = {
  star: (
    <svg {...iconProps} fill="currentColor" stroke="none">
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" />
    </svg>
  ),
  code: (
    <svg {...iconProps}>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />
    </svg>
  ),
  calendar: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  people: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
    </svg>
  ),
  smile: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 14.5a5 5 0 0 0 8 0M9 9.5h.01M15 9.5h.01" />
    </svg>
  ),
  chart: (
    <svg {...iconProps}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
  pin: (
    <svg {...iconProps}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  discord: (
    <svg {...iconProps} fill="currentColor" stroke="none">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.011c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z" />
    </svg>
  ),
};
