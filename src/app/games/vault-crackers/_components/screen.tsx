"use client";

import { useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import {
  TIMELINE_BUCKET_MS,
  TIMELINE_BUCKETS,
  VAULT_CRACKERS_NAMESPACE,
  VAULT_TOPICS,
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
  ["Get a partner", "Paired with someone new, or crew up with friends."],
  ["Crack the code", "Each phone holds part of a tiny program. Talk it through, type what it prints."],
] as const;

const crewSizeLabels = ["Solo players", "Pairs", "Crews of 3", "Crews of 4"];
const noCrewSizes = crewSizeLabels.map((_, index) => ({ size: index + 1, cracked: 0, avgSolveMs: null }));
/** A topic needs this many cracks before the insights call it easy or tricky. */
const MIN_SAMPLE = 2;
const bucketMinutes = TIMELINE_BUCKET_MS / 60_000;

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function duration(ms: number | null) {
  if (ms === null) return "–";
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

/** Turns the raw numbers into the KPI tiles, chart rows and plain-English takeaways. */
function analyse(stats: ScreenStats | null) {
  const topics = VAULT_TOPICS.map((topic) => {
    const row = stats?.topics.find((t) => t.kind === topic.kind);
    const cracked = row?.cracked ?? 0;
    return {
      ...topic,
      started: row?.started ?? 0,
      cracked,
      skipped: row?.skipped ?? 0,
      firstTry: row?.firstTry ?? 0,
      firstTryRate: percent(row?.firstTry ?? 0, cracked),
      avgSolveMs: row?.avgSolveMs ?? null,
    };
  });
  const crewSizes = (stats?.crewSizes ?? noCrewSizes).map((row) => ({ ...row, label: crewSizeLabels[row.size - 1] }));
  const timeline = stats?.timeline ?? Array.from({ length: TIMELINE_BUCKETS }, () => 0);

  const cracked = topics.reduce((sum, t) => sum + t.cracked, 0);
  const firstTry = topics.reduce((sum, t) => sum + t.firstTry, 0);
  const solveMs = topics.reduce((sum, t) => sum + (t.avgSolveMs ?? 0) * t.cracked, 0);
  const avgSolveMs = cracked ? solveMs / cracked : null;

  const insights: { emoji: string; text: ReactNode }[] = [];
  const sampled = topics.filter((t) => t.cracked >= MIN_SAMPLE);
  if (sampled.length >= 2) {
    const byRate = [...sampled].sort((a, b) => a.firstTryRate - b.firstTryRate);
    const [hardest, easiest] = [byRate[0], byRate[byRate.length - 1]];
    if (hardest.firstTryRate < easiest.firstTryRate) {
      insights.push({
        emoji: hardest.emoji,
        text: (
          <>
            <b>{hardest.label}</b> is the trickiest topic so far: only {hardest.firstTryRate}% of crews got it on the
            first guess.
          </>
        ),
      });
      insights.push({
        emoji: easiest.emoji,
        text: (
          <>
            <b>{easiest.label}</b> is the easiest: {easiest.firstTryRate}% cracked on the first guess.
          </>
        ),
      });
    }
  }
  const sizes = crewSizes.filter((s) => s.cracked >= MIN_SAMPLE && s.avgSolveMs !== null);
  if (sizes.length >= 2) {
    const fastest = sizes.reduce((best, s) => (s.avgSolveMs! < best.avgSolveMs! ? s : best));
    insights.push({
      emoji: "⚡",
      text: (
        <>
          <b>{fastest.label}</b> crack vaults fastest, about {duration(fastest.avgSolveMs)} each.
        </>
      ),
    });
  }
  const mostSkipped = topics.reduce((top, t) => (t.skipped > top.skipped ? t : top));
  if (mostSkipped.skipped >= MIN_SAMPLE) {
    insights.push({
      emoji: "⏭️",
      text: (
        <>
          <b>{mostSkipped.label}</b> gets skipped the most ({mostSkipped.skipped} times). Ask a club member for a hint!
        </>
      ),
    });
  }
  if (stats?.guesses) {
    insights.push({
      emoji: "🎯",
      text: (
        <>
          {stats.guesses} answers typed so far, and {percent(stats.vaultsCracked, stats.guesses)}% of them were right.
          Wrong guesses are how you learn!
        </>
      ),
    });
  }
  if (insights.length === 0) {
    insights.push({
      emoji: "📊",
      text: "Takeaways appear here once a few vaults are cracked. Small numbers bounce around, so give it a minute!",
    });
  }

  return { topics, crewSizes, timeline, cracked, firstTryRate: percent(firstTry, cracked), avgSolveMs, insights };
}

/** Projector view: join QR plus a live, score-free look at how the whole room is doing. */
export function VaultCrackersScreen() {
  const [stats, setStats] = useState<ScreenStats | null>(null);
  const { connected } = useGameSocket<VaultSocket>(VAULT_CRACKERS_NAMESPACE, {
    listen: (socket) => socket.on("screen:stats", setStats),
    onConnect: (socket) => socket.emit("screen:watch"),
  });
  const data = analyse(stats);

  const kpis = [
    ["Playing now", String(stats?.online ?? 0), `${stats?.crewsPlaying ?? 0} crews at work`],
    ["Vaults cracked", String(stats?.vaultsCracked ?? 0), "by everyone, tonight"],
    ["First-try rate", data.cracked ? `${data.firstTryRate}%` : "–", "cracked with zero wrong guesses"],
    ["Typical crack time", duration(data.avgSolveMs), "from first look to open vault"],
  ] as const;

  return (
    <main className="relative flex min-h-screen flex-col overflow-clip bg-ink p-4 text-white lg:h-screen lg:max-h-screen lg:overflow-hidden lg:p-5">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="glow absolute -right-40 -top-40 size-[640px]" aria-hidden />

      <div className="relative mx-auto grid min-h-0 w-full max-w-[110rem] flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="flex min-h-0 min-w-0 flex-col gap-3">
          <header>
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-knight-300">
              Knights Hack Club · live room data
            </p>
            <h1 className="headline mt-2 text-[clamp(3rem,5vw,4.75rem)]">🔐 Vault Crackers</h1>
            <p className="mt-1.5 max-w-3xl text-lg text-white/70 short:hidden">
              Every guess you make feeds these charts. Here&apos;s what the whole room is learning, live.
            </p>
          </header>

          <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {kpis.map(([label, value, note]) => (
              <div key={label} className="rounded-3xl bg-white/5 px-5 py-4 ring-1 ring-white/10 short:py-3">
                <dt className="font-mono text-xs uppercase tracking-wider text-white/55">{label}</dt>
                <dd className="headline mt-1.5 text-5xl tabular-nums short:text-4xl">{value}</dd>
                <dd className="mt-1.5 text-sm text-white/55 short:hidden">{note}</dd>
              </div>
            ))}
          </dl>

          <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-3">
              <Panel
                className="flex-1"
                title="Which topics trip people up?"
                howToRead="Bar = share of vaults cracked on the first guess. Shorter bar means trickier."
              >
                <TopicChart topics={data.topics} />
              </Panel>
              <Panel title="What the data says" className="shrink-0" aria-live="polite">
                <ul className="grid gap-1.5">
                  {data.insights.slice(0, 3).map((insight, index) => (
                    <li key={index} className="flex gap-3 leading-snug text-white/80 [&_b]:text-white">
                      <span className="text-xl" aria-hidden>
                        {insight.emoji}
                      </span>
                      <span>{insight.text}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
            <div className="flex min-h-0 flex-col gap-3">
              <Panel
                className="flex-1"
                title="Vaults cracked, last hour"
                howToRead={`Each bar is ${bucketMinutes} minutes. Taller bar means a busier moment.`}
              >
                <TimelineChart counts={data.timeline} />
              </Panel>
              <Panel
                className="flex-1"
                title="Do bigger crews crack faster?"
                howToRead="Average time to crack one vault. Shorter bar is faster."
              >
                <CrewSizeChart rows={data.crewSizes} />
              </Panel>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          {/* The QR sets its own inline max width, so shrinking it on short screens needs `!`. */}
          <div className="shrink-0 short:[&_svg]:max-w-36!">
            <JoinQr path="/games/vault-crackers" size={200} />
          </div>
          <ol className="grid shrink-0 gap-2 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
            {steps.map(([title, body], index) => (
              <li key={title} className="flex gap-3">
                <span className="headline text-3xl text-knight-300">{index + 1}</span>
                <p className="text-sm text-white/65 short:[&>span]:hidden">
                  <b className="block text-base text-white">{title}</b>
                  <span>{body}</span>
                </p>
              </li>
            ))}
          </ol>

          <section
            aria-live="polite"
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"
          >
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Just cracked</h2>
            <ul className="mt-2 grid gap-2">
              {stats?.feed.length ? (
                stats.feed.slice(0, 4).map((item) => (
                  <li key={item.id} className="rise flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5">
                    <span className="text-xl" aria-hidden>
                      {item.emoji}
                    </span>
                    <span className="text-sm font-semibold">{item.text}</span>
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

function Panel({
  title,
  howToRead,
  className = "",
  children,
  ...rest
}: {
  title: string;
  howToRead?: string;
  className?: string;
  children: ReactNode;
  "aria-live"?: "polite";
}) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white/5 px-5 py-4 ring-1 ring-white/10 ${className}`}
      {...rest}
    >
      <h2 className="text-xl font-bold">{title}</h2>
      {howToRead && <p className="mt-1 text-sm text-white/55">{howToRead}</p>}
      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </section>
  );
}

/** Thin horizontal bar on a faint full-width track; width animates as new data arrives. */
function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div className="h-3.5 flex-1 rounded-r bg-white/10" title={label}>
      <div
        className="h-full rounded-r bg-knight-400 transition-[width] duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function TopicChart({ topics }: { topics: ReturnType<typeof analyse>["topics"] }) {
  return (
    <ul className="grid h-full content-between gap-1.5">
      {topics.map((topic) => (
        <li key={topic.kind} className="grid grid-cols-[11rem_minmax(0,1fr)_3.5rem] items-center gap-3">
          <span className="truncate font-semibold">
            <span aria-hidden>{topic.emoji}</span> {topic.label}
          </span>
          <Bar value={topic.firstTryRate} label={`${topic.label}: ${topic.firstTryRate}% first try`} />
          <span className="text-right font-mono text-lg tabular-nums">
            {topic.cracked ? `${topic.firstTryRate}%` : "–"}
          </span>
          <span className="col-start-2 col-end-4 -mt-1.5 text-xs text-white/45 short:hidden">
            {topic.cracked
              ? `${topic.firstTry} of ${topic.cracked} cracked first try · ${duration(topic.avgSolveMs)} avg`
              : topic.started
                ? `${topic.started} in progress`
                : "Not tried yet"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TimelineChart({ counts }: { counts: number[] }) {
  const peak = Math.max(...counts);
  const scale = Math.max(peak, 1);
  return (
    <figure className="flex h-full flex-col pt-5">
      <div className="relative flex min-h-24 flex-1 items-end gap-1 border-b border-white/25">
        {peak > 0 && (
          <span
            className="absolute inset-x-0 top-0 border-t border-dashed border-white/15 font-mono text-xs text-white/45"
            aria-hidden
          >
            <span className="absolute -top-5 left-0">peak {peak}</span>
          </span>
        )}
        {counts.map((count, index) => {
          const minutesAgo = (TIMELINE_BUCKETS - index) * bucketMinutes;
          return (
            <div
              key={index}
              className="flex-1 rounded-t bg-knight-400 transition-[height] duration-700"
              style={{ height: `${(count / scale) * 100}%`, minHeight: count ? 4 : 0 }}
              title={`${count} cracked, ${minutesAgo}–${minutesAgo - bucketMinutes} min ago`}
            />
          );
        })}
      </div>
      <figcaption className="mt-1.5 flex justify-between font-mono text-xs text-white/45">
        <span>{TIMELINE_BUCKETS * bucketMinutes} min ago</span>
        <span>{(TIMELINE_BUCKETS * bucketMinutes) / 2} min ago</span>
        <span>now</span>
      </figcaption>
    </figure>
  );
}

function CrewSizeChart({ rows }: { rows: ReturnType<typeof analyse>["crewSizes"] }) {
  const slowest = Math.max(...rows.map((row) => row.avgSolveMs ?? 0), 1);
  return (
    <ul className="grid h-full content-around gap-1.5">
      {rows.map((row) => (
        <li key={row.size} className="grid grid-cols-[7rem_minmax(0,1fr)_5rem] items-center gap-3">
          <span className="font-semibold">{row.label}</span>
          <Bar
            value={((row.avgSolveMs ?? 0) / slowest) * 100}
            label={`${row.label}: ${duration(row.avgSolveMs)} avg`}
          />
          <span className="text-right font-mono text-lg tabular-nums">{duration(row.avgSolveMs)}</span>
          <span className="col-start-2 col-end-4 -mt-1.5 text-xs text-white/45 short:hidden">
            {row.cracked ? `${row.cracked} vault${row.cracked === 1 ? "" : "s"} cracked` : "No cracks yet"}
          </span>
        </li>
      ))}
    </ul>
  );
}
