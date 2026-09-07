import { PlayerCard, StatKey, STAT_KEYS, Sport } from '../models/card.model';

/** Builds a card whose every stat sits at the given percentile, so engine
 *  tests can express "this card beats that one" without inventing real stats. */
export function makeCard(
  id: string,
  percentile: number,
  overrides: Partial<Record<StatKey, number>> = {},
  sport: Sport = 'cricket',
): PlayerCard {
  const stats = {} as PlayerCard['stats'];
  for (const key of STAT_KEYS) {
    const value = overrides[key] ?? percentile;
    stats[key] = {
      key,
      rawValue: value,
      displayValue: String(value),
      direction: 'higher',
      percentile: value,
    };
  }

  return {
    id,
    name: `Player ${id}`,
    sport,
    team: 'Test XI',
    role: 'All-rounder',
    stats,
    asOf: '2026-09-07T00:00:00.000Z',
  };
}
