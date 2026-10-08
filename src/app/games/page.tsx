import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { games } from "@/lib/games/catalog";

export const metadata: Metadata = {
  title: "Games | Knights Hack Club",
  description: "Quick multiplayer games about coding and AI. Grab your phone and play with friends, no experience needed.",
};

export default function GamesPage() {
  return (
    <>
      <SiteHeader base="/" />
      <main id="top" className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <section className="relative overflow-clip rounded-[2rem] bg-ink text-white lg:rounded-[2.5rem]">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="glow absolute -right-32 -top-32 size-[320px] sm:size-[520px]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <p className="font-mono text-xs text-knight-300 sm:text-sm">{"> games --list"}</p>
            <h1 className="headline mt-4 text-[clamp(3.5rem,11vw,8.5rem)]">Club games</h1>
            <p className="mt-4 max-w-xl text-white/70">
              Quick multiplayer games about coding and AI. Grab your phone, play with friends. No experience
              needed.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] bg-paper lg:rounded-[2.5rem]">
          <ul className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2">
            {games.map((game) => (
              <li key={game.slug} className="flex flex-col rounded-3xl bg-mist p-6 sm:p-8">
                <p className="text-5xl" aria-hidden>
                  {game.emoji}
                </p>
                <h2 className="headline mt-4 text-5xl">{game.title}</h2>
                <p className="mt-1 font-semibold text-knight-600">{game.tagline}</p>
                <p className="mt-4 text-ink/70">{game.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {game.topics.map((topic) => (
                    <li key={topic} className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                      {topic}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-xs text-ink/50">{game.players}</p>
                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  <Link
                    href={`/games/${game.slug}`}
                    className="inline-flex min-h-12 items-center rounded-full bg-ink px-7 font-bold text-white transition hover:bg-knight-600"
                  >
                    Play
                  </Link>
                  <Link
                    href={`/games/${game.slug}/screen`}
                    className="inline-flex min-h-12 items-center rounded-full px-5 font-semibold text-ink/70 ring-2 ring-ink/15 transition hover:text-ink hover:ring-ink/40"
                  >
                    Projector screen
                  </Link>
                </div>
              </li>
            ))}
            <li className="grid place-items-center rounded-3xl border-2 border-dashed border-ink/15 p-6 text-center text-ink/50 sm:p-8">
              More games coming soon.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
