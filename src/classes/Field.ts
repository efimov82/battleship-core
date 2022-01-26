import { randomInt } from 'crypto';
import { Cell, CellTypeEnum } from './Cell';
import { ShipsCount } from '../common/game.types';

export class Field {
  #field: Cell[][] = [];
  #currentShipId = 1;

  constructor(private rows: number = 10, private cols: number = 10) {
    this.initField();
  }

  // public setField(field: Cell[][]): void {
  //   this.field = field;
  //   this.rows = field.length;
  //   this.cols = field[0].length;
  // }

  public getRows(): number {
    return this.rows;
  }

  public getCols(): number {
    return this.cols;
  }

  public getData(hideShips = false): Cell[][] {
    // TODO hide ships
    return this.#field;
  }

  public generateShips(ships: ShipsCount): void {
    this.generateShipsForSize(1, ships.x1);
    this.generateShipsForSize(2, ships.x2);
    this.generateShipsForSize(3, ships.x3);
    this.generateShipsForSize(4, ships.x4);

    this.print();
  }

  public addShip(
    row: number,
    col: number,
    shipSize: number,
    isVertical = false,
  ): { shipId: number; cells: Cell[] } | null {
    if (row < 0 || col < 0) return null;

    const shipCells = this.getShipCells(row, col, shipSize, isVertical);

    if (!this.isPosibleAddShip(shipCells)) return null;

    shipCells.forEach((cell: Cell) => {
      const shipX = 'shipX' + shipSize;
      cell.setType(CellTypeEnum[shipX]);
      cell.setShipId(this.#currentShipId);

      this.#field[cell.getRow()][cell.getCol()] = cell;
    });

    return { shipId: this.#currentShipId++, cells: shipCells };
  }

  public removeShip(id: number): boolean {
    // TODO
    return false;
  }

  protected generateShipsForSize(shipSize: number, count: number): void {
    while (count > 0) {
      const row = Math.floor(randomInt(0, this.rows));
      const col = Math.floor(randomInt(0, this.cols));
      const isVertical = randomInt(0, 2) === 1;
      const res = this.addShip(row, col, shipSize, isVertical);

      if (res) {
        count--;
        // throw new Error('Error generateShipsForSize');
      }
    }
  }

  private getShipCells(
    row: number,
    col: number,
    shipSize: number,
    isVertical: boolean,
  ): Cell[] {
    const res = [];
    let newRow = row;
    let newCol = col;

    if (!isVertical) {
      if (col + shipSize > this.cols) {
        newCol = this.cols - shipSize;
      }

      for (let i = newCol; i < newCol + shipSize; i++) {
        res.push(this.#field[row][i]);
      }
    } else {
      if (row + shipSize > this.rows) {
        newRow = this.rows - shipSize;
      }

      for (let i = newRow; i < newRow + shipSize; i++) {
        res.push(this.#field[i][col]);
      }
    }
    return res;
  }

  private isPosibleAddShip(shipCells): boolean {
    for (let i = 0; i < shipCells.length; i++) {
      const cell = shipCells[i];
      const fieldCell = this.#field[cell.getRow()][cell.getCol()];
      if (fieldCell.getType() !== CellTypeEnum.empty) {
        return false;
      }
      if (this.isTouchOtherShip(cell)) {
        return false;
      }
    }
    return true;
  }

  private isTouchOtherShip(cell): boolean {
    const cellsAround = this.getCellsAround(cell);
    for (let i = 0; i < cellsAround.length; i++) {
      if (cellsAround[i].getType() !== CellTypeEnum.empty) return true;
    }

    return false;
  }

  print() {
    let line = '';
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.#field[row][col];

        switch (cell.getType()) {
          case CellTypeEnum.shipX1:
          case CellTypeEnum.shipX2:
          case CellTypeEnum.shipX3:
          case CellTypeEnum.shipX4:
            line += ` ${cell.getShipId().toString()} `;
            break;
          case CellTypeEnum.water:
            line += ' O ';
            break;
          default:
            line += ' - ';
        }
      }
      line += '\n';
    }
    console.log(line);
  }

  protected initField(): void {
    this.#field = Array.from(Array(this.rows).keys(), (x) => []).map(
      (_, rowIndex) => {
        const cellsData = Array.from(
          Array(this.cols).keys(),
          (_, cellIndex) => new Cell(rowIndex, cellIndex),
        );
        return [...cellsData];
      },
    );
  }

  private getCellsAround(cell: Cell): Cell[] {
    const res = [];
    if (cell.getRow() - 1 >= 0 && cell.getCol() - 1 >= 0) {
      res.push(this.#field[cell.getRow() - 1][cell.getCol() - 1]);
    }

    if (cell.getRow() - 1 >= 0) {
      res.push(this.#field[cell.getRow() - 1][cell.getCol()]);
    }

    if (cell.getRow() - 1 >= 0 && cell.getCol() + 1 < this.cols) {
      res.push(this.#field[cell.getRow() - 1][cell.getCol() + 1]);
    }

    if (cell.getCol() - 1 >= 0) {
      res.push(this.#field[cell.getRow()][cell.getCol() - 1]);
    }

    if (cell.getCol() + 1 < this.cols) {
      res.push(this.#field[cell.getRow()][cell.getCol() + 1]);
    }

    if (cell.getRow() + 1 < this.rows && cell.getCol() - 1 >= 0) {
      res.push(this.#field[cell.getRow() + 1][cell.getCol() - 1]);
    }

    if (cell.getRow() + 1 < this.rows) {
      res.push(this.#field[cell.getRow() + 1][cell.getCol()]);
    }
    if (cell.getRow() + 1 < this.rows && cell.getCol() + 1 < this.cols) {
      res.push(this.#field[cell.getRow() + 1][cell.getCol() + 1]);
    }

    return res;
  }
}
