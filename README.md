# StatDeck

A two-player Top Trumps card game where each card is a real cricket or football
player, and the stats on the card come from a scheduled refresh rather than a
hardcoded list.

**Status:** week 1 — the game is playable end to end against sample data. Live
data is not wired up yet.

## What works today

- Full Top Trumps rules: deal, category pick, pot on a tie, round cap, winner.
- Two modes: versus a simple bot, or pass-and-play on one screen.
- Cricket and football decks, each with eight cards.
- Cards show the raw stat; comparison runs on a percentile, so lower-is-better
  stats (bowling economy) rank correctly instead of backwards.

## Architecture

The browser never talks to a stats provider. A scheduled job will act as an MCP
client, fetch player stats, normalize them, and write a static `deck.json`:

```
GitHub Actions (cron)
  └─ MCP client ──► cricket MCP server
                └─► football MCP server (written for this project)
       └─ normalize + rank ──► public/data/deck.<sport>.json
                                        │
Angular app ────────────────────────────┘  (plain fetch, no API, no keys)
```

Keeping the deck as a static file means the demo has no server to keep alive, no
rate limits at request time, and no secrets in the client. A real API is a
possible v2, not a requirement.

### Normalizing two sports

Cricket and football stats do not share a vocabulary, so every card maps its raw
fields onto six abstract categories — `impact`, `creation`, `denial`,
`consistency`, `experience`, `form`. Each cell keeps both the raw value (shown on
the card) and a percentile within its cohort (used to decide the round), plus a
`direction` flag for stats where lower is better.

A match is single-sport in v1. Mixed cricket-versus-football decks would need the
percentile comparison to carry weight it has not earned yet.

## Project layout

```
src/app/core/models     card and deck types
src/app/core/game       pure Top Trumps engine + signals-based store
src/app/core/data       deck loading and validation at the trust boundary
src/app/features/game   the board component
public/data             committed sample decks
```

The engine is deliberately free of Angular imports so the rules can be tested as
plain functions.

## Running it

```bash
npm install
npm start        # http://localhost:4200
npm test         # unit tests
npm run build
```

Tests use a sandbox-free Chrome launcher (`ChromeHeadlessCI` in `karma.conf.js`)
so they also run inside containers.

## Roadmap

- [x] Week 1 — types, engine, tests, sample decks, playable UI
- [ ] Week 2 — MCP client + real cricket data behind a cache, sample-data fallback
- [ ] Week 3 — a football MCP server wrapping a public stats API
- [ ] Week 4 — percentile deck builder, polish, deploy
- [ ] Later — an LLM "scout report" on a matchup; a Nest API to show backend depth

Deliberately out of scope: accounts, leaderboards, online multiplayer, a third
sport.

## Honest limits

The stats in `public/data` are illustrative sample values, not a live feed. Once
the refresh job lands, cards will carry the timestamp of the run that produced
them and the UI will say so — "live" here will mean "refreshed on a schedule",
never "real-time during a match".

## Licence

MIT
