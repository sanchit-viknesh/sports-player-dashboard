// Union of string literals for the card's sport field. Only 'cricket' for now;
// later becomes 'cricket' | 'football' so the app can branch on sport without guessing from a string.
export type Sport = 'cricket';

// Batting side of a Top Trumps cricket card. Plain numbers as printed on the card — nothing computed.
export interface BattingStats {
  matches: number;
  innings: number;
  notOuts: number;
  runs: number;
  highestScore: number;
  average: number;
  ballsFaced: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
}

// Bowling figures. bestBowling is a string (e.g. "5/23" = 5 wickets for 23 runs) since it isn't
// a single comparable number — that's why it won't be a choosable stat in a Top Trumps round later.
export interface BowlingStats {
  overs: number;
  runs: number;
  wickets: number;
  bestBowling: string;
  average: number;
  economyRate: number;
}

// The card shape the whole app passes around. id for identity/keys, name/team for display,
// photoUrl optional since an image isn't always available, batting/bowling nested rather than
// flattened — mirrors how a physical card visually separates the two.
export interface PlayerCard {
  id: string;
  name: string;
  team: string;
  photoUrl?: string;
  sport: Sport;
  batting: BattingStats;
  bowling: BowlingStats;
}
