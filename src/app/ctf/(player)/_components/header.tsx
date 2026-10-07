"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutPlayerAction } from "@/lib/ctf/player-actions";

const links = [
  { href: "/ctf", label: "Problems" },
  { href: "/ctf/leaderboard", label: "Leaderboard" },
];

export function CtfHeader({ player }: { player: { name: string } | null }) {
  const path = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 rounded-full bg-ink/85 pl-2 pr-2 text-white shadow-lg shadow-ink/20 ring-1 ring-white/10 backdrop-blur-md sm:h-16 sm:pl-2.5 sm:pr-2.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Knights Hack home">
          <Image src="/logo.png" alt="" width={44} height={44} className="size-10 rounded-full object-cover sm:size-11" preload />
          <span className="headline hidden text-xl leading-none min-[420px]:block">
            Knights Hack
            <span className="block font-mono text-[0.625rem] font-medium normal-case tracking-normal text-knight-300 [font-variation-settings:normal]">
              CTF
            </span>
          </span>
        </Link>

        <nav aria-label="CTF" className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/ctf" ? path === "/ctf" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition sm:px-4 ${
                  active ? "bg-white text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          {player ? (
            <>
              <span className="hidden max-w-32 truncate px-2 text-sm font-medium text-white/75 md:block">{player.name}</span>
              <form action={logoutPlayerAction}>
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
              href="/ctf/register"
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
