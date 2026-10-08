"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/ctf/admin", label: "Overview", match: (p: string) => p === "/ctf/admin" },
  {
    href: "/ctf/admin/challenges",
    label: "Challenges",
    match: (p: string) => p.startsWith("/ctf/admin/challenges") || p.startsWith("/ctf/admin/import"),
  },
  { href: "/ctf/admin/players", label: "Players", match: (p: string) => p.startsWith("/ctf/admin/players") },
  { href: "/ctf/admin/settings", label: "Settings", match: (p: string) => p.startsWith("/ctf/admin/settings") },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = t.match(path);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-bold transition sm:px-4 ${
              active ? "border-knight-600 text-ink" : "border-transparent text-ink/55 hover:border-ink/20 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
