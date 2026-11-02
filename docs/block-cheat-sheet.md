# Scratch Block Cheat Sheet — Knights Hack Club

Code is just instructions in order. Blocks snap together like LEGO.

## The basics
- **Events** (yellow): `when green flag clicked`, `when [space] key pressed`
- **Motion** (blue): `move 10 steps`, `change x by`, `change y by`, `set x to`, `go to x: y:`
- **Looks** (purple): `say [Hello!] for 2 seconds`
- **Control** (orange): `forever`, `repeat`, `if <> then`, `stop all`
- **Sensing** (light blue): `touching [sprite]?`, `key [space] pressed?`, `mouse x`
- **Operators** (green): `pick random -200 to 200`, `<`, `>`, `or`
- **Variables** (red): `set [score] to 0`, `change [score] by 1`

## Game 1: Catch the Stars
1. Bowl: `when flag clicked` → `forever` → `set x to (mouse x)`
2. Make variables `score` and `lives`. Star: `set score to 0`, `set lives to 3`
3. Star: `go to x: (pick random -200 to 200) y: 180`
4. `forever`: `change y by -5`
5. `if <touching Bowl?>` → `change score by 1`, go back to the top
6. `if <y position < -165>` → `change lives by -1`, go back to the top
7. `if <lives < 1>` → `say [Game Over]`, `stop all`

Stretch: speed up as score grows, add a bad item that costs lives, add a catch sound.

## Game 2: Flappy Bird
1. Make variables `speed` and `score`.
2. Bird: `go to x: -100 y: 0`, `set speed to 0`, then `forever`:
   - `change speed by -1` (gravity)
   - `change y by (speed)`
   - `if <key [space] pressed?>` → `set speed to 10` (flap)
3. Pipe: ONE sprite. `go to x: 240`, pick a random `y`, repeat `change x by -5` until `x < -240`, loop.
4. Game over: `if <touching Pipe?>` or the bird leaves the screen → `say [Game Over]`, `stop all`
5. Score: when the pipe passes the bird, `change score by 1`.

Stretch: flap sound, custom bird costume, high score, speed up over time.

## Stuck?
- Nothing happens → did you click the green flag? Is the script on the right sprite?
- Sprite does one thing then stops → you forgot a `forever` loop.
- Sprite does nothing at all → check the block is attached to a `when flag clicked` hat.
- Variable is not changing → check the dropdown picked the right variable.

## Share it
Click **Share** in Scratch, copy the link, then paste it on the club site's Submit page (/scratch/submit)
Save a backup first: **File → Save to your computer**.
