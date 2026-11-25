# Ember & Oak — Rush Hour Kitchen

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Revaaa28/makefun-best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Revaaa28/makefun-best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A tiny bistro, a three-minute shift, a full board of hungry tables. **Ember & Oak — Rush Hour Kitchen** is a complete, original cooking game that plays offline in a desktop browser: grill patties, chop vegetables, stack dishes on the plate, and serve them at the window before a ticket's patience runs out.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no libraries — just static files under `game/` and a canvas. Node.js 22.18+ is all you need for the server; the hand-in program is `main.ts`.

## How to play

- **Move** with WASD / arrow keys, or click anywhere on the floor.
- **Work a station** with E (or Space), or click the station when you stand next to it.
- **Grab ingredients** from the bins along the top wall: buns, patties, cheese, tomato, lettuce, onion.
- **Grill** raw patties — grab them off the grill when they ding, before they burn.
- **Chop** vegetables on the board — three chops each.
- **Assemble** the dish on a plate at the assembly counter, then **serve** it at the window. A plate only pays when it matches a ticket exactly.
- **Serve fast** for a tip of up to +50%. Serve twice in a row without a miss and every dish pays double (combo).
- **Dinner rush**: in the last 45 seconds orders arrive faster and tables wait less.
- **P** pauses, **M** mutes, **R** starts a new shift. Best shift is remembered on your machine.

Five dishes on the menu — Ember Classic, Garden Stack, Oak Melt, Fresh Garden Bowl, Double Trouble — and a three-star rating at the end of the shift.

## Layout

- `game/index.html` + `game/style.css` — the page around the canvas
- `game/src/config.js` — recipes, stations, tuning, palette
- `game/src/game.js` — screens, shift clock, scoring, combos
- `game/src/chef.js` — movement, collision, carrying
- `game/src/stations.js` — grill, board, bins, assembly, serving, trash
- `game/src/orders.js` — the order board, patience, payouts
- `game/src/render.js` — every drawing: kitchen, food art, chef, tickets, HUD
- `game/src/audio.js` — synthesised WebAudio sounds (sizzle, chop, ding, serve)
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — deterministic staged scenes for the screenshots
- `game/src/random.js` — seeded RNG
- `main.ts` — the make.fun hand-in program; `vendor/makefun-game.ts` is the kit's library, unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=revaaa28&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
