# Scratch Workshop: Make Your First Game

**When:** Mon, Nov 2, 2026 · 1:00 – 3:00 PM (EST)
**Where:** Room M114 (Merritt)
**Audience:** Absolute beginners, including non-CS students. No experience needed.

**Goals**
1. Everyone leaves having built (and played) a real game.
2. Everyone submits a project to the Knights Hack website.
3. Everyone gets an NFC button linked to their project.

---

## Agenda (120 min)

| Time | Block | What happens |
|---|---|---|
| 1:00 | Sign-in (5 min) | Everyone logs into Scratch and the club site. QR code on the projector. |
| 1:05 | Scratch basics (15 min) | Show a finished Flappy Bird as the hook. Tour the stage, sprites and block categories. Live-build a cat that moves with arrow keys, says hi, and repeats forever. Covers events, motion, loops and `if`. |
| 1:20 | Game 1: Catch the Stars (15 min) | Easiest game. Teaches variables, random numbers and touching. |
| 1:35 | Game 2: Flappy Bird (30 min) | The "wow" build. Adds gravity and the idea that a pipe is a sprite sliding left. |
| 2:05 | Build your own (25 min) | Remix either game or make something new. Exec members walk around. |
| 2:30 | Share to the site (5 min) | Click Share in Scratch, paste the link into the club site. |
| 2:35 | NFC buttons (10 min) | Runs while stragglers finish. |
| 2:45 | Demos (15 min) | 4–5 volunteers present, about 3 minutes each. |

Catch comes before Flappy on purpose: beginners get a win in 15 minutes, and Flappy reuses the same ideas.

---

## Teaching: Scratch basics (15 min)

Live-build a cat sprite together:

1. **Stage and sprites:** what they are, how to add/delete/draw one.
2. **Block categories:** Motion, Looks, Sound, Events, Control, Sensing, Operators, Variables.
3. **Events:** `when green flag clicked`, `when [space] key pressed`.
4. **Motion:** `move 10 steps`, `change x by`, `go to x: y:`.
5. **Loops:** `forever`, `repeat`.
6. **Conditions:** `if <key [right arrow] pressed?> then change x by 10`.
7. **Say hi:** `say [Hello!] for 2 seconds`.

Big idea to repeat: *code is just instructions in order; blocks snap together like LEGO.*

---

## Game 1: Catch the Stars (15 min)

**Concepts:** variables, random, touching, game over.

1. Player sprite (basket/bowl) follows the mouse: `forever → set x to (mouse x)`.
2. Make variables `score` and `lives`. On green flag: `set score to 0`, `set lives to 3`.
3. Star sprite: `go to x: (pick random -200 to 200) y: 180`, then repeat `change y by -5` until it touches the player or the bottom edge.
4. Touching the player: `change score by 1`, then reset to the top.
5. Touching the bottom: `change lives by -1`, then reset to the top.
6. `if lives = 0` then `stop all`.

**Stretch goals:** speed up as score grows, add a bad item that costs lives, add a catch sound.

---

## Game 2: Flappy Bird (30 min)

**Concepts:** gravity with a variable, one sprite doing a repeating job, collision, score.

1. **Bird:** make a variable `speed`. On green flag, `go to x: -100 y: 0`, `set speed to 0`, then `forever`:
   - `change speed by -1` (gravity)
   - `change y by (speed)`
   - `if <key [space] pressed?>` then `set speed to 10` (flap)
2. **Pipes:** ONE pipe-pair sprite (no clones; they're too much for beginners). It goes to `x: 240`, picks a random `y`, then repeats `change x by -5` until `x < -240`, and loops.
3. **Game over:** if the bird touches the pipe or the bottom edge, `say [Game Over]` then `stop all`.
4. **Score:** when the pipe passes the bird, `change score by 1`.

**Stretch goals:** flap sound, custom bird costume, high score, speed up over time.

---

## Build your own (25 min)

Suggested prompts for students who freeze:
- Remix Catch: change the theme (pizza, bugs, phishing emails to avoid).
- Remix Flappy: new character, new background, new difficulty.
- Mini ideas: clicker, maze, dodge game, quiz, "pet" that reacts to the mouse.

---

## Submission: paste the Scratch share link

Scratch hosts and plays projects, so we do **not** store `.sb3` files.

**Student flow**
1. In Scratch, click **Share** (project must be shared, and the Scratch email confirmed).
2. Copy the link, e.g. `https://scratch.mit.edu/projects/123456789`.
3. On the club site, signed in, paste the link plus a title and a one-line description.

**Site flow**
- Parse the project ID from the URL.
- Store a row in Postgres (`src/db/schema.ts`, Drizzle). Nothing else to save.
- Show the game with `https://scratch.mit.edu/projects/{scratchId}/embed` in an iframe.
- An admin approves each project before it shows publicly (same pattern as the newsletter admin).

**Suggested table `scratch_projects`**

| Column | Notes |
|---|---|
| `id` | uuid |
| `userId` | the student's universal site account |
| `scratchId` | parsed from the pasted link |
| `title`, `description` | typed by the student |
| `approved` | `false` until an admin approves it |
| `createdAt` | timestamp |

**Pages**
- `/scratch`: gallery of approved projects.
- `/scratch/[id]`: one project page with the embedded game. Point each student's NFC button here.
- `/scratch/submit`: the submit form (login required).
- Admin screen: approve or reject.

**Optional:** store `.sb3` backups in Vercel Blob (add a `fileUrl` column). Raw `.sb3` files can't be played in an iframe by themselves, so skip this for the first version.

**To check when building:** the site's CSP and headers must allow iframes from `scratch.mit.edu`.

---

## NFC buttons (10 min)

- Stick an NFC tag on the back of a Knights Hack button.
- Write the student's `/scratch/[id]` page URL to the tag, so tapping it with a phone opens their game.
- Extra buttons for newcomers.

---

## Demos (15 min)

- Ask for volunteers; don't force anyone.
- 3 minutes each: show the game, say what you built, what was hard.
- Cheer for everything. This is the part that makes non-CS students want to come back.

---

## Prep checklist

- [ ] Update the event agenda in `src/lib/events.ts` (and add "confirm your Scratch email" to the account note).
- [ ] Build both games yourself ahead of time; keep the finished `.sb3` files on a USB stick.
- [ ] Test M114 wifi with Scratch; have TurboWarp as a backup.
- [ ] Projector slides: block cheat sheet per step, plus a "stuck?" slide with common mistakes (forgot `forever`, wrong sprite selected).
- [ ] QR code for the club site and the submit page.
- [ ] Enough NFC tags and buttons, and a phone or NFC writer app ready.
- [ ] Submit form and gallery working and tested, with an admin account ready to approve.
- [ ] Tell students to use File → Save to your computer as a backup in case wifi fails.

---

## After the event

- Approve submitted projects so they show in `/scratch`.
- Post highlights and a gallery link on Discord and the newsletter.
- Feature one or two projects on the homepage.
