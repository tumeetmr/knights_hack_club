# Game Ideas

Multiplayer games for the Knights Hack Club site.

**Goal:** attract students from *other programs* (not just CS) and get them interested in coding.
Every game should be:

- Themed around IT, coding or AI
- Playable in the first minute with **zero** coding knowledge
- Fun with friends (multiplayer)
- Quick to join: nickname only, optionally a CTF account. No forced sign-up.

**Tech constraint:** the site runs on Vercel, which can't hold WebSocket connections. Realtime
games run on the separate Socket.IO server in `game-server/` (hosted on Render), with one
namespace per game. Simple always-on features (e.g. Pixel Wall) can still just poll the site.

**Build order:** 1. Pixel Wall → 2. Code the Knight → 3. Human or AI? → (maybe) Bug Hunt

---

## Built: Vault Crackers (`/games/vault-crackers`)

Drop-in co-op for events, no points or leaderboard. Players scan the projector QR and either
get paired with a stranger or crew up with friends via a 4-letter code (1–4 per crew). Each vault
is a tiny Python program whose lines are split across the crew's phones. They read their lines
out loud, work out what it prints, and type the answer. Vaults ramp from variables → if/else,
loops, AI neuron → functions, "how chatbots pick words". Each crack shows the full program plus
a "you just learned" card. The projector shows a live "just cracked" feed and a shared counter.

## 1. Pixel Wall (planned, replaces the homepage "Idea board" section)

A shared grid like Reddit's r/place. Anyone picks a color and places one pixel every
30 seconds. Over the term people team up to draw logos and fight over territory.

- **Why:** no rooms, lobbies or rules. Open the homepage and click. It's always on, it
  keeps growing, and an end-of-term screenshot makes good social content.
- **Data:** one Postgres table `pixels (x, y, color, nickname, placed_at)`, grid ~64×64
- **API:** route to place a pixel; the client fetches changes every ~2s
- **Abuse:** cooldown per player/IP, reuse the pattern in `src/lib/ctf/rate-limit.ts`
- **Effort:** small

## 2. Code the Knight (main game)

A small grid maze with the club's knight. Players snap together command blocks
(`move forward`, `turn left`, `repeat 3×`, later `if wall ahead`) to guide the knight
to the treasure.

- **Beginner-friendly:** drag blocks, no syntax to learn
- **It's real coding:** sequences, loops, conditions, debugging ("why did my knight walk
  into the wall?")
- **Recruiting hook:** after each level, show *"here's your solution in Python."* Seeing
  that they just wrote real code is what pulls people in.
- **Multiplayer:**
  - Room-code races at events: everyone gets the same level; fewest blocks wins, time
    breaks ties
  - Daily level with a leaderboard for casual play
- **Anti-cheat:** the server re-runs each submitted block program to check it
- **Effort:** medium (grid simulation + block editor + rooms)

## 3. Human or AI? (easy add-on, icebreaker)

Players see a short poem, picture, tweet or code comment and vote on whether a human or
an AI made it. The reveal includes a quick fact (e.g. "AI often gets hands wrong. Look
at the fingers!").

- **Beginner-friendly:** anyone can play; AI is the topic everyone is curious about
- **Multiplayer:** Kahoot-style. The host's screen (projector) shows the item, players
  vote on their phones, and a live scoreboard tracks results.
- **Content:** a set prepared in advance, so no AI API costs while people play
- **Reuse:** shares the room-code system with Code the Knight
- **Effort:** easy

## 4. Bug Hunt (maybe)

Players see a tiny code snippet written to read almost like English, with a description
of what it should do. The first to tap the buggy line scores, then everyone sees a
one-line explanation.

- Teaches people to read code, a gentle first step
- A bit more "school-like" than the others
- **Effort:** easy

---

## Considered and parked

- **Code trivia (Kahoot-style):** good for events, but Human or AI? covers the same
  format and appeals more to non-CS students
- **Code typing race:** fun, but intimidating for people who've never seen code
- **Draw & guess (skribbl-style):** most fun, but needs a real-time service.
  Revisit later.
