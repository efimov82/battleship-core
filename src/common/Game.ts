import { v4 as uuidv4 } from 'uuid';
import { GameState } from './game.enums';
import { GameSettings } from './game.types';
import { Player } from './Player';

export class Game {
  private id: string;
  private player1: Player;
  private player2: Player;
  // private field: Field;
  // private state: GameState;

  constructor(settings?: GameSettings) {
    this.id = uuidv4();
    // this.countMines = this.getCountMinesForLevel(settings);
    // this.field = new Field(settings.rows, settings.cols, this.countMines);
    // this.state = GameState.open;
  }

  public getPlayer1(): Player {
    return this.player1;
  }

  public getPlayer2(): Player {
    return this.player2;
  }

  public setPlayer1(player: Player): void {
    this.player1 = player;
  }

  public setPlayer2(player: Player): void {
    this.player2 = player;
  }

  public getId(): string {
    return this.id;
  }

  public getState(): GameState {
    return GameState.created;
  }
}
