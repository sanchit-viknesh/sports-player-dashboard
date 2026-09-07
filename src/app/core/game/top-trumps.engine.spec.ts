import { Deck } from '../models/card.model';
import { makeCard } from '../testing/card.factory';
import { deal, GameState, pickBotStat, playRound, topCards } from './top-trumps.engine';

function deckOf(...percentiles: number[]): Deck {
  return {
    version: 1,
    sport: 'cricket',
    generatedAt: '2026-09-07T00:00:00.000Z',
    source: 'fixture',
    cards: percentiles.map((p, i) => makeCard(`c${i}`, p)),
  };
}

describe('deal', () => {
  it('splits the deck evenly between both players', () => {
    const state = deal(deckOf(10, 20, 30, 40));

    expect(state.p1.length).toBe(2);
    expect(state.p2.length).toBe(2);
    expect(state.winner).toBeNull();
  });

  it('leaves the odd card out rather than favouring a player', () => {
    const state = deal(deckOf(10, 20, 30));

    expect(state.p1.length).toBe(1);
    expect(state.p2.length).toBe(1);
  });
});

describe('playRound', () => {
  it('awards both cards to the higher percentile', () => {
    const state = deal(deckOf(90, 90, 10, 10), { maxRounds: 10 });

    const next = playRound(state, 'impact');

    expect(next.log[0].outcome).toBe('p1');
    expect(next.log[0].cardsWon).toBe(2);
    expect(next.p1.length).toBe(3);
    expect(next.p2.length).toBe(1);
  });

  it('passes the lead to the round winner', () => {
    const state = deal(deckOf(10, 10, 90, 90), { maxRounds: 10 });

    expect(playRound(state, 'impact').turn).toBe('p2');
  });

  it('holds tied cards in the pot and keeps the lead', () => {
    const state = deal(deckOf(50, 50, 50, 50), { maxRounds: 10, startingTurn: 'p2' });

    const next = playRound(state, 'impact');

    expect(next.log[0].outcome).toBe('tie');
    expect(next.pot.length).toBe(2);
    expect(next.turn).toBe('p2');
    expect(next.p1.length).toBe(1);
    expect(next.p2.length).toBe(1);
  });

  it('awards a held pot to the next round winner', () => {
    const state = deal(deckOf(50, 90, 50, 10), { maxRounds: 10 });

    const afterTie = playRound(state, 'impact');
    const afterWin = playRound(afterTie, 'impact');

    expect(afterWin.log[1].cardsWon).toBe(4);
    expect(afterWin.pot.length).toBe(0);
  });

  it('compares on percentile, so a lower-is-better stat still ranks correctly', () => {
    // Economy rate: p1 concedes 4.1, p2 concedes 8.9, so p1 is the better bowler.
    const stingy = makeCard('stingy', 50, { denial: 95 });
    stingy.stats.denial = {
      key: 'denial',
      rawValue: 4.1,
      displayValue: '4.10',
      direction: 'lower',
      percentile: 95,
    };
    const expensive = makeCard('expensive', 50, { denial: 12 });
    expensive.stats.denial = {
      key: 'denial',
      rawValue: 8.9,
      displayValue: '8.90',
      direction: 'lower',
      percentile: 12,
    };

    const state: GameState = {
      p1: [stingy],
      p2: [expensive],
      pot: [],
      turn: 'p1',
      round: 0,
      maxRounds: 10,
      log: [],
      winner: null,
    };

    expect(playRound(state, 'denial').log[0].outcome).toBe('p1');
  });

  it('does not mutate the state it was given', () => {
    const state = deal(deckOf(90, 90, 10, 10), { maxRounds: 10 });

    playRound(state, 'impact');

    expect(state.p1.length).toBe(2);
    expect(state.log.length).toBe(0);
  });

  it('ends the game when a player runs out of cards', () => {
    const state = deal(deckOf(90, 10), { maxRounds: 10 });

    const next = playRound(state, 'impact');

    expect(next.winner).toBe('p1');
    expect(next.p2.length).toBe(0);
  });

  it('ends on the round cap and awards the larger pile', () => {
    const state = deal(deckOf(90, 90, 10, 10), { maxRounds: 1 });

    const next = playRound(state, 'impact');

    expect(next.round).toBe(1);
    expect(next.winner).toBe('p1');
  });

  it('ignores further rounds once the game is over', () => {
    const over = playRound(deal(deckOf(90, 10), { maxRounds: 10 }), 'impact');

    expect(playRound(over, 'impact')).toBe(over);
  });
});

describe('topCards', () => {
  it('exposes the card each player has in play', () => {
    const state = deal(deckOf(90, 10));

    expect(topCards(state).p1?.id).toBe('c0');
    expect(topCards(state).p2?.id).toBe('c1');
  });
});

describe('pickBotStat', () => {
  it('picks the category where the bot card ranks highest', () => {
    const card = makeCard('bot', 20, { creation: 88 });

    expect(pickBotStat(card, ['impact', 'creation', 'denial'])).toBe('creation');
  });
});
