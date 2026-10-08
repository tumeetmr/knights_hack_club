"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, RoomState, ServerToClientEvents } from "@/lib/multiplayer/types";

type MultiplayerSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const hostTokenKey = "knights-trial-host-token";

export function MultiplayerHost() {
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [state, setState] = useState<RoomState | null>(null);
  const [message, setMessage] = useState("Creating a game room…");
  const [code, setCode] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const socketRef = useRef<MultiplayerSocket | null>(null);

  useEffect(() => {
    const nextSocket = io() as MultiplayerSocket;
    socketRef.current = nextSocket;
    const reconnectToken = window.localStorage.getItem(hostTokenKey);
    let currentRoomCode = window.localStorage.getItem("knights-trial-host-room") ?? "";

    const createRoom = () => {
      nextSocket.emit("room:create", (response) => {
        if (!response.ok) {
          setMessage(response.message);
          return;
        }
        currentRoomCode = response.roomCode;
        window.localStorage.setItem(hostTokenKey, response.reconnectToken);
        window.localStorage.setItem("knights-trial-host-room", response.roomCode);
        setRoomCode(response.roomCode);
        setMessage("Scan the code to join.");
      });
    };

    nextSocket.on("connect", () => {
      setConnected(true);
      if (reconnectToken && currentRoomCode) {
        setRoomCode(currentRoomCode);
        nextSocket.emit("host:reconnect", { roomCode: currentRoomCode, reconnectToken }, (response) => {
          if (!response.ok) createRoom();
        });
      } else {
        createRoom();
      }
    });
    nextSocket.on("room:state", setState);
    nextSocket.on("game:result", ({ result, attempts }) => {
      setResultMessage(
        result === "won" ? "🎉 You both won!" : `❌ Incorrect code. Try again! (Attempt ${attempts})`,
      );
    });
    nextSocket.on("server:error", ({ message: errorMessage }) => setMessage(errorMessage));
    nextSocket.on("disconnect", () => setConnected(false));

    return () => {
      nextSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinUrl =
    typeof window !== "undefined" && roomCode
      ? `http://192.168.2.13:3000/multiplayer/join/${roomCode}`
      : "";
  const playersReady = true
    state?.players.length === 2 && state.players.every((player) => player.status === "connected");
  const isPlaying = state?.game.phase === "playing";
  const isWon = state?.game.phase === "won";

  return (
    <main className="min-h-dvh bg-ink px-4 py-8 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center gap-8">
        <header>
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-knight-300">Knights Hack Club</p>
          <h1 className="headline mt-3 text-[clamp(4rem,12vw,9rem)]">Knight&apos;s Trial</h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            {isWon ? "🔓 SAFE UNLOCKED! 🎉 YOU BOTH WON!" : message}
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Room code</p>
            <p className="mt-2 font-mono text-6xl font-bold tracking-[0.2em] text-knight-300">{roomCode || "----"}</p>
            <div className="mt-8 grid gap-3">
              {[1, 2].map((number) => {
                const player = state?.players.find((item) => item.number === number);
                return (
                  <div key={number} className="flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4">
                    <span className="font-semibold">Player {number}</span>
                    <span className={player?.status === "connected" ? "text-knight-300" : "text-white/45"}>
                      {player?.status === "connected"
                        ? "Connected"
                        : player?.status === "reconnecting"
                          ? "Reconnecting"
                          : "Waiting"}
                    </span>
                  </div>
                );
              })}
            </div>
            {state?.game.phase === "lobby" && (
              <button
                type="button"
                disabled={!playersReady}
                onClick={() => {
                  socketRef.current?.emit("game:start", (response) => {
                    if (!response.ok) setMessage(response.message);
                  });
                }}
                className="mt-6 min-h-16 w-full rounded-2xl bg-knight-500 px-6 py-4 text-xl font-bold transition hover:bg-knight-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                START GAME
              </button>
            )}
            {isPlaying && (
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6">
                <p className="text-center text-2xl font-bold">🔐 THE SAFE IS LOCKED</p>
                <p className="mt-4 text-center text-lg text-white/70">🔴 RED + 🔵 BLUE</p>
                <p className="mt-6 text-center text-lg">Enter the 2-digit code:</p>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 2))}
                  inputMode="numeric"
                  maxLength={2}
                  aria-label="2-digit code"
                  className="mt-3 w-full rounded-2xl bg-white px-4 py-4 text-center font-mono text-4xl tracking-[0.4em] text-ink outline-none"
                />
                <button
                  type="button"
                  disabled={code.length !== 2}
                  onClick={() => {
                    socketRef.current?.emit("game:submit-code", { code }, (response) => {
                      if (!response.ok) setResultMessage(response.message);
                      else if (response.result === "won") setCode("");
                    });
                  }}
                  className="mt-4 min-h-16 w-full rounded-2xl bg-knight-500 px-6 py-4 text-xl font-bold transition hover:bg-knight-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  UNLOCK
                </button>
                {resultMessage && <p className="mt-4 text-center text-lg">{resultMessage}</p>}
              </div>
            )}
            {isWon && (
              <button
                type="button"
                onClick={() => {
                  setResultMessage("");
                  socketRef.current?.emit("game:play-again", (response) => {
                    if (!response.ok) setMessage(response.message);
                  });
                }}
                className="mt-6 min-h-16 w-full rounded-2xl bg-knight-500 px-6 py-4 text-xl font-bold transition hover:bg-knight-400"
              >
                PLAY AGAIN
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 text-center text-ink">
            {joinUrl ? <QRCodeSVG value={joinUrl} size={240} includeMargin /> : <div className="size-60 animate-pulse bg-mist" />}
            <p className="mt-4 font-semibold">Scan to join</p>
            <p className="mt-1 break-all font-mono text-xs text-ink/50">{joinUrl}</p>
          </div>
        </section>
        {!connected && <p className="text-center font-mono text-sm text-red-300">Connection lost. Reconnecting…</p>}
      </div>
    </main>
  );
}
