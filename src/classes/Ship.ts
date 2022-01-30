import { Cell, CellState, CellTypeEnum } from './Cell';

export class Ship {
  private _isKilled = false;

  constructor(
    private id: number,
    private lenght: number,
    private cells: Cell[],
    private isVertical = false,
  ) {
    if (lenght !== cells.length) {
      throw new Error('wrong number of cells');
    }
    cells.forEach((cell, index) => {
      const v = isVertical ? '_v' : '';
      const shipX = `shipX${lenght}${v}_${index + 1}`;

      if (cell.getType() !== CellTypeEnum.empty) {
        throw new Error('cell not empty');
      }

      cell.setType(CellTypeEnum[shipX]);
      cell.setShipId(id);
    });
  }

  public getCells(): Cell[] {
    return this.cells;
  }

  public takeShot(cell: Cell): void {
    cell.setState(CellState.hitted);
    // const shipCells = this.#ships.get(cell.getShipId());
    if (this.shipKilled()) {
      this.cells.forEach((cell) => {
        cell.setState(CellState.killed);
      });

      this._isKilled = true;
    }
  }

  public isKilled(): boolean {
    return this._isKilled;
    // for (let i = 0; i < this.cells.length; i++) {
    //   if (this.cells[i].getState() !== CellState.hitted) {
    //     return false;
    //   }
    // }

    // return true;
  }

  private shipKilled(): boolean {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].getState() !== CellState.hitted) {
        return false;
      }
    }
    return true;
  }
}
