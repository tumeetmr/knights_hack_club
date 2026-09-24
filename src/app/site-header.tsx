"use client";

import Image from "next/image";
import { useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#what-we-do", label: "What We Do" },
  { href: "#events", label: "Events" },
  { href: "#team", label: "Team" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="rounded-md"
            preload
          />
          <span className="font-display text-lg font-extrabold leading-none tracking-tight">
            Knights Hack
            <span className="block text-xs font-semibold tracking-normal text-white/60">
              An NCSAC Club
            </span>
          </span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#join"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-knight-300"
          >
            Join the Club
          </a>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-white/20 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-white transition ${open ? "translate-y-[5px] rotate-45" : ""}`}
            />
            <span
              className={`absolute bottom-0 left-0 h-0.5 w-5 bg-white transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-white/10 px-5 pb-6 md:hidden"
        >
          {[...links, { href: "#join", label: "Join the Club" }].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/10 py-4 font-display text-2xl font-bold"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
