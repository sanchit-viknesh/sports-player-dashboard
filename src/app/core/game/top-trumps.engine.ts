import { Deck, PlayerCard, StatKey } from '../models/card.model';

export type PlayerId = 'p1' | 'p2';
export type RoundOutcome = 'p1' | 'p2' | 'tie';

export interface RoundResult {
  round: number;
  statKey: StatKey;
  p1Card: PlayerCard;
  p2Card: PlayerCard;
  outcome: RoundOutcome;
  /** Cards transferred to the winner this round, pot included. */
  cardsWon: number;
}

export interface GameState {
  /** Face-down piles; index 0 is the top card in play. */
  p1: PlayerCard[];
  p2: PlayerCard[];
  /** Cards held over from tied rounds, awarded to the next round's winner. */
  pot: PlayerCard[];
  turn: PlayerId;
  round: number;
  maxRounds: number;
  log: RoundResult[];
  winner: PlayerId | 'draw' | null;
}

export interface DealOptions {
  maxRounds?: number;
  /** Injectable shuffle so tests stay deterministic. */
  shuffle?: (cards: PlayerCard[]) => PlayerCard[];
  startingTurn?: PlayerId;
}

const identity = (cards: PlayerCard[]) => cards;

/** Splits a deck into two equal piles. An odd card is left out rather than
 *  giving one player a permanent extra. */
export function deal(deck: Deck, options: DealOptions = {}): GameState {
  const { maxRounds = 20, shuffle = identity, startingTurn = 'p1' } = options;
  const cards = shuffle([...deck.cards]);
  const half = Math.floor(cards.length / 2);

  return {
    p1: cards.slice(0, half),
    p2: cards.slice(half, half * 2),
    pot: [],
    turn: startingTurn,
    round: 0,
    maxRounds,
    log: [],
    winner: null,
  };
}

export function isOver(state: GameState): boolean {
  return state.winner !== null;
}

/** The card each player currently has in play. */
export function topCards(state: GameState): { p1?: PlayerCard; p2?: PlayerCard } {
  return { p1: state.p1[0], p2: state.p2[0] };
}

/**
 * Plays one round on the chosen stat.
 *
 * Comparison is on `percentile`, never `rawValue` — percentiles already encode
 * direction, so a lower-is-better stat like economy rate ranks correctly.
 * Returns a new state; the input is not mutated.
 */
export function playRound(state: GameState, statKey: StatKey): GameState {
  if (isOver(state)) {
    return state;
  }

  const p1Card = state.p1[0];
  const p2Card = state.p2[0];
  if (!p1Card || !p2Card) {
    return settle(state);
  }

  const p1Value = p1Card.stats[statKey].percentile;
  const p2Value = p2Card.stats[statKey].percentile;

  const outcome: RoundOutcome =
    p1Value === p2Value ? 'tie' : p1Value > p2Value ? 'p1' : 'p2';

  const contested = [p1Card, p2Card, ...state.pot];
  const round = state.round + 1;

  const next: GameState = {
    ...state,
    round,
    p1: state.p1.slice(1),
    p2: state.p2.slice(1),
    pot: outcome === 'tie' ? contested : [],
    // The round winner leads next; on a tie the lead does not change hands.
    turn: outcome === 'tie' ? state.turn : outcome,
    log: [
      ...state.log,
      {
        round,
        statKey,
        p1Card,
        p2Card,
        outcome,
        cardsWon: outcome === 'tie' ? 0 : contested.length,
      },
    ],
    winner: null,
  };

  if (outcome === 'p1') {
    next.p1 = [...next.p1, ...contested];
  } else if (outcome === 'p2') {
    next.p2 = [...next.p2, ...contested];
  }

  return settle(next);
}

/** Applies the end conditions: a player out of cards, or the round cap hit. */
function settle(state: GameState): GameState {
  const outOfCards = state.p1.length === 0 || state.p2.length === 0;
  const capped = state.round >= state.maxRounds;

  if (!outOfCards && !capped) {
    return state;
  }

  // Cards stuck in the pot when the game ends count for nobody.
  let winner: GameState['winner'];
  if (state.p1.length > state.p2.length) {
    winner = 'p1';
  } else if (state.p2.length > state.p1.length) {
    winner = 'p2';
  } else {
    winner = 'draw';
  }

  return { ...state, winner };
}

/**
 * Bot move: pick the category where its own card ranks highest.
 * Deliberately simple — it plays its best stat, with no read of the opponent.
 */
export function pickBotStat(card: PlayerCard, keys: readonly StatKey[]): StatKey {
  return keys.reduce((best, key) =>
    card.stats[key].percentile > card.stats[best].percentile ? key : best,
  );
}
