import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameStore, Opponent } from '../../core/game/game.store';
import { STAT_LABELS, StatKey, Sport } from '../../core/models/card.model';

@Component({
  selector: 'sd-game-board',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  protected readonly store = inject(GameStore);

  protected readonly labels = computed(() => STAT_LABELS[this.store.sport()]);

  /** Both cards stay hidden until the round is revealed, so the human cannot
   *  read the opponent's card before choosing a category. */
  protected readonly showOpponentCard = computed(
    () => this.store.phase() === 'revealed' || this.store.phase() === 'over',
  );

  protected readonly asOf = computed(() => {
    const generatedAt = this.store.deck()?.generatedAt;
    return generatedAt ? new Date(generatedAt).toLocaleString() : '';
  });

  protected readonly sourceLabel = computed(() =>
    this.store.deck()?.source === 'mcp' ? 'Live data via MCP' : 'Sample data',
  );

  protected start(sport: Sport, opponent: Opponent): void {
    this.store.start(sport, opponent);
  }

  protected pick(key: StatKey): void {
    if (this.store.canPick()) {
      this.store.pick(key);
    }
  }

  /** Marks the row that decided the round, for the reveal highlight. */
  protected rowState(key: StatKey): 'won' | 'lost' | 'tied' | null {
    if (!this.showOpponentCard() || this.store.lastPick() !== key) {
      return null;
    }
    const outcome = this.store.lastRound()?.outcome;
    if (!outcome) {
      return null;
    }
    return outcome === 'tie' ? 'tied' : outcome === 'p1' ? 'won' : 'lost';
  }

  protected readonly statusText = computed(() => {
    switch (this.store.phase()) {
      case 'loading':
        return 'Dealing…';
      case 'error':
        return this.store.error() ?? 'Something went wrong.';
      case 'over':
        return this.store.winner() === 'draw'
          ? 'Dead heat.'
          : `${this.store.winner() === 'p1' ? 'You' : 'Opponent'} won the match.`;
      case 'revealed':
        return 'Revealing…';
      default:
        return this.store.canPick() ? 'Pick a category.' : 'Opponent is choosing…';
    }
  });
}
