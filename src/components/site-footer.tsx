import Image from "next/image";
import { CONTACT_EMAIL, DISCORD_URL, JOIN_FORM_URL } from "@/lib/links";
import { RollLink, icons } from "./ui";

export const COPYRIGHT = "© 2026 Knights Hack Club · Niagara College · Built by students, for students.";

const links = [
  ["#about", "About"],
  ["#what-we-do", "What We Do"],
  ["#events", "Events"],
  ["#team", "Team"],
  ["/ctf", "CTF"],
  ["#faq", "FAQ"],
];

/** Full footer for the landing page; its section links point at anchors on that page. */
export function SiteFooter() {
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 pb-10 pt-12 sm:px-8 sm:pt-16 md:gap-10 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr]">
          <div className="col-span-2 flex items-start gap-4 md:col-span-1">
            <Image src="/logo.png" alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl object-contain" />
            <p className="max-w-xs text-sm text-white/60">
              A student club of the Niagara College Student Administrative
              Council (NCSAC).
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">Club</p>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map(([href, label]) => (
                <li key={href}>
                  <a className="underline-offset-4 hover:text-knight-300 hover:underline" href={href}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="col-span-2 row-start-3 md:col-span-1 md:row-start-auto">
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">Say hello</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 block break-all text-sm underline-offset-4 hover:text-knight-300 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm underline-offset-4 hover:text-knight-300 hover:underline [&_svg]:size-4"
            >
              {icons.discord} Join our Discord ↗
            </a>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/40">Let&apos;s build</p>
            <RollLink href={JOIN_FORM_URL} external className="mt-4 bg-white px-6 py-3 text-sm text-ink hover:bg-knight-300">
              Join the Club ↗
            </RollLink>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p
            className="headline bg-knight-gradient select-none bg-clip-text pb-2 text-center text-[14.5vw] text-transparent xl:text-[13.5rem]"
            aria-hidden
          >
            Knights Hack
          </p>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-4 gap-y-3 px-5 py-6 text-xs text-white/40 sm:px-8">
            <p>{COPYRIGHT}</p>
            <a href="#top" className="hover:text-white">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
