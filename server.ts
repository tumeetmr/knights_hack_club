import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { RoomManager } from "./src/lib/multiplayer/room-manager";
import type { ClientToServerEvents, ServerToClientEvents } from "./src/lib/multiplayer/types";

const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const hostname = process.env.HOST ?? "0.0.0.0";

async function startServer() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const httpServer = createServer((request, response) => handle(request, response));
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: true, credentials: true },
  });
  const rooms = new RoomManager(io);

  io.on("connection", (socket) => {
    socket.on("room:create", (ack) => {
      ack({ ok: true, ...rooms.createRoom(socket) });
    });

    socket.on("room:join", (payload, ack) => {
      const result = rooms.joinRoom(socket, payload.roomCode, payload.reconnectToken);
      ack(
        "message" in result
          ? { ok: false, message: result.message }
          : { ok: true, assignment: result.assignment },
      );
    });

    socket.on("host:reconnect", (payload, ack) => {
      ack(rooms.reconnectHost(socket, payload.roomCode, payload.reconnectToken));
    });

    socket.on("game:start", (ack) => ack(rooms.startGame(socket)));
    socket.on("game:submit-code", (payload, ack) => ack(rooms.submitCode(socket, payload.code)));
    socket.on("game:play-again", (ack) => ack(rooms.playAgain(socket)));
    socket.on("disconnect", () => rooms.disconnect(socket));
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Knight's Trial server listening at http://${hostname}:${port}`);
  });
}

void startServer();
