import { randomInt } from 'crypto';
import { CellState, CellTypeEnum } from './Cell';
import { Field } from './Field';
import { Player } from './Player';

export enum BotSpeed {
  low = 'low',
  medium = 'medium',
  high = 'high',
}
export class BotPlayer extends Player {
  #lastSucessShot: { row: number; col: number };
  #historyShots: Map<string, number> = new Map();
  #isGodMode = false;

  public takeShot(field: Field): Promise<{ row: number; col: number }> {
    let row = 0;
    let col = 0;
    let key;

    let count = 20;
    while (count > 0) {
      [row, col] = this.getNextShot(field);
      key = `${row}_${col}`;

      if (!this.#historyShots.has(key)) {
        this.#historyShots.set(key, 1);
        break;
      }

      count--;
    }

    const res = new Promise<{ row: number; col: number }>((resolve) => {
      setTimeout(() => resolve({ row, col }), this._botDelay);
    });

    return res;
  }

  public setGodMode() {
    this.#isGodMode = true;
  }

  public setLastSuccessShot(row: number, col: number) {
    this.#lastSucessShot = { row, col };
  }

  protected getNextShot(field: Field): [row: number, col: number] {
    if (!this.#lastSucessShot) {
      if (this.#isGodMode) {
        let row, col;
        const ships = field.getShips(true);

        ships.forEach((ship) => {
          const cells = ship.getCells();
          cells.forEach((cell) => {
            if (cell.getState() !== CellState.hitted) {
              row = cell.getRow();
              col = cell.getCol();

              return;
            }
          });
        });

        if (row && col) {
          return [row, col];
        }
      }

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
