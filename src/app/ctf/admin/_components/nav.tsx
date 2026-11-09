"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const main = [
  { href: "/ctf/admin", label: "Overview", exact: true },
  { href: "/ctf/admin/challenges", label: "Challenges", also: ["/ctf/admin/import"] },
  { href: "/ctf/admin/players", label: "Players" },
  { href: "/ctf/admin/settings", label: "Settings" },
];

const more = [
  { href: "/ctf/admin/newsletter", label: "Newsletter" },
  { href: "/ctf/admin/availability", label: "Availability email" },
  { href: "/ctf/admin/scratch", label: "Scratch" },
  { href: "/ctf/admin/hackathon", label: "Hackathon" },
];

export function AdminNav() {
  const path = usePathname();
  const is = (href: string, exact?: boolean, also: string[] = []) =>
    exact ? path === href : [href, ...also].some((h) => path.startsWith(h));
  const moreActive = more.some((m) => is(m.href));

  const tab = (active: boolean) =>
    `shrink-0 border-b-2 px-3 py-3 text-sm font-bold transition sm:px-4 ${
      active ? "border-knight-600 text-ink" : "border-transparent text-ink/55 hover:text-ink"
    }`;

  return (
    <nav aria-label="Admin" className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
      {main.map((t) => {
        const active = is(t.href, t.exact, t.also);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={tab(active)}>
            {t.label}
          </Link>
        );
      })}
      <details key={path} className="group relative">
        <summary className={`${tab(moreActive)} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
          More ▾
        </summary>
        <div className="absolute left-0 top-full z-30 mt-1 min-w-48 rounded-xl bg-paper p-1 shadow-lg ring-1 ring-ink/10">
          {more.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-mist ${
                is(m.href) ? "text-knight-600" : "text-ink"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
