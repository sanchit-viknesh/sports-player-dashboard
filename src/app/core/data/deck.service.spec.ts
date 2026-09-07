import { Deck } from '../models/card.model';
import { makeCard } from '../testing/card.factory';
import { assertDeck } from './deck.service';

function validDeck(): Deck {
  return {
    version: 1,
    sport: 'cricket',
    generatedAt: '2026-09-07T00:00:00.000Z',
    source: 'fixture',
    cards: [makeCard('a', 40), makeCard('b', 60)],
  };
}

describe('assertDeck', () => {
  it('accepts a well-formed deck', () => {
    expect(assertDeck(validDeck(), 'cricket').cards.length).toBe(2);
  });

  it('rejects a payload with no cards array', () => {
    expect(() => assertDeck({ sport: 'cricket' }, 'cricket')).toThrowError(/malformed/);
  });

  it('rejects a deck for the wrong sport', () => {
    expect(() => assertDeck(validDeck(), 'football')).toThrowError(/sport mismatch/);
  });

  it('rejects a deck too small to deal', () => {
    const deck = { ...validDeck(), cards: [makeCard('a', 40)] };
    expect(() => assertDeck(deck, 'cricket')).toThrowError(/at least two cards/);
  });

  it('rejects a card missing a stat the game can pick', () => {
    const deck = validDeck();
    delete (deck.cards[0].stats as Record<string, unknown>)['denial'];
    expect(() => assertDeck(deck, 'cricket')).toThrowError(/missing stat "denial"/);
  });
});
