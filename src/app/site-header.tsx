"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DISCORD_URL, JOIN_FORM_URL } from "./links";
import { icons } from "./ui";

const links = [
  { href: "#about", label: "About" },
  { href: "#what-we-do", label: "What We Do" },
  { href: "#events", label: "Events" },
  { href: "#team", label: "Team" },
  { href: "#ctf", label: "CTF" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Close on Escape, and when the screen grows past the mobile layout.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(width >= 48rem)");
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", close);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full bg-ink/95 pl-2 pr-2 sm:h-16 sm:pl-2.5 sm:pr-2.5 text-white shadow-lg shadow-ink/20 ring-1 ring-white/10 md:pl-3">
        <a href="#top" className="flex items-center gap-2.5 sm:gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="size-10 shrink-0 rounded-full object-cover sm:size-11"
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
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Join our Discord"
            title="Join our Discord"
            className="ml-2 hidden size-11 place-items-center rounded-full bg-white/10 lg:grid transition hover:bg-[#5865F2] [&_svg]:size-5"
          >
            {icons.discord}
          </a>
          <a
            href={JOIN_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="roll ml-1 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-knight-300"
          >
            <span className="roll-label">
              <span>Join the Club ↗</span>
              <span aria-hidden>Join the Club ↗</span>
            </span>
          </a>
        </nav>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-white/10 transition active:scale-95 sm:size-11 md:hidden"
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

      <div
        className={`mx-auto grid max-w-7xl transition-[grid-template-rows,opacity,translate] duration-300 ease-out md:hidden motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none -translate-y-2 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            id="mobile-nav"
            aria-label="Main"
            inert={!open}
            className="mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-3xl bg-ink px-6 pb-3 pt-1 text-white shadow-2xl ring-1 ring-white/10"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="headline block border-b border-white/10 py-3.5 text-[2.25rem] transition-colors active:text-knight-300"
              >
                {link.label}
              </a>
            ))}
            <div className="grid gap-2 pb-2 pt-4">
              <a
                href={JOIN_FORM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white py-3.5 text-center font-bold text-ink transition active:scale-[0.98]"
              >
                Join the Club ↗
              </a>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#5865F2] py-3.5 font-bold text-white transition active:scale-[0.98] [&_svg]:size-5"
              >
                {icons.discord} Join our Discord ↗
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
