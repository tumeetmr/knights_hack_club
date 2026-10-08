"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

/**
 * The game server runs separately from the website (see game-server/). In development it
 * defaults to port 4000 on whatever host served the page, so phones on the same Wi-Fi work.
 */
export function gameServerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? `${window.location.protocol}//${window.location.hostname}:4000`
  );
}

/**
 * Connects to one game's namespace for the lifetime of the component. `setup` registers the
 * game's listeners; it also runs on every reconnect, so it's the place to (re)join a session.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useGameSocket<S extends Socket<any, any>>(
  namespace: string,
  handlers: { listen: (socket: S) => void; onConnect: (socket: S) => void },
) {
  const socketRef = useRef<S | null>(null);
  const [connected, setConnected] = useState(false);
  const listen = useEffectEvent(handlers.listen);
  const onConnect = useEffectEvent(handlers.onConnect);

  useEffect(() => {
    const socket = io(gameServerUrl() + namespace) as S;
    socketRef.current = socket;
    listen(socket);
    socket.on("connect", () => {
      setConnected(true);
      onConnect(socket);
    });
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace]);

  return { socketRef, connected };
}
