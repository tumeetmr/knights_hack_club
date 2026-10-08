"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { registerHref } from "@/lib/auth/next";

const links = [
  // Short labels keep the bar on one line on 360px phones.
  { href: "/ctf", label: "Challenges", short: "Play" },
  { href: "/ctf/leaderboard", label: "Leaderboard", short: "Ranks" },
];

export function CtfHeader({ player }: { player: { name: string } | null }) {
  const path = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 rounded-full bg-ink/95 pl-4 pr-2 text-white shadow-lg shadow-ink/20 ring-1 ring-white/10 sm:h-16 sm:pl-5 sm:pr-2.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Knights Hack home">
          <Image src="/logo.png" alt="" width={48} height={45} className="h-9 w-auto shrink-0 sm:h-10" preload />
          <span className="headline hidden text-xl leading-none min-[420px]:block">
            Knights Hack
            <span className="block font-mono text-[0.625rem] font-medium normal-case tracking-normal text-knight-300 [font-variation-settings:normal]">
              CTF
            </span>
          </span>
        </Link>

        <nav aria-label="CTF" className="flex min-w-0 items-center gap-1">
          {links.map((l) => {
            const active =
              l.href === "/ctf" ? path === "/ctf" || path.startsWith("/ctf/challenges/") : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-label={l.label}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
                  active ? "bg-white text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="sm:hidden">{l.short}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          {player ? (
            <>
              <span className="hidden max-w-32 truncate px-2 text-sm font-medium text-white/75 md:block">{player.name}</span>
              <form action={logoutAction}>
                <input type="hidden" name="next" value="/ctf" />
                <button
                  type="submit"
                  className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20 active:scale-95"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href={registerHref("/ctf")}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-knight-300 active:scale-95 sm:px-5"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
