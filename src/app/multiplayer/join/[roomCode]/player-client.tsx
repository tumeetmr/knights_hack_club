"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ClueColor,
  PlayerAssignment,
  RoomState,
  ServerToClientEvents,
} from "@/lib/multiplayer/types";

type Props = { roomCode: string };
type PlayerSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function PlayerClient({ roomCode }: Props) {
  const [assignment, setAssignment] = useState<PlayerAssignment | null>(null);
  const [state, setState] = useState<RoomState | null>(null);
  const [message, setMessage] = useState("Joining the game…");
  const [clue, setClue] = useState<{ color: ClueColor; number: number } | null>(null);
  const [repeatKey, setRepeatKey] = useState(0);
  const [flashCount, setFlashCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashComplete, setFlashComplete] = useState(false);
  const socketRef = useRef<PlayerSocket | null>(null);

  useEffect(() => {
    const socket = io() as PlayerSocket;
    socketRef.current = socket;
    const reconnectKey = `knights-trial-player:${roomCode}`;
    const reconnectToken = window.localStorage.getItem(reconnectKey) ?? undefined;

    socket.on("connect", () => {
      socket.emit("room:join", { roomCode, reconnectToken }, (response) => {
        if (!response.ok) {
          setMessage(response.message);
          return;
        }
        setAssignment(response.assignment);
        setMessage("Connected");
        window.localStorage.setItem(reconnectKey, response.assignment.reconnectToken);
      });
    });
    socket.on("room:state", setState);
    socket.on("game:private-clue", setClue);
    socket.on("game:result", ({ result }) => {
      setMessage(result === "won" ? "🔓 SAFE UNLOCKED! 🎉 YOU BOTH WON!" : "Keep communicating and try again.");
    });
    socket.on("server:error", ({ message: errorMessage }) => setMessage(errorMessage));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode]);

  useEffect(() => {
    if (!clue) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setFlashCount(0);
    setIsFlashing(true);
    setFlashComplete(false);

    for (let index = 0; index < clue.number; index += 1) {
      const start = index * 850;
      timers.push(
        setTimeout(() => {
          if (!cancelled) {
            setFlashCount(index + 1);
            setIsFlashing(true);
          }
        }, start),
      );
      timers.push(
        setTimeout(() => {
          if (!cancelled) setIsFlashing(false);
        }, start + 500),
      );
    }
    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          setIsFlashing(false);
          setFlashComplete(true);
        }
      }, clue.number * 850),
    );

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [clue, repeatKey]);

  if (!assignment) {
    return (
      <main className="grid min-h-dvh place-items-center bg-ink px-6 text-center text-white">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-knight-300">Knight&apos;s Trial</p>
          <h1 className="headline mt-5 text-6xl">Joining…</h1>
          <p className="mt-5 text-white/65">{message}</p>
        </div>
      </main>
    );
  }

  const player = state?.players.find((item) => item.id === assignment.playerId);
  const connected = player?.status === "connected";
  const won = state?.game.phase === "won";

  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6 text-white">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-knight-300">Knight&apos;s Trial</p>
        {won ? (
          <>
            <h1 className="headline mt-8 text-6xl">🔓 Safe Unlocked!</h1>
            <p className="mt-8 text-3xl font-bold">🎉 You both won!</p>
          </>
        ) : clue ? (
          <>
            <h1 className="headline mt-8 text-6xl">Watch the light</h1>
            <div
              aria-label={`${clue.color} light`}
              className={`mx-auto mt-12 size-56 rounded-full border-8 transition-all duration-150 ${
                clue.color === "red"
                  ? "border-red-300 bg-red-500"
                  : "border-blue-300 bg-blue-500"
              } ${
                isFlashing
                  ? "scale-100 opacity-100 shadow-[0_0_7rem_currentColor]"
                  : "scale-90 opacity-10 shadow-none"
              }`}
            />
            <p className="mt-10 text-lg text-white/70">Share the number of flashes with your teammate.</p>
            {flashComplete && (
              <button
                type="button"
                onClick={() => setRepeatKey((key) => key + 1)}
                className="mt-8 min-h-16 w-full rounded-2xl bg-knight-500 px-6 py-4 text-xl font-bold transition hover:bg-knight-400 active:scale-[0.98]"
              >
                REPEAT
              </button>
            )}
            <span className="sr-only">{flashCount} flashes shown</span>
            {message !== "Connected" && <p className="mt-6 text-lg text-white/65">{message}</p>}
          </>
        ) : (
          <>
            <h1 className="headline mt-5 text-7xl">Player {assignment.playerNumber}</h1>
            <p className={`mt-6 text-lg ${connected ? "text-knight-300" : "text-white/55"}`}>
              {connected ? "Waiting for the host to start…" : message}
            </p>
          </>
        )}
      </div>
    </main>
  );
}