/** Sports supported by a deck. A v1 match is always single-sport. */
export type Sport = 'cricket' | 'football';

/**
 * Abstract, sport-agnostic stat categories. Each sport's adapter maps its own
 * raw fields onto these so two cards can be compared on the same row.
 */
export type StatKey =
  | 'impact'
  | 'creation'
  | 'denial'
  | 'consistency'
  | 'experience'
  | 'form';

export const STAT_KEYS: readonly StatKey[] = [
  'impact',
  'creation',
  'denial',
  'consistency',
  'experience',
  'form',
] as const;

/** Human labels per sport, since 'denial' means economy rate vs tackles/saves. */
export const STAT_LABELS: Record<Sport, Record<StatKey, string>> = {
  cricket: {
    impact: 'Runs / innings',
    creation: 'Strike rate',
    denial: 'Economy rate',
    consistency: 'Batting average',
    experience: 'Matches played',
    form: 'Last 5 innings',
  },
  football: {
    impact: 'Goals / 90',
    creation: 'Assists / 90',
    denial: 'Tackles / 90',
    consistency: 'Pass accuracy %',
    experience: 'Appearances',
    form: 'Last 5 matches',
  },
};

/**
 * One comparable row on a card.
 *
 * `rawValue` is what we show; `percentile` is what we compare. Keeping both
 * means a lower-is-better stat (bowling economy) can still be ranked without
 * lying about the number printed on the card.
 */
export interface StatCell {
  key: StatKey;
  rawValue: number;
  /** Pre-formatted for display, e.g. "142.6" or "0.71". */
  displayValue: string;
  unit?: string;
  direction: 'higher' | 'lower';
  /** 0-100 rank within this card's cohort. Assigned at deck-build time. */
  percentile: number;
}

export interface PlayerCard {
  id: string;
  name: string;
  sport: Sport;
  team: string;
  role: string;
  imageUrl?: string;
  stats: Record<StatKey, StatCell>;
  /** ISO timestamp of the upstream data this card was built from. */
  asOf: string;
}

/** The unit the cron job writes to public/deck.json and the app fetches. */
export interface Deck {
  version: number;
  sport: Sport;
  /** ISO timestamp of the refresh run that produced this deck. */
  generatedAt: string;
  source: 'mcp' | 'fixture';
  cards: PlayerCard[];
}
