import { createServer } from "node:http";
import { Server } from "socket.io";
import { games } from "./games";

const port = Number.parseInt(process.env.PORT ?? "4000", 10);
const production = process.env.NODE_ENV === "production";

// Comma-separated website origins allowed to connect, e.g. "https://knightshack.club".
// In development any origin is allowed so phones on the same Wi-Fi can join via the LAN IP.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (production && allowedOrigins.length === 0) {
  console.warn("ALLOWED_ORIGINS is empty: browsers on every site will be refused.");
}

const httpServer = createServer((request, response) => {
  // Render's health check, and a quick way to wake a sleeping free instance before an event.
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, games: games.map((game) => game.namespace) }));
    return;
  }
  response.writeHead(404).end();
});

const io = new Server(httpServer, {
  cors: { origin: production ? allowedOrigins : true },
});

for (const game of games) game.register(io.of(game.namespace));

httpServer.listen(port, () => {
  console.log(`> Game server listening on :${port} (${games.map((game) => game.namespace).join(", ")})`);
});
