import { randomInt } from 'crypto';
import { Field } from './Field';
import { Game } from './Game';
import { Player } from './Player';

export class BotPlayer extends Player {
  #lastSucessShot: { row: number; col: number };
  #historyShots: Map<string, string> = new Map();

  public takeShot(field: Field): { row: number; col: number } {
    let row = 0;
    let col = 0;
    let key;

    while (true) {
      [row, col] = this.getNextShot(field);
      key = `${row}_${col}`;
      if (!this.#historyShots.has(key)) {
        this.#historyShots[key] = 1;
        break;
      }
    }
    console.log('takeShot', this.#historyShots);
    return { row, col };
  }

  public setLastSuccessShot(row: number, col: number) {
    this.#lastSucessShot = { row, col };
  }

  protected getNextShot(field: Field): [row: number, col: number] {
    if (!this.#lastSucessShot) {
      return [randomInt(10), randomInt(10)];
    }

    const { row, col } = this.#lastSucessShot;
    if (field.isShipKilled(row, col)) {
      this.#lastSucessShot = null;
      return [randomInt(10), randomInt(10)];
    }

    const cells = field.getPosibleShots(row, col);

    if (cells.length > 0) {
      return [cells[0].getRow(), cells[0].getCol()];
    }

    return [randomInt(10), randomInt(10)];
  }
}
