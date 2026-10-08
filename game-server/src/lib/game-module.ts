import type { Namespace, Socket } from "socket.io";

/** One game = one Socket.IO namespace. Add new games to the list in src/games/index.ts. */
export type GameModule = {
  /** Namespace path, e.g. "/vault-crackers". Must match what the website connects to. */
  namespace: string;
  register(nsp: Namespace): void;
};

// Each game types its own events; the shared helpers below only need the basics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySocket = Socket<any, any, any, any>;

export type Reply = ({ ok: true } & Record<string, unknown>) | { ok: false; message: string };

export const fail = (message: string): Reply => ({ ok: false, message });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Registers a request/response handler. Clients are untrusted: the payload may be missing or
 * the wrong shape, and the ack may not be a function. A throwing handler must never take the
 * whole server (and every other game) down with it.
 */
export function command(
  socket: AnySocket,
  event: string,
  run: (payload: Record<string, unknown>) => Reply,
): void {
  socket.on(event, (...args: unknown[]) => {
    const last = args.at(-1);
    const ack = typeof last === "function" ? (last as (reply: Reply) => void) : () => {};
    const payload = isRecord(args[0]) ? args[0] : {};
    try {
      ack(run(payload));
    } catch (error) {
      console.error(`[${socket.nsp.name}] ${event} failed`, error);
      ack(fail("Something went wrong. Try again."));
    }
  });
}

export const text = (value: unknown, maxLength: number): string =>
  typeof value === "string" ? value.slice(0, maxLength) : "";
