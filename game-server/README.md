# Game server

Realtime Socket.IO server for the club's multiplayer games. It runs separately from the
website (Vercel can't hold WebSocket connections), and is deployed to Render via `render.yaml`.

```bash
npm install
npm run dev        # http://localhost:4000, then run `bun dev` in the repo root
```

Phones on the same Wi-Fi can play against your laptop: open the site at
`http://<your-LAN-IP>:3000/games/...` and the client connects to port 4000 on the same host.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `PORT` | Render (set automatically) | Port to listen on. Defaults to 4000. |
| `ALLOWED_ORIGINS` | Render | Comma-separated website origins allowed to connect, required in production. |
| `NEXT_PUBLIC_GAME_SERVER_URL` | Vercel (website) | e.g. `https://knights-hack-games.onrender.com`. |

Render's free tier sleeps after ~15 minutes idle and takes about a minute to wake. Open the
projector screen (or `/health`) a few minutes before an event.

State lives in memory, so a restart or redeploy ends every game in progress. Don't
redeploy during an event.

## Adding a game

1. `../shared/games/<slug>.ts`: protocol types (events + views), shared with the website.
2. `src/games/<slug>/`: the game logic, exported as a `GameModule` (see `src/lib/game-module.ts`).
   Use `command()` for client requests: it validates the payload and keeps one bad message
   from crashing the server.
3. Register it in `src/games/index.ts`.
4. Website: add it to `src/lib/games/catalog.ts`, then add `src/app/games/<slug>/page.tsx` (phone) and
   `src/app/games/<slug>/screen/page.tsx` (projector). Connect with `useGameSocket`.
