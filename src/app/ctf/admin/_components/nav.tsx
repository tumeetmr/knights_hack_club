"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string; exact?: boolean; also?: string[] };

export const adminNav: { heading: string; items: Item[] }[] = [
  {
    heading: "",
    items: [{ href: "/ctf/admin", label: "Overview", icon: "▦", exact: true }],
  },
  {
    heading: "CTF",
    items: [
      { href: "/ctf/admin/challenges", label: "Challenges", icon: "⚑", also: ["/ctf/admin/import"] },
      { href: "/ctf/admin/players", label: "Players", icon: "☺" },
      { href: "/ctf/admin/settings", label: "Settings", icon: "⚙" },
    ],
  },
  {
    heading: "Club",
    items: [
      { href: "/ctf/admin/hackathon", label: "Hackathon", icon: "★" },
      { href: "/ctf/admin/scratch", label: "Scratch", icon: "✎" },
    ],
  },
];

function useIsActive() {
  const path = usePathname();
  return (i: Item) => (i.exact ? path === i.href : [i.href, ...(i.also ?? [])].some((h) => path.startsWith(h)));
}

/** Left sidebar on desktop. */
export function SidebarNav() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {adminNav.map((group, g) => (
        <div key={g} className="flex flex-col gap-1">
          {group.heading && (
            <p className="px-3 pb-1 font-mono text-[0.625rem] font-bold uppercase tracking-widest text-ink/40">
              {group.heading}
            </p>
          )}
          {group.items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  active ? "bg-ink text-white" : "text-ink/70 hover:bg-mist hover:text-ink"
                }`}
              >
                <span aria-hidden className="w-4 text-center opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Scrollable tab strip on phones and tablets. */
export function TopNav() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Admin" className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
      {adminNav.flatMap((g) => g.items).map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-bold transition ${
              active ? "border-knight-600 text-ink" : "border-transparent text-ink/55 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
