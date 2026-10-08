"use client";

import { useState } from "react";
import type { Socket } from "socket.io-client";
import {
  VAULT_CRACKERS_NAMESPACE,
  type ClientToServerEvents,
  type ScreenStats,
  type ServerToClientEvents,
} from "@shared/games/vault-crackers";
import { useGameSocket } from "@/lib/games/use-game-socket";
import { ConnectionBanner } from "../../_components/connection-banner";
import { JoinQr } from "../../_components/join-qr";

type VaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const steps = [
  ["Scan & pick a nickname", "No account, no install."],
  ["Get a partner", "Get paired with someone new, or start a crew with friends."],
  ["Crack the code", "Each phone holds part of a tiny program. Talk it through and type what it prints."],
] as const;

/** Projector view: join QR, how-to-play, and a live (score-free) feed of cracked vaults. */
export function VaultCrackersScreen() {
  const [stats, setStats] = useState<ScreenStats | null>(null);
  const { connected } = useGameSocket<VaultSocket>(VAULT_CRACKERS_NAMESPACE, {
    listen: (socket) => socket.on("screen:stats", setStats),
    onConnect: (socket) => socket.emit("screen:watch"),
  });

  const counters = [
    ["Playing now", stats?.online ?? 0],
    ["Crews", stats?.crewsPlaying ?? 0],
    ["Vaults cracked", stats?.vaultsCracked ?? 0],
  ] as const;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-clip bg-ink p-6 text-white sm:p-10">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="glow absolute -right-40 -top-40 size-[640px]" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-knight-300">Knights Hack Club</p>
          <h1 className="headline mt-3 text-[clamp(4rem,10vw,9rem)]">🔐 Vault Crackers</h1>
          <p className="mt-4 max-w-2xl text-xl text-white/75">
            Team up, read some code out loud, crack the vault. No coding experience needed.
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map(([title, body], index) => (
              <li key={title} className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                <span className="headline text-5xl text-knight-300">{index + 1}</span>
                <p className="mt-3 text-lg font-bold">{title}</p>
                <p className="mt-1 text-white/65">{body}</p>
              </li>
            ))}
          </ol>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
            {counters.map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-xs uppercase tracking-wider text-white/50">{label}</dt>
                <dd className="headline mt-1 text-7xl tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="grid gap-6">
          <JoinQr path="/games/vault-crackers" />
          <section aria-live="polite">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Just cracked</h2>
            <ul className="mt-3 grid gap-2">
              {stats?.feed.length ? (
                stats.feed.slice(0, 5).map((item) => (
                  <li key={item.id} className="rise flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                    <span className="text-2xl" aria-hidden>
                      {item.emoji}
                    </span>
                    <span className="font-semibold">{item.text}</span>
                  </li>
                ))
              ) : (
                <li className="rounded-2xl bg-white/5 px-4 py-3 text-white/50">Be the first to crack a vault!</li>
              )}
            </ul>
          </section>
        </aside>
      </div>

      <ConnectionBanner connected={connected} />
    </main>
  );
}
