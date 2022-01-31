import { randomInt } from 'crypto';
import { Field } from './Field';
import { Player } from './Player';

export class BotPlayer extends Player {
  #lastSucessShot: { row: number; col: number };
  #historyShots: Map<string, number> = new Map();

  public takeShot(field: Field): Promise<{ row: number; col: number }> {
    let row = 0;
    let col = 0;
    let key;

    while (true) {
      [row, col] = this.getNextShot(field);
      key = `${row}_${col}`;

      if (!this.#historyShots.has(key)) {
        this.#historyShots.set(key, 1);
        break;
      }
    }

    const res = new Promise<{ row: number; col: number }>((resolve) => {
      setTimeout(() => resolve({ row, col }), 1500);
    });

    return res;
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
      let nextRow;
      let nextCol;
      for (let i = 0; i < cells.length; i++) {
        nextRow = cells[i].getRow();
        nextCol = cells[i].getCol();
        if (!this.#historyShots.has(`${nextRow}_${nextCol}`)) {
          return [nextRow, nextCol];
        }
      }
    }

    return [randomInt(10), randomInt(10)];
  }
}
