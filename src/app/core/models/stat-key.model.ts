import { BattingStats, BowlingStats } from './card.model';

export type BattingStatKey = keyof BattingStats;
export type BowlingStatKey = Exclude<keyof BowlingStats, 'bestBowling'>;

export interface StatDefinition {
  block: 'batting' | 'bowling';
  key: BattingStatKey | BowlingStatKey;
  label: string;
  /** true if a lower number wins the round (e.g. economy rate). */
  lowerIsBetter: boolean;
}

export const STAT_DEFINITIONS: StatDefinition[] = [
  { block: 'batting', key: 'runs', label: 'Runs', lowerIsBetter: false },
  { block: 'batting', key: 'average', label: 'Batting Average', lowerIsBetter: false },
  { block: 'batting', key: 'strikeRate', label: 'Strike Rate', lowerIsBetter: false },
  { block: 'batting', key: 'hundreds', label: 'Hundreds', lowerIsBetter: false },
  { block: 'bowling', key: 'wickets', label: 'Wickets', lowerIsBetter: false },
  { block: 'bowling', key: 'average', label: 'Bowling Average', lowerIsBetter: true },
  { block: 'bowling', key: 'economyRate', label: 'Economy Rate', lowerIsBetter: true },
];
