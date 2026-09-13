import { PlayerCard, Sport } from './card.model';

/** Static deck file shape written by the scheduled refresh job. */
export interface Deck {
  sport: Sport;
  generatedAt: string;
  cards: PlayerCard[];
}
