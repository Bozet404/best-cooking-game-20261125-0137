[![Make the best cooking game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/Bozet404/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/Bozet404/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# SIZZLE & SERVE

A tiny kitchen rush for the make.fun bounty
`best-cooking-game-20261125-0137` ($250, top 10 share).

You are the only cook on shift. Orders land on the board up top — run the
kitchen: grab ingredients from the counters, chop lettuce and tomato at the
board, grill patties on the stove, build each dish on the plating counter,
and serve it at the window before the customer walks out. One day, three
minutes, three hearts.

- **A kitchen you can read at a glance:** the order board, the counters,
  the stove burners and the plating counter are all in one frame.
- **Real routes, real choices:** every dish is a little route through the
  kitchen — fridge to stove to board to plate to window — and two burners
  mean you can grill ahead while you chop.
- **Pressure that grows:** orders stack up to three at a time, each with
  its own 60-second timer. Serve back-to-back and the combo doubles
  your coins.
- **Mistakes are fixable:** a burnt patty can be washed back to raw at
  the sink, and the trash bin takes anything you regret carrying.

## The menu

- **Classic Burger** — bun + grilled patty + chopped lettuce, 18 coins
- **Cheesy Melt** — bun + grilled patty + cheese, 22 coins
- **Garden Salad** — chopped lettuce + chopped tomato, 12 coins
- **Bruschetta** — bun + chopped tomato + cheese, 16 coins

## Controls

- Move: WASD / arrow keys, or click the floor to walk there
- Use a station: E, or click the station when you are near it
- Chop / wash: hold E at the Chopping Board / Sink
- Pause: P (or the Pause button) · Restart: R · Mute: M (or the Sound button)

## Play

Open `game/index.html` in desktop Chrome. No build step, no network — the
game is plain static files under `game/`, and all art and sound are drawn
and synthesised in code.

## Entry

`main.ts` (Node 22) copies `game/` and `screenshots/` to `/output` and writes
`/output/dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.
