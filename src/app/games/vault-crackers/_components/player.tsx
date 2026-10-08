"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import {
  MAX_CREW_SIZE,
  VAULT_CRACKERS_NAMESPACE,
  type ClientToServerEvents,
  type CrewMember,
  type PlayerView,
  type ServerToClientEvents,
  type VaultView,
} from "@shared/games/vault-crackers";
import { useGameSocket } from "@/lib/games/use-game-socket";
import { ConnectionBanner } from "../../_components/connection-banner";

type VaultSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type Result = { ok: boolean; message?: string };
type Run = (send: (socket: VaultSocket, ack: (result: Result) => void) => void) => void;

const TOKEN_KEY = "vault-crackers:token";
const NAME_KEY = "vault-crackers:nickname";

// localStorage can throw (private mode, blocked storage); the game still works without it.
const storage = {
  get: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

const button =
  "min-h-14 rounded-2xl px-6 text-lg font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";
const primary = `${button} bg-knight-500 hover:bg-knight-400`;
const secondary = `${button} bg-white/10 ring-1 ring-white/15 hover:bg-white/15`;
const link = "min-h-11 px-3 text-sm font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline";
const input =
  "min-h-14 w-full rounded-2xl bg-white px-4 text-center text-2xl font-bold text-ink outline-none ring-knight-400 focus:ring-4";

export function VaultCrackersPlayer() {
  const [view, setView] = useState<PlayerView | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, startCooldown] = useCountdown();

  const { socketRef, connected } = useGameSocket<VaultSocket>(VAULT_CRACKERS_NAMESPACE, {
    listen: (socket) => {
      socket.on("player:view", (next) => {
        setView(next);
        if (next.stage === "playing") startCooldown(next.vault.cooldownMs);
      });
    },
    // Runs on every (re)connect: pick the saved session back up, crew and all.
    onConnect: (socket) => {
      const token = storage.get(TOKEN_KEY);
      if (!token) {
        setNeedsName(true);
        return;
      }
      socket.emit("session:hello", { token }, (result) => {
        if (result.ok) return;
        // The server restarted or forgot us: start fresh.
        storage.remove(TOKEN_KEY);
        setView(null);
        setNeedsName(true);
      });
    },
  });

  const run: Run = (send) => {
    const socket = socketRef.current;
    if (!socket) return;
    setError("");
    send(socket, (result) => {
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  };

  const join = (nickname: string) => {
    setError("");
    socketRef.current?.emit("session:hello", { nickname }, (result) => {
      if (!result.ok) {
        setError(result.message);
        return;
      }
      storage.set(TOKEN_KEY, result.token);
      storage.set(NAME_KEY, nickname);
      setNeedsName(false);
    });
  };

  let screen: ReactNode;
  if (!view) screen = needsName ? <NameForm onJoin={join} /> : <Loading />;
  else if (view.stage === "menu") screen = <Menu nickname={view.nickname} run={run} />;
  else if (view.stage === "queue") screen = <Queue waiting={view.waiting} run={run} />;
  else if (view.stage === "forming") screen = <Forming view={view} run={run} />;
  else
    screen = (
      <Playing
        key={`${view.vault.number}-${view.vault.kind}`}
        view={view}
        cooldown={cooldown}
        run={run}
      />
    );

  return (
    <main className="flex min-h-dvh flex-col bg-ink text-white">
      {screen}
      {error && (
        <p role="alert" className="mx-4 mb-4 rounded-2xl bg-red-500/15 px-4 py-3 text-center font-semibold text-red-200">
          {error}
        </p>
      )}
      <ConnectionBanner connected={connected} />
    </main>
  );
}

// ── Screens ─────────────────────────────────────────────────────────────────────

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">{children}</div>;
}

function Title({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <header>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-knight-300">{kicker}</p>
      <h1 className="headline mt-3 text-6xl">{children}</h1>
    </header>
  );
}

function Loading() {
  return (
    <Page>
      <div className="grid flex-1 place-items-center text-center">
        <p className="animate-pulse text-6xl" aria-label="Loading">
          🔐
        </p>
      </div>
    </Page>
  );
}

function NameForm({ onJoin }: { onJoin: (nickname: string) => void }) {
  // Only rendered after the socket connects, so reading storage here can't break hydration.
  const [name, setName] = useState(() => storage.get(NAME_KEY) ?? "");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) onJoin(name.trim());
  };

  return (
    <Page>
      <Title kicker="Knights Hack Club">Vault Crackers</Title>
      <p className="mt-5 text-lg text-white/75">
        Every phone in your crew holds a few lines of a tiny program. Read them out, work out what it
        prints, and crack the vault together.
      </p>
      <p className="mt-3 font-semibold text-knight-300">No coding experience needed.</p>
      <form onSubmit={submit} className="mt-auto grid gap-3 pt-10">
        <label htmlFor="nickname" className="font-semibold">
          Your nickname
        </label>
        <input
          id="nickname"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={16}
          autoComplete="nickname"
          placeholder="e.g. Sam"
          className={input}
        />
        <button type="submit" disabled={!name.trim()} className={primary}>
          Let&apos;s go
        </button>
      </form>
    </Page>
  );
}

function Menu({ nickname, run }: { nickname: string; run: Run }) {
  const [code, setCode] = useState("");

  const joinCrew = (event: FormEvent) => {
    event.preventDefault();
    run((socket, ack) => socket.emit("crew:join", { code }, ack));
  };

  return (
    <Page>
      <Title kicker="Vault Crackers">Hey {nickname}!</Title>
      <p className="mt-4 text-white/70">How do you want to play?</p>

      <button
        type="button"
        onClick={() => run((socket, ack) => socket.emit("match:find", ack))}
        className={`${primary} mt-8 min-h-20 text-xl`}
      >
        🎲 Find me a partner
      </button>

      <section className="mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
        <h2 className="text-lg font-bold">Here with friends?</h2>
        <button
          type="button"
          onClick={() => run((socket, ack) => socket.emit("crew:create", ack))}
          className={`${secondary} mt-4 w-full`}
        >
          Start a crew
        </button>
        <form onSubmit={joinCrew} className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
            placeholder="CODE"
            aria-label="Crew code"
            autoCapitalize="characters"
            autoComplete="off"
            className={`${input} min-w-0 flex-1 font-mono tracking-[0.3em]`}
          />
          <button type="submit" disabled={code.length !== 4} className={`${secondary} shrink-0`}>
            Join
          </button>
        </form>
      </section>

      <button
        type="button"
        onClick={() => run((socket, ack) => socket.emit("crew:solo", ack))}
        className={`${link} mt-6 self-center`}
      >
        Or practise solo
      </button>
    </Page>
  );
}

function Queue({ waiting, run }: { waiting: number; run: Run }) {
  const [patient, setPatient] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPatient(true), 15_000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Page>
      <div className="grid flex-1 place-items-center text-center">
        <div>
          <p className="animate-bounce text-7xl" aria-hidden>
            🔎
          </p>
          <h1 className="headline mt-6 text-5xl">Finding you a partner…</h1>
          <p className="mt-4 text-white/70">
            You&apos;ll be paired with the next person who taps &ldquo;Find me a partner&rdquo;. Tell a friend
            nearby to scan the QR code!
          </p>
          {waiting > 1 && <p className="mt-2 text-sm text-white/50">{waiting} people waiting</p>}
        </div>
      </div>
      <div className="grid gap-3">
        {patient && (
          <button type="button" onClick={() => run((socket, ack) => socket.emit("crew:solo", ack))} className={primary}>
            Practise solo while you wait
          </button>
        )}
        <button type="button" onClick={() => run((socket, ack) => socket.emit("match:cancel", ack))} className={secondary}>
          Cancel
        </button>
      </div>
    </Page>
  );
}

function Forming({ view, run }: { view: Extract<PlayerView, { stage: "forming" }>; run: Run }) {
  const leader = view.members[0];
  return (
    <Page>
      <Title kicker="Your crew code">
        <span className="font-mono tracking-[0.2em] text-knight-300">{view.crewCode}</span>
      </Title>
      <p className="mt-4 text-white/70">
        Friends tap <b className="text-white">Join</b> on their phone and type this code. Up to {MAX_CREW_SIZE} people per crew.
      </p>

      <Members members={view.members} className="mt-8" />

      <div className="mt-auto grid gap-3 pt-10">
        {view.isLeader ? (
          <button
            type="button"
            disabled={view.members.length < 2}
            onClick={() => run((socket, ack) => socket.emit("crew:start", ack))}
            className={primary}
          >
            {view.members.length < 2 ? "Waiting for friends…" : `Start with ${view.members.length} players`}
          </button>
        ) : (
          <p className="text-center text-white/70">Waiting for {leader?.nickname ?? "the leader"} to start…</p>
        )}
        <button type="button" onClick={() => run((socket, ack) => socket.emit("crew:leave", ack))} className={secondary}>
          Leave crew
        </button>
      </div>
    </Page>
  );
}

function Playing({
  view,
  cooldown,
  run,
}: {
  view: Extract<PlayerView, { stage: "playing" }>;
  cooldown: number;
  run: Run;
}) {
  const { badge, members, vault } = view;
  const solo = members.length === 1;

  return (
    <>
      {/* Every phone in a crew shares this colour, so teammates can spot each other across the room. */}
      <header className="px-4 pb-5 pt-6 text-ink" style={{ backgroundColor: badge.color }}>
        <div className="mx-auto flex max-w-md items-center gap-4">
          <span className="text-5xl" aria-hidden>
            {badge.emoji}
          </span>
          <div className="min-w-0">
            <p className="headline text-4xl">Team {badge.name}</p>
            <p className="truncate font-semibold">
              {members.map((member) => member.nickname + (member.online ? "" : " (away)")).join(" · ")}
            </p>
          </div>
        </div>
        {!solo && !vault.cracked && (
          <p className="mx-auto mt-3 max-w-md text-sm font-medium">
            Find your teammates: their screens are {badge.name.toLowerCase()} {badge.emoji} too.
          </p>
        )}
      </header>

      <Page>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-knight-300">Vault #{vault.number}</p>
        <h1 className="headline mt-2 text-5xl">{vault.title}</h1>

        {vault.cracked ? (
          <Cracked vault={vault} run={run} />
        ) : (
          <Locked vault={vault} solo={solo} cooldown={cooldown} run={run} />
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-10 text-sm text-white/55">
          {members.length < MAX_CREW_SIZE ? (
            <span>
              Friends can join with code <b className="font-mono tracking-widest text-white">{view.crewCode}</b>
            </span>
          ) : (
            <span />
          )}
          <button type="button" onClick={() => run((socket, ack) => socket.emit("crew:leave", ack))} className={link}>
            Leave crew
          </button>
        </footer>
      </Page>
    </>
  );
}

function Locked({ vault, solo, cooldown, run }: { vault: VaultView; solo: boolean; cooldown: number; run: Run }) {
  const [answer, setAnswer] = useState("");
  const mine = new Map(vault.myLines.map((line) => [line.index, line.text]));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    run((socket, ack) => socket.emit("vault:answer", { answer }, ack));
  };

  return (
    <>
      <p className="mt-4 text-white/75">
        {solo
          ? "You hold every line. Read the program top to bottom."
          : `You hold ${vault.myLines.length} of ${vault.totalLines} lines. Read yours out loud. Your crew has the rest!`}
      </p>

      <ol className="mt-5 overflow-x-auto rounded-2xl bg-white/5 py-3 font-mono text-[0.95rem] ring-1 ring-white/10">
        {Array.from({ length: vault.totalLines }, (_, index) => {
          const text = mine.get(index);
          return (
            <li key={index} className="flex min-h-9 items-center gap-3 px-4">
              <span className="w-5 shrink-0 text-right text-white/35">{index + 1}</span>
              {text === undefined ? (
                <span className="text-sm italic text-white/30">ask your crew</span>
              ) : (
                <code className="whitespace-pre font-semibold text-knight-50">{text}</code>
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} className="mt-6 grid gap-3">
        <label htmlFor="answer" className="font-semibold">
          What does the program print?
        </label>
        <div className="flex gap-2">
          <input
            id="answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value.replace(/[^\d-]/g, "").slice(0, 8))}
            inputMode="numeric"
            autoComplete="off"
            className={`${input} min-w-0 flex-1 font-mono`}
          />
          <button type="submit" disabled={!answer || cooldown > 0} className={`${primary} shrink-0`}>
            {cooldown > 0 ? `${cooldown}s` : "Unlock"}
          </button>
        </div>
      </form>

      {cooldown > 0 && (
        <p role="status" className="mt-3 font-semibold text-red-300">
          ❌ Wrong code! The vault is locked for {cooldown}s. Compare your lines again.
        </p>
      )}
      {vault.hint && (
        <p className="mt-4 rounded-2xl bg-amber-300/15 px-4 py-3 text-amber-100">
          💡 <Rich text={vault.hint} />
        </p>
      )}

      <button
        type="button"
        onClick={() => run((socket, ack) => socket.emit("vault:skip", ack))}
        className={`${link} mt-4 self-center`}
      >
        Too tricky? Try a different vault
      </button>
    </>
  );
}

function Cracked({ vault, run }: { vault: VaultView; run: Run }) {
  const cracked = vault.cracked!;
  return (
    <>
      <p className="mt-4 text-2xl font-bold">🔓 Cracked! {cracked.by} typed {cracked.answer}.</p>

      <pre className="mt-5 overflow-x-auto rounded-2xl bg-white/5 px-4 py-3 text-[0.95rem] ring-1 ring-white/10">
        <code>
          {cracked.lines.map((line, index) => (
            <span key={index} className="block min-h-7">
              <span className="mr-3 inline-block w-5 text-right text-white/35 select-none">{index + 1}</span>
              {line}
            </span>
          ))}
        </code>
        <span className="mt-2 block border-t border-white/10 pt-2 text-green-300"># output: {cracked.answer}</span>
      </pre>

      <section className="mt-5 rounded-2xl bg-knight-500/20 p-4 ring-1 ring-knight-400/40">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-knight-300">You just learned</p>
        <h2 className="mt-1 text-xl font-bold">{cracked.concept}</h2>
        <p className="mt-2 text-white/80">
          <Rich text={cracked.explanation} />
        </p>
      </section>

      <button type="button" onClick={() => run((socket, ack) => socket.emit("vault:next", ack))} className={`${primary} mt-6`}>
        Next vault →
      </button>
    </>
  );
}

// ── Bits ────────────────────────────────────────────────────────────────────────

function Members({ members, className = "" }: { members: CrewMember[]; className?: string }) {
  return (
    <ul className={`grid gap-2 ${className}`}>
      {members.map((member, index) => (
        <li key={member.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4">
          <span className="font-semibold">
            {member.nickname}
            {index === 0 && <span className="ml-2 text-sm text-white/50">leader</span>}
          </span>
          <span className={`size-2.5 rounded-full ${member.online ? "bg-green-400" : "bg-white/25"}`} aria-label={member.online ? "online" : "away"} />
        </li>
      ))}
    </ul>
  );
}

/** Renders `backtick` spans in game text as inline code. */
function Rich({ text }: { text: string }) {
  return text.split("`").map((part, index) =>
    index % 2 ? (
      <code key={index} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em]">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

/** Seconds left on the wrong-answer lockout, ticking down locally. */
function useCountdown() {
  const [left, setLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const start = (ms: number) => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    const end = Date.now() + ms;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(seconds);
      if (seconds === 0 && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
    tick();
    if (ms > 0) timer.current = setInterval(tick, 250);
  };

  return [left, start] as const;
}
