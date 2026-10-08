# CTF Scoring Ideas

Ideas for helping beginners do well in the Knights Hack CTF.

**Goal:** the club wants students from *other programs* (not just CS). The CTF runs all term and
first place wins a gift at the end, so beginners need a real reason to keep playing.

**Reality check:** no scoring formula lets a beginner beat someone who solves every challenge.
Bonus points mostly reshuffle 2nd place and below. What helps is giving beginners **something
they can win**, or **points for showing up instead of skill**.

---

## What's already built

**Dynamic scoring** (`src/lib/ctf/scoring.ts`):

- A challenge starts at its full points and drops on a curve as more people solve it. It never
  goes below `MIN_PERCENT` (25%) of the start and reaches that floor after `DECAY_SOLVES` solves.
- Everyone who solved a challenge gets its **current** value, including the first solvers. So late
  joiners aren't permanently behind, and a score shows how rare your solves are.
- Ties go to whoever reached the score first.
- Hints are free.

**Tuning:** set `DECAY_SOLVES` to about the number of active players you expect by the end of term
(10–12 for now; there were 15 registered and 6 active in Oct 2026). Changing it updates every score
immediately, so set it early.

**Downside for beginners:** easy, popular challenges lose value fastest, and those are the ones
beginners solve. The floor limits how much they lose.

---

## Ideas, in order of priority

### 1. Newcomer prize ⭐ do this first

Add a "first CTF / not in a CS program" checkbox at registration and a filter on the leaderboard.
Experienced students compete for first overall; beginners compete with each other.

- Least work, biggest difference for the club's goal.
- Players declare it themselves, so organizers check eligibility before handing out the prize.

### 2. Event check-in flags

At each workshop or meeting, show a QR code that leads to a one-time "attendance" flag.

- Rewards coming to the club, which beginners can do as well as anyone, and brings people to events.
- Mostly works with the current setup: challenges, flags and QR codes already exist.
- Needs: event flags that **skip the decay** and are **only open during the event** (so the code
  doesn't spread in group chats).

### 3. Weekly winners or a raffle

- **Weekly winners:** announce a top solver each week. A fresh start every week suits a term-long
  contest.
- **Raffle:** every solve is a raffle ticket for a small prize. Everyone who plays has a chance;
  first place still gets the main gift.

### 4. Category completion bonus

Small bonus points for solving every challenge in a beginner category (e.g. "Web Basics"). Gives a
clear goal to work toward.

### 5. Weekly streak bonus

A few points for solving at least one challenge each week, with a cap. Rewards consistency over raw
skill.

---

## Avoid

- **First-solve ("first blood") bonuses:** they always go to the experienced players.
- **Taking points away**, such as hint penalties: it discourages beginners from trying.

---

## Before awarding the prize

- **Fake accounts:** extra accounts can solve challenges to lower their value for everyone else.
  Look over `/ctf/admin/players`.
- **Editing points:** changing a challenge's starting points changes everyone's past scores for it.
