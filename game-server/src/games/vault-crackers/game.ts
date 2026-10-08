import type { Namespace, Socket } from "socket.io";
import {
  MAX_CREW_SIZE,
  TIMELINE_BUCKET_MS,
  TIMELINE_BUCKETS,
  VAULT_TOPICS,
  type ClientToServerEvents,
  type CrewBadge,
  type PlayerView,
  type ScreenFeedItem,
  type ScreenStats,
  type ServerToClientEvents,
  type VaultKind,
} from "../../../../shared/games/vault-crackers";
import { command, fail, text, type Reply } from "../../lib/game-module";
import { makePuzzle, type Puzzle } from "./puzzles";

type SocketData = { playerId?: string };
type VaultNamespace = Namespace<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
type VaultSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

/** How long a player who closed the tab keeps their seat in the crew. */
const RECONNECT_GRACE_MS = 45_000;
const WRONG_ANSWER_COOLDOWN_MS = 5_000;
const HINT_AFTER_WRONG_GUESSES = 2;
const FEED_LENGTH = 8;
const SCREENS_ROOM = "screens";
/** A crew that wandered off mid-vault shouldn't drag the average solve time up for hours. */
const MAX_COUNTED_SOLVE_MS = 10 * 60_000;
/** Re-send stats this often so the timeline chart keeps sliding even when nobody is playing. */
const SCREEN_TICK_MS = 30_000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const BADGES: CrewBadge[] = [
  { name: "Fox", emoji: "🦊", color: "#f97316" },
  { name: "Owl", emoji: "🦉", color: "#a855f7" },
  { name: "Frog", emoji: "🐸", color: "#22c55e" },
  { name: "Octopus", emoji: "🐙", color: "#ec4899" },
  { name: "Tiger", emoji: "🐯", color: "#eab308" },
  { name: "Whale", emoji: "🐳", color: "#3b82f6" },
  { name: "Dragon", emoji: "🐉", color: "#ef4444" },
  { name: "Penguin", emoji: "🐧", color: "#06b6d4" },
];

type Player = {
  id: string;
  token: string;
  nickname: string;
  socketId: string | null;
  crewId: string | null;
  queued: boolean;
  goneTimer: NodeJS.Timeout | null;
};

type Vault = Puzzle & {
  number: number;
  startedAt: number;
  /** playerId → indexes of the lines only that player can see. */
  holders: Map<string, number[]>;
  cooldownUntil: number;
  wrongGuesses: number;
  crackedBy: string | null;
};

type Crew = {
  id: string;
  code: string;
  badge: CrewBadge;
  leaderId: string;
  memberIds: string[];
  /** null while friends are still gathering in the lobby. */
  vault: Vault | null;
};

type Tally = { started: number; cracked: number; skipped: number; firstTry: number; solveMs: number };
type SizeTally = { cracked: number; solveMs: number };

const cleanNickname = (value: unknown) =>
  text(value, 64).replace(/\p{C}/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);

const makeCode = () =>
  Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");

/**
 * Drop-in co-op: players can show up at any point during an event, get paired with a stranger
 * (or crew up with friends via a code), and crack vaults at their own pace. No scores, just a
 * shared "vaults cracked tonight" counter on the projector.
 */
export class VaultCrackers {
  private readonly players = new Map<string, Player>();
  private readonly playerIdByToken = new Map<string, string>();
  private readonly crews = new Map<string, Crew>();
  private readonly crewIdByCode = new Map<string, string>();
  private queue: string[] = [];
  private vaultsCracked = 0;
  private feed: ScreenFeedItem[] = [];
  private statsTimer: NodeJS.Timeout | null = null;
  // Anonymous room-wide analytics for the projector.
  private guesses = 0;
  private readonly tallies = new Map<VaultKind, Tally>(
    VAULT_TOPICS.map(({ kind }) => [kind, { started: 0, cracked: 0, skipped: 0, firstTry: 0, solveMs: 0 }]),
  );
  private readonly sizeTallies: SizeTally[] = Array.from({ length: MAX_CREW_SIZE }, () => ({ cracked: 0, solveMs: 0 }));
  private crackTimes: number[] = [];

  constructor(private readonly nsp: VaultNamespace) {
    setInterval(() => {
      if (this.nsp.adapter.rooms.get(SCREENS_ROOM)?.size) this.scheduleStats();
    }, SCREEN_TICK_MS).unref();
  }

  connect(socket: VaultSocket): void {
    const as =
      (run: (player: Player, payload: Record<string, unknown>) => Reply) =>
      (payload: Record<string, unknown>): Reply => {
        const player = socket.data.playerId ? this.players.get(socket.data.playerId) : undefined;
        return player ? run(player, payload) : fail("Join the game first.");
      };

    command(socket, "session:hello", (payload) => this.hello(socket, payload));
    command(socket, "match:find", as((p) => this.findMatch(p)));
    command(socket, "match:cancel", as((p) => this.cancelMatch(p)));
    command(socket, "crew:create", as((p) => this.createFriendsCrew(p)));
    command(socket, "crew:join", as((p, payload) => this.joinCrew(p, payload.code)));
    command(socket, "crew:start", as((p) => this.startCrew(p)));
    command(socket, "crew:solo", as((p) => this.playSolo(p)));
    command(socket, "crew:leave", as((p) => this.leave(p)));
    command(socket, "vault:answer", as((p, payload) => this.answer(p, payload.answer)));
    command(socket, "vault:next", as((p) => this.nextVault(p, false)));
    command(socket, "vault:skip", as((p) => this.nextVault(p, true)));

    socket.on("screen:watch", () => {
      void socket.join(SCREENS_ROOM);
      socket.emit("screen:stats", this.stats());
    });
    socket.on("disconnect", () => this.disconnect(socket));
  }

  // ── Sessions ────────────────────────────────────────────────────────────────

  private hello(socket: VaultSocket, payload: Record<string, unknown>): Reply {
    const current = socket.data.playerId ? this.players.get(socket.data.playerId) : undefined;
    if (current) return { ok: true, token: current.token };

    const token = text(payload.token, 64);
    const savedId = token ? this.playerIdByToken.get(token) : undefined;
    const saved = savedId ? this.players.get(savedId) : undefined;
    if (saved) {
      if (saved.goneTimer) clearTimeout(saved.goneTimer);
      saved.goneTimer = null;
      saved.socketId = socket.id;
      socket.data.playerId = saved.id;
      this.emitAround(saved);
      this.scheduleStats();
      return { ok: true, token: saved.token };
    }

    const nickname = cleanNickname(payload.nickname);
    if (!nickname) return fail("Pick a nickname (1–16 characters).");

    const player: Player = {
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      nickname,
      socketId: socket.id,
      crewId: null,
      queued: false,
      goneTimer: null,
    };
    this.players.set(player.id, player);
    this.playerIdByToken.set(player.token, player.id);
    socket.data.playerId = player.id;
    this.emitView(player);
    this.scheduleStats();
    return { ok: true, token: player.token };
  }

  private disconnect(socket: VaultSocket): void {
    const player = socket.data.playerId ? this.players.get(socket.data.playerId) : undefined;
    // A newer tab may already have taken over this player.
    if (!player || player.socketId !== socket.id) return;

    player.socketId = null;
    this.dequeue(player);
    player.goneTimer = setTimeout(() => this.removePlayer(player), RECONNECT_GRACE_MS);
    this.emitAround(player);
    this.scheduleStats();
  }

  private removePlayer(player: Player): void {
    this.leaveCrew(player);
    this.dequeue(player);
    this.players.delete(player.id);
    this.playerIdByToken.delete(player.token);
    this.scheduleStats();
  }

  // ── Matchmaking ─────────────────────────────────────────────────────────────

  private findMatch(player: Player): Reply {
    if (player.crewId) return fail("Leave your crew first.");
    if (!player.queued) {
      player.queued = true;
      this.queue.push(player.id);
    }
    // Pair strangers two at a time; an odd one out waits for the next arrival.
    while (this.queue.length >= 2) {
      const pair = this.queue.splice(0, 2).map((id) => this.players.get(id)!);
      for (const member of pair) member.queued = false;
      const crew = this.createCrew(pair);
      this.startVault(crew, 1);
      this.emitCrew(crew);
    }
    this.emitQueue();
    this.scheduleStats();
    return { ok: true };
  }

  private cancelMatch(player: Player): Reply {
    this.dequeue(player);
    this.emitView(player);
    return { ok: true };
  }

  private dequeue(player: Player): void {
    if (!player.queued) return;
    player.queued = false;
    this.queue = this.queue.filter((id) => id !== player.id);
    this.emitQueue();
  }

  // ── Crews ───────────────────────────────────────────────────────────────────

  private createFriendsCrew(player: Player): Reply {
    if (player.crewId) return fail("You're already in a crew.");
    this.dequeue(player);
    this.emitCrew(this.createCrew([player]));
    return { ok: true };
  }

  private joinCrew(player: Player, value: unknown): Reply {
    const code = text(value, 8).trim().toUpperCase();
    const crewId = this.crewIdByCode.get(code);
    const crew = crewId ? this.crews.get(crewId) : undefined;
    if (!crew) return fail("No crew with that code. Double-check it with your friends.");
    if (player.crewId === crew.id) return { ok: true };
    if (player.crewId) return fail("Leave your crew first.");
    if (crew.memberIds.length >= MAX_CREW_SIZE) return fail(`That crew is full (${MAX_CREW_SIZE} max).`);

    this.dequeue(player);
    crew.memberIds.push(player.id);
    player.crewId = crew.id;
    // Joining mid-vault is fine: the lines get re-dealt so the newcomer holds some too.
    if (crew.vault) this.dealLines(crew);
    this.emitCrew(crew);
    return { ok: true };
  }

  private startCrew(player: Player): Reply {
    const crew = this.crewOf(player);
    if (!crew) return fail("You're not in a crew.");
    if (crew.vault) return { ok: true };
    if (crew.leaderId !== player.id) return fail("Only the crew leader can start.");
    if (crew.memberIds.length < 2) return fail("Wait for at least one friend, or play solo.");
    this.startVault(crew, 1);
    this.emitCrew(crew);
    this.scheduleStats();
    return { ok: true };
  }

  private playSolo(player: Player): Reply {
    const existing = this.crewOf(player);
    if (existing && existing.memberIds.length > 1) return fail("Your friends are here. Start together!");
    this.dequeue(player);
    const crew = existing ?? this.createCrew([player]);
    if (!crew.vault) this.startVault(crew, 1);
    this.emitCrew(crew);
    this.scheduleStats();
    return { ok: true };
  }

  private leave(player: Player): Reply {
    this.dequeue(player);
    this.leaveCrew(player);
    this.emitView(player);
    return { ok: true };
  }

  private createCrew(members: Player[]): Crew {
    let code = makeCode();
    while (this.crewIdByCode.has(code)) code = makeCode();

    const crew: Crew = {
      id: crypto.randomUUID(),
      code,
      badge: this.freshBadge(),
      leaderId: members[0].id,
      memberIds: members.map((member) => member.id),
      vault: null,
    };
    this.crews.set(crew.id, crew);
    this.crewIdByCode.set(code, crew.id);
    for (const member of members) member.crewId = crew.id;
    return crew;
  }

  private leaveCrew(player: Player): void {
    const crew = this.crewOf(player);
    player.crewId = null;
    if (!crew) return;

    crew.memberIds = crew.memberIds.filter((id) => id !== player.id);
    if (crew.memberIds.length === 0) {
      this.crews.delete(crew.id);
      this.crewIdByCode.delete(crew.code);
    } else {
      if (crew.leaderId === player.id) crew.leaderId = crew.memberIds[0];
      // Hand the leaver's lines to whoever's left so the vault stays solvable.
      if (crew.vault) this.dealLines(crew);
      this.emitCrew(crew);
    }
    this.scheduleStats();
  }

  /** Picks the badge fewest active crews are using, so colours rarely clash in the room. */
  private freshBadge(): CrewBadge {
    const used = new Map<string, number>();
    for (const crew of this.crews.values()) used.set(crew.badge.name, (used.get(crew.badge.name) ?? 0) + 1);
    const fewest = Math.min(...BADGES.map((badge) => used.get(badge.name) ?? 0));
    const options = BADGES.filter((badge) => (used.get(badge.name) ?? 0) === fewest);
    return options[Math.floor(Math.random() * options.length)];
  }

  private crewOf(player: Player): Crew | undefined {
    return player.crewId ? this.crews.get(player.crewId) : undefined;
  }

  // ── Vaults ──────────────────────────────────────────────────────────────────

  private startVault(crew: Crew, number: number, avoid: VaultKind | null = null): void {
    const puzzle = makePuzzle(number, avoid);
    this.tallies.get(puzzle.kind)!.started += 1;
    crew.vault = {
      ...puzzle,
      number,
      startedAt: Date.now(),
      holders: new Map(),
      cooldownUntil: 0,
      wrongGuesses: 0,
      crackedBy: null,
    };
    this.dealLines(crew);
  }

  /**
   * Deals lines round-robin from a random starting seat, so each phone gets lines from all
   * over the program and the crew has to talk to put it back together. Every puzzle has at
   * least MAX_CREW_SIZE lines, so nobody is left empty-handed.
   */
  private dealLines(crew: Crew): void {
    const vault = crew.vault;
    if (!vault) return;
    const seats = crew.memberIds.length;
    const offset = Math.floor(Math.random() * seats);
    vault.holders = new Map(crew.memberIds.map((id) => [id, []]));
    vault.lines.forEach((_, index) => {
      vault.holders.get(crew.memberIds[(index + offset) % seats])!.push(index);
    });
  }

  private answer(player: Player, value: unknown): Reply {
    const crew = this.crewOf(player);
    const vault = crew?.vault;
    if (!crew || !vault) return fail("No vault to crack right now.");
    if (vault.crackedBy) return { ok: true, correct: true };
    if (Date.now() < vault.cooldownUntil) return fail("The vault is cooling down. Talk it through first!");

    const answer = text(value, 12).trim();
    if (!/^-?\d+$/.test(answer)) return fail("Type the number the program prints.");

    this.guesses += 1;
    if (Number(answer) !== vault.answer) {
      vault.wrongGuesses += 1;
      vault.cooldownUntil = Date.now() + WRONG_ANSWER_COOLDOWN_MS;
      this.emitCrew(crew);
      this.scheduleStats();
      return { ok: true, correct: false };
    }

    vault.crackedBy = player.nickname;
    this.vaultsCracked += 1;
    this.recordCrack(crew, vault);
    const names = crew.memberIds.map((id) => this.players.get(id)?.nickname).filter(Boolean);
    this.feed = [
      {
        id: crypto.randomUUID(),
        emoji: crew.badge.emoji,
        text: `${names.join(" & ")} cracked ${vault.title}`,
        at: Date.now(),
      },
      ...this.feed,
    ].slice(0, FEED_LENGTH);
    this.emitCrew(crew);
    this.scheduleStats();
    return { ok: true, correct: true };
  }

  private nextVault(player: Player, skip: boolean): Reply {
    const crew = this.crewOf(player);
    const vault = crew?.vault;
    if (!crew || !vault) return fail("No vault to move on from.");
    if (skip && vault.crackedBy) return { ok: true };
    if (!skip && !vault.crackedBy) return fail("Crack this vault first, or skip it.");
    if (skip) this.tallies.get(vault.kind)!.skipped += 1;
    this.startVault(crew, skip ? vault.number : vault.number + 1, vault.kind);
    this.emitCrew(crew);
    return { ok: true };
  }

  private recordCrack(crew: Crew, vault: Vault): void {
    const now = Date.now();
    const solveMs = Math.min(now - vault.startedAt, MAX_COUNTED_SOLVE_MS);
    const tally = this.tallies.get(vault.kind)!;
    tally.cracked += 1;
    tally.solveMs += solveMs;
    if (vault.wrongGuesses === 0) tally.firstTry += 1;
    const size = this.sizeTallies[Math.min(crew.memberIds.length, MAX_CREW_SIZE) - 1];
    size.cracked += 1;
    size.solveMs += solveMs;
    this.crackTimes.push(now);
  }

  // ── Views ───────────────────────────────────────────────────────────────────

  private viewFor(player: Player): PlayerView {
    const { nickname } = player;
    const crew = this.crewOf(player);
    if (!crew) {
      return player.queued ? { stage: "queue", nickname, waiting: this.queue.length } : { stage: "menu", nickname };
    }

    const members = crew.memberIds.flatMap((id) => {
      const member = this.players.get(id);
      return member ? [{ id, nickname: member.nickname, online: member.socketId !== null }] : [];
    });
    const vault = crew.vault;
    if (!vault) {
      return { stage: "forming", nickname, crewCode: crew.code, isLeader: crew.leaderId === player.id, members };
    }

    return {
      stage: "playing",
      nickname,
      crewCode: crew.code,
      badge: crew.badge,
      members,
      vault: {
        number: vault.number,
        kind: vault.kind,
        title: vault.title,
        totalLines: vault.lines.length,
        myLines: (vault.holders.get(player.id) ?? []).map((index) => ({ index, text: vault.lines[index] })),
        cooldownMs: Math.max(0, vault.cooldownUntil - Date.now()),
        wrongGuesses: vault.wrongGuesses,
        hint: vault.wrongGuesses >= HINT_AFTER_WRONG_GUESSES ? vault.hint : null,
        cracked: vault.crackedBy
          ? {
              lines: vault.lines,
              answer: vault.answer,
              concept: vault.concept,
              explanation: vault.explanation,
              by: vault.crackedBy,
            }
          : null,
      },
    };
  }

  private emitView(player: Player): void {
    if (player.socketId) this.nsp.to(player.socketId).emit("player:view", this.viewFor(player));
  }

  private emitCrew(crew: Crew): void {
    for (const id of crew.memberIds) {
      const member = this.players.get(id);
      if (member) this.emitView(member);
    }
  }

  /** Refresh a player and everyone who can see them (their crew). */
  private emitAround(player: Player): void {
    const crew = this.crewOf(player);
    if (crew) this.emitCrew(crew);
    else this.emitView(player);
  }

  private emitQueue(): void {
    for (const id of this.queue) {
      const player = this.players.get(id);
      if (player) this.emitView(player);
    }
  }

  private stats(): ScreenStats {
    let online = 0;
    for (const player of this.players.values()) if (player.socketId) online += 1;
    let crewsPlaying = 0;
    for (const crew of this.crews.values()) {
      if (crew.vault && crew.memberIds.some((id) => this.players.get(id)?.socketId)) crewsPlaying += 1;
    }

    const now = Date.now();
    const windowStart = now - TIMELINE_BUCKETS * TIMELINE_BUCKET_MS;
    this.crackTimes = this.crackTimes.filter((at) => at > windowStart);
    const timeline = Array.from({ length: TIMELINE_BUCKETS }, () => 0);
    for (const at of this.crackTimes) {
      timeline[Math.min(Math.floor((at - windowStart) / TIMELINE_BUCKET_MS), TIMELINE_BUCKETS - 1)] += 1;
    }

    const average = (totalMs: number, count: number) => (count ? Math.round(totalMs / count) : null);
    return {
      online,
      crewsPlaying,
      vaultsCracked: this.vaultsCracked,
      guesses: this.guesses,
      topics: VAULT_TOPICS.map(({ kind }) => {
        const { solveMs, ...tally } = this.tallies.get(kind)!;
        return { kind, ...tally, avgSolveMs: average(solveMs, tally.cracked) };
      }),
      crewSizes: this.sizeTallies.map(({ cracked, solveMs }, index) => ({
        size: index + 1,
        cracked,
        avgSolveMs: average(solveMs, cracked),
      })),
      timeline,
      feed: this.feed,
    };
  }

  /** Projector updates are batched: a burst of joins becomes one message. */
  private scheduleStats(): void {
    if (this.statsTimer) return;
    this.statsTimer = setTimeout(() => {
      this.statsTimer = null;
      this.nsp.to(SCREENS_ROOM).emit("screen:stats", this.stats());
    }, 500);
  }
}
