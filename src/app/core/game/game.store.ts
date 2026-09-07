import { Injectable, computed, inject, signal } from '@angular/core';
import { DeckService } from '../data/deck.service';
import { Deck, Sport, StatKey, STAT_KEYS } from '../models/card.model';
import { GameState, deal, pickBotStat, playRound, topCards } from './top-trumps.engine';

export type Opponent = 'bot' | 'human';
export type Phase = 'idle' | 'loading' | 'picking' | 'revealed' | 'over' | 'error';

/** Pause between the reveal and the cards moving, so a round is readable. */
const REVEAL_MS = 1400;

/**
 * Owns the game state as signals. The engine stays pure; this is the only place
 * that knows about time, the bot's turn, and the loaded deck.
 */
@Injectable({ providedIn: 'root' })
export class GameStore {
  private readonly deckService = inject(DeckService);

  private readonly state = signal<GameState | null>(null);
  private readonly deckSignal = signal<Deck | null>(null);

  readonly phase = signal<Phase>('idle');
  readonly error = signal<string | null>(null);
  readonly opponent = signal<Opponent>('bot');
  readonly lastPick = signal<StatKey | null>(null);

  readonly deck = this.deckSignal.asReadonly();
  readonly sport = computed(() => this.deckSignal()?.sport ?? 'cricket');
  readonly statKeys = STAT_KEYS;

  readonly p1Count = computed(() => this.state()?.p1.length ?? 0);
  readonly p2Count = computed(() => this.state()?.p2.length ?? 0);
  readonly potCount = computed(() => this.state()?.pot.length ?? 0);
  readonly round = computed(() => this.state()?.round ?? 0);
  readonly maxRounds = computed(() => this.state()?.maxRounds ?? 0);
  readonly turn = computed(() => this.state()?.turn ?? 'p1');
  readonly winner = computed(() => this.state()?.winner ?? null);
  readonly log = computed(() => this.state()?.log ?? []);
  readonly cards = computed(() => (this.state() ? topCards(this.state()!) : {}));
  readonly lastRound = computed(() => this.log().at(-1) ?? null);

  /** True while the human may pick a category. */
  readonly canPick = computed(
    () =>
      this.phase() === 'picking' &&
      (this.opponent() === 'human' || this.turn() === 'p1'),
  );

  start(sport: Sport, opponent: Opponent): void {
    this.phase.set('loading');
    this.error.set(null);
    this.opponent.set(opponent);

    this.deckService.load(sport).subscribe({
      next: (deck) => {
        this.deckSignal.set(deck);
        this.state.set(deal(deck, { maxRounds: 20, shuffle: shuffleCards }));
        this.lastPick.set(null);
        this.phase.set('picking');
        this.maybeBotMove();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof Error ? err.message : 'Could not load the deck.');
        this.phase.set('error');
      },
    });
  }

  pick(statKey: StatKey): void {
    const current = this.state();
    if (!current || this.phase() !== 'picking') {
      return;
    }

    this.lastPick.set(statKey);
    this.phase.set('revealed');

    const next = playRound(current, statKey);
    setTimeout(() => {
      this.state.set(next);
      this.phase.set(next.winner ? 'over' : 'picking');
      this.maybeBotMove();
    }, REVEAL_MS);
  }

  reset(): void {
    this.state.set(null);
    this.deckSignal.set(null);
    this.lastPick.set(null);
    this.error.set(null);
    this.phase.set('idle');
  }

  /** Lets the bot take its own turn once the lead passes to it. */
  private maybeBotMove(): void {
    const current = this.state();
    if (
      this.opponent() !== 'bot' ||
      !current ||
      current.winner ||
      current.turn !== 'p2' ||
      !current.p2[0]
    ) {
      return;
    }

    const choice = pickBotStat(current.p2[0], STAT_KEYS);
    setTimeout(() => this.pick(choice), 700);
  }
}

/** Fisher-Yates. Kept out of the engine so tests can deal a known order. */
function shuffleCards<T>(cards: T[]): T[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
