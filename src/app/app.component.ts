import { Component } from '@angular/core';
import { GameBoardComponent } from './features/game/game-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameBoardComponent],
  template: '<sd-game-board />',
})
export class AppComponent {}
