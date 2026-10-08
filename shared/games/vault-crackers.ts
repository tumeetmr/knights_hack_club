// Socket protocol for Vault Crackers, shared by the website and game-server/.
// Keep it dependency-free: both projects import this file directly.

export const VAULT_CRACKERS_NAMESPACE = "/vault-crackers";
export const MAX_CREW_SIZE = 4;

export type VaultKind =
  | "variables"
  | "update"
  | "if-else"
  | "loop"
  | "neuron"
  | "function"
  | "next-word"
  | "loop-if";

export type CodeLine = { index: number; text: string };

export type CrewMember = { id: string; nickname: string; online: boolean };

export type CrewBadge = { name: string; emoji: string; color: string };

export type VaultView = {
  number: number;
  kind: VaultKind;
  title: string;
  totalLines: number;
  /** Only the lines this player holds. Teammates hold the rest. */
  myLines: CodeLine[];
  /** Lockout left after a wrong guess. Relative, so phone clocks don't matter. */
  cooldownMs: number;
  wrongGuesses: number;
  hint: string | null;
  /** Set once the crew cracks the vault: the whole program and what it taught. */
  cracked: { lines: string[]; answer: number; concept: string; explanation: string; by: string } | null;
};

/** Everything one phone needs to render, personalised for that player. */
export type PlayerView =
  | { stage: "menu"; nickname: string }
  | { stage: "queue"; nickname: string; waiting: number }
  | {
      stage: "forming";
      nickname: string;
      crewCode: string;
      isLeader: boolean;
      members: CrewMember[];
    }
  | {
      stage: "playing";
      nickname: string;
      /** Friends can still join a crew mid-game, up to the crew size limit. */
      crewCode: string;
      badge: CrewBadge;
      members: CrewMember[];
      vault: VaultView;
    };

export type ScreenFeedItem = { id: string; text: string; emoji: string; at: number };

export type ScreenStats = {
  online: number;
  crewsPlaying: number;
  vaultsCracked: number;
  feed: ScreenFeedItem[];
};

export type Ack<T = object> = (response: ({ ok: true } & T) | { ok: false; message: string }) => void;

export type ClientToServerEvents = {
  /** Resume a saved session, or start a new one with a nickname. */
  "session:hello": (
    payload: { token?: string; nickname?: string },
    ack: Ack<{ token: string }>,
  ) => void;
  "match:find": (ack: Ack) => void;
  "match:cancel": (ack: Ack) => void;
  "crew:create": (ack: Ack) => void;
  "crew:join": (payload: { code: string }, ack: Ack) => void;
  "crew:start": (ack: Ack) => void;
  "crew:solo": (ack: Ack) => void;
  "crew:leave": (ack: Ack) => void;
  "vault:answer": (payload: { answer: string }, ack: Ack<{ correct: boolean }>) => void;
  "vault:next": (ack: Ack) => void;
  "vault:skip": (ack: Ack) => void;
  "screen:watch": () => void;
};

export type ServerToClientEvents = {
  "player:view": (view: PlayerView) => void;
  "screen:stats": (stats: ScreenStats) => void;
};
