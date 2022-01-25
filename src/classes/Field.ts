import { randomInt } from 'crypto';
import { Cell, CellTypeEnum } from './Cell';
import { ShipsCount } from '../common/game.types';

export class Field {
  private field: Cell[][] = [];
  private currentShipId = 1;

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

  public getData(): Cell[][] {
    return this.field;
  }

  public generateShips(ships: ShipsCount): void {
    this.generateShipsForSize(1, ships.x1);
    this.generateShipsForSize(2, ships.x2);
    this.generateShipsForSize(3, ships.x3);
    this.generateShipsForSize(4, ships.x3);

    this.print();
  }

  public addShip(
    row: number,
    col: number,
    shipSize: number,
    isVertical = false,
  ): { shipId: number; cells: Cell[] } | null {
    const shipCells = [];

    const cell = this.field[row][col];
    if (cell.getType() === CellTypeEnum.empty) {
      cell.setType(CellTypeEnum.shipX1);
      cell.setShipId(this.currentShipId);
    } else {
      return null;
    }
    // TODO create and check x-y + add type
    shipCells.push(cell);

    return { shipId: this.currentShipId++, cells: shipCells };
  }

  public removeShip(id: number): boolean {
    // TODO
    return false;
  }

  protected generateShipsForSize(shipSize: number, count: number): void {
    while (count > 0) {
      const row = Math.floor(randomInt(0, this.rows));
      const col = Math.floor(randomInt(0, this.cols));
      const isVertical = Math.floor(randomInt(0, 1)) === 1;
      const res = this.addShip(row, col, shipSize, isVertical);
      console.log(res, count);
      if (res) {
        count--;
        // throw new Error('Error generateShipsForSize');
      }
    }
  }

  private print() {
    for (let row = 0; row < this.rows; row++) {
      let line = '';
      for (let col = 0; col < this.cols; col++) {
        const cell = this.field[row][col];

        switch (cell.getType()) {
          case CellTypeEnum.shipX1:
          case CellTypeEnum.shipX2:
          case CellTypeEnum.shipX3:
          case CellTypeEnum.shipX4:
            line += cell.getShipId().toString();
            break;
          case CellTypeEnum.water:
            line += ' O ';
            break;
          default:
            line += ' - ';
        }
      }
      console.log(line);
    }
  }

  protected initField(): void {
    this.field = Array.from(Array(this.rows).keys(), (x) => []).map(
      (_, rowIndex) => {
        const cellsData = Array.from(
          Array(this.cols).keys(),
          (_, cellIndex) => new Cell(rowIndex, cellIndex),
        );
        return [...cellsData];
      },
    );
  }
}
