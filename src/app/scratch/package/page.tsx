import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Headline, panel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Workshop Package | Knights Hack Club",
  description: "Download the finished Scratch games and the block cheat sheet from the Make Your First Game workshop.",
};

const DIR = "/scratch-workshop";

const files = [
  {
    name: "Catch the Stars",
    file: "catch-the-stars.sb3",
    tag: "Game 1 · Easy",
    body: "Catch falling stars with a bowl. Shows variables, random numbers and touching.",
  },
  {
    name: "Flappy Bird",
    file: "flappy-bird.sb3",
    tag: "Game 2 · Medium",
    body: "Gravity, flapping, pipes and a score. Open it to see how the pieces fit together.",
  },
  {
    name: "Block cheat sheet",
    file: "block-cheat-sheet.pdf",
    tag: "Reference",
    body: "Every block we use, the steps for both games, and a fix-it list for when you're stuck.",
  },
];

const open = [
  { title: "Make a free Scratch account", body: "At scratch.mit.edu, then confirm your email so you can share projects." },
  { title: "Download a game", body: "Hit a download button above. Keep the .sb3 file as it is, don't unzip it." },
  { title: "Load it", body: "In the Scratch editor choose File → Load from your computer and pick the file." },
  { title: "Click the green flag", body: "Play it first, then poke around the blocks. Break things on purpose to see what changes." },
  { title: "Remix and share", body: "Change it, hit Share, then paste your link on the submit page." },
];

const dl =
  "group flex h-full flex-col justify-between gap-8 rounded-3xl bg-paper p-6 text-ink transition hover:bg-ink hover:text-white sm:p-8";

export default function WorkshopPackagePage() {
  return (
    <>
      <SiteHeader base="/" />
      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <section className={`${panel} bg-ink text-white`}>
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="glow absolute -right-32 -top-32 size-[320px] sm:size-[520px]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <Link
              href="/events/scratch-workshop"
              className="inline-flex min-h-10 items-center font-mono text-xs text-knight-300 hover:text-white sm:text-sm"
            >
              ← Scratch workshop
            </Link>
            <Headline as="h1" onLoad lines={["Workshop", "package."]} className="mt-4 text-[clamp(3rem,10vw,8rem)]" />
            <p className="rise mt-6 max-w-2xl text-lg text-white/75 sm:text-xl" style={{ "--d": "400ms" } as CSSProperties}>
              The finished games and a cheat sheet from Scratch: Make Your First Game. Missed the session or want a
              reference while you build? Everything is here.
            </p>
          </div>
        </section>

        <section id="downloads" className={`${panel} bg-grid-blue text-white`}>
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="font-mono text-xs font-medium tracking-wider text-white/70">{"> downloads"}</p>
            <ul className="mt-8 grid gap-3 sm:gap-4 lg:grid-cols-3">
              {files.map((f, i) => (
                <li key={f.file} data-reveal="up" style={{ "--d": `${i * 80}ms` } as CSSProperties}>
                  <a href={`${DIR}/${f.file}`} download className={dl}>
                    <span>
                      <span className="font-mono text-xs font-medium uppercase tracking-wider text-knight-600 transition group-hover:text-knight-300">
                        {f.tag}
                      </span>
                      <span className="mt-3 block text-2xl font-bold tracking-tight sm:text-3xl">{f.name}</span>
                      <span className="mt-2 block text-ink/60 transition group-hover:text-white/60">{f.body}</span>
                    </span>
                    <span className="flex items-center justify-between gap-4 font-mono text-sm">
                      {f.file}
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-current text-xl transition group-hover:bg-white group-hover:text-ink"
                        aria-hidden
                      >
                        ↓
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="open" className={`${panel} bg-paper`}>
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[22rem_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-mono text-xs font-medium tracking-wider text-knight-600">{"> how to open them"}</p>
              <Headline lines={["Five", "steps."]} className="mt-6 text-[clamp(4rem,12vw,8rem)]" />
            </div>
            <ol className="relative">
              {open.map((s, i) => (
                <li
                  key={s.title}
                  data-reveal="up"
                  style={{ "--d": `${i * 60}ms` } as CSSProperties}
                  className="grid grid-cols-[3.5rem_1fr] gap-4 border-t-2 border-knight-600/15 py-6 last:border-b-2 sm:grid-cols-[5rem_1fr] sm:gap-8 sm:py-8"
                >
                  <p className="headline pt-1 text-3xl text-knight-600 sm:text-5xl">{i + 1}</p>
                  <div>
                    <h3 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink/70 sm:text-lg">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${panel} bg-knight-gradient text-white`}>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
            <Headline lines={["Built something?"]} className="text-[clamp(2.5rem,8vw,4.5rem)]" />
            <Link
              href="/scratch/submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-7 font-bold text-ink transition hover:bg-ink hover:text-white sm:w-auto"
            >
              Submit your project
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
