# StatDeck

A two-player Top Trumps card game where each card is a real cricket player,
styled after the physical Top Trumps cricket cards, with stats that come from
a scheduled refresh rather than a hardcoded list.

**Status:** in progress. The `Card` type now matches the real cricket card
layout (batting/bowling blocks); the game engine, deck loading, and UI are
being reworked to match and are not yet wired to it.

## Scope

- **Cricket only for v1.** The card type is a discriminated union on `sport`,
  so a second sport (football) can be added later as a new branch without
  changing any cricket code — but it is not built now.
- Two-player Top Trumps: pick a stat, higher value wins the round, ties go to
  a pot.

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

### Card shape

A card holds the real numbers printed on a physical Top Trumps cricket card,
grouped the same way the card groups them:

```ts
interface PlayerCard {
  id: string;
  name: string;
  team: string;
  photoUrl?: string;
  sport: Sport;          // discriminant — 'cricket' only today
  batting: BattingStats; // matches, innings, runs, average, strike rate, ...
  bowling: BowlingStats; // overs, wickets, economy rate, ...
}
```

No abstraction, no percentile — a round is decided by comparing the raw number
on the chosen stat.

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
