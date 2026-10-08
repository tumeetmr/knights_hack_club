import type { Metadata } from "next";
import { JOIN_FORM_URL } from "@/lib/links";
import { JoinCard, LinkQr } from "./_components/link-qr";

export const metadata: Metadata = {
  title: "Club Launch | Knights Hack Club",
  description: "Knights Hack Club launch: meet & greet, games and a CTF. No experience needed.",
};

// Wide, heavy cut of Archivo to match the launch poster (the site default is condensed).
const wide = { fontVariationSettings: '"wdth" 118' };

/** Full-screen display for the launch table: mirrors the poster, with live QR codes. */
export default function LaunchPage() {
  return (
    <main className="relative flex min-h-svh flex-col gap-[2.5vh] overflow-hidden bg-[#1f4df0] p-4 text-white sm:p-[3vh] lg:h-svh">
      <span className="pointer-events-none absolute left-[46%] hidden lg:block top-[42%] text-[6vh] leading-none" aria-hidden>
        ✦
      </span>
      <span className="pointer-events-none absolute bottom-[3%] right-[2%] text-[4vh] leading-none" aria-hidden>
        ✦
      </span>

      <header className="flex items-start justify-between gap-4">
        <p className="text-[min(2.2vh,3.4vw,1.5rem)] font-extrabold uppercase tracking-wide" style={wide}>
          Niagara College / Fall 2026
        </p>
        <div className="rounded-xl bg-gradient-to-br from-[#2f6bff] to-[#5aa2ff] px-[2vh] py-[1.2vh] text-center shadow-lg ring-1 ring-white/20">
          <p className="font-mono text-[clamp(0.75rem,1.8vh,1.25rem)] font-bold">&lt;/&gt;</p>
          <p
            className="text-[clamp(0.75rem,2vh,1.4rem)] font-black uppercase leading-[0.95]"
            style={wide}
          >
            Knights
            <br />
            Hack Club
          </p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-[3vh] lg:grid-cols-[1.15fr_1fr] lg:gap-[4vh]">
        {/* Left: headline, terminal, details */}
        <section className="flex min-h-0 min-w-0 flex-col gap-[2.5vh]">
          <h1
            className="text-[min(15vh,17vw,12rem)] font-black uppercase leading-[0.85] tracking-tight"
            style={wide}
          >
            Club
            <br />
            Launch.
          </h1>

          <div className="flex min-h-[10rem] flex-1 flex-col overflow-hidden rounded-2xl border-4 border-white/80 bg-ink shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/15 px-4 py-2">
              <span className="size-3 rounded-full bg-white/30" />
              <span className="size-3 rounded-full bg-white/30" />
              <span className="size-3 rounded-full bg-white/30" />
              <span className="ml-3 font-mono text-xs text-white/50">knights@niagara:~</span>
            </div>
            <div className="flex flex-1 flex-col justify-center px-[min(4vh,5vw)] font-mono font-bold uppercase leading-[1.05]">
              <p className="text-[min(7.5vh,11vw,6rem)]">Hello,</p>
              <p className="caret text-[min(7.5vh,11vw,6rem)]">Knights.</p>
            </div>
          </div>

          <div>
            <p
              className="bg-[#e8ff4a] px-4 py-[1vh] text-center text-[min(3.4vh,4.6vw,2.5rem)] font-black uppercase text-ink"
              style={wide}
            >
              Today / Oct 8 / 2:00 – 3:50 PM
            </p>
            <p
              className="mt-[1.2vh] text-center text-[min(2.8vh,4.2vw,2rem)] font-extrabold uppercase"
              style={wide}
            >
              Meet &amp; Greet · Outside the Core
            </p>
            <p className="text-center text-[clamp(0.875rem,2vh,1.4rem)] font-semibold text-white/85">
              Niagara College · Welland Campus
            </p>
          </div>
        </section>

        {/* Right: QR codes */}
        <section className="flex min-h-0 min-w-0 flex-col gap-[2.5vh]">
          <div className="grid h-[50vh] min-h-0 grid-cols-2 gap-[2vh] lg:h-auto lg:flex-1">
            <LinkQr title="Play Games" path="/games" />
            <LinkQr title="Play the CTF" path="/ctf" />
          </div>
          <div className="flex h-[22vh] min-h-0 lg:h-[24vh]">
            <JoinCard href={JOIN_FORM_URL} />
          </div>
          <div className="text-center">
            <p
              className="text-[min(4vh,6vw,3rem)] font-black uppercase text-[#e8ff4a]"
              style={wide}
            >
              No experience needed
            </p>
            <p className="text-[clamp(0.875rem,2vh,1.4rem)] font-semibold text-white/85">
              Members and non-members welcome. Bring a laptop or phone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
