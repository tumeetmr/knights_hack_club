"use client";

import Image from "next/image";
import { useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#what-we-do", label: "What We Do" },
  { href: "#events", label: "Events" },
  { href: "#team", label: "Team" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full bg-ink/80 pl-2.5 pr-2.5 text-white shadow-lg shadow-ink/20 ring-1 ring-white/10 backdrop-blur-md sm:pl-3">
        <a href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="rounded-full"
            preload
          />
          <span className="headline text-xl leading-none">
            Knights Hack
            <span className="block font-mono text-[0.625rem] font-medium normal-case tracking-normal text-white/55 [font-variation-settings:normal]">
              An NCSAC Club
            </span>
          </span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#join"
            className="roll ml-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-knight-300"
          >
            <span className="roll-label">
              <span>Join the Club</span>
              <span aria-hidden>Join the Club</span>
            </span>
          </a>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full bg-white/10 md:hidden"
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
          className="mx-auto mt-2 max-w-7xl rounded-3xl bg-ink px-6 pb-4 pt-2 text-white shadow-2xl ring-1 ring-white/10 md:hidden"
        >
          {[...links, { href: "#join", label: "Join the Club" }].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="headline block border-b border-white/10 py-4 text-4xl last:border-b-0 last:text-knight-300"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
