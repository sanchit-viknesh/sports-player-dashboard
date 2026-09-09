/** Sports this app can show a card for. Only 'cricket' is implemented in v1. */
export type Sport = 'cricket';

/** Cricket batting figures, one block on the physical card. */
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

/** Cricket bowling figures, the other block on the physical card. */
export interface BowlingStats {
  overs: number;
  runs: number;
  wickets: number;
  bestBowling: string;
  average: number;
  economyRate: number;
}

export interface PlayerCard {
  id: string;
  name: string;
  team: string;
  photoUrl?: string;
  sport: Sport;
  batting: BattingStats;
  bowling: BowlingStats;
}
