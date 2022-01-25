export enum CellTypeEnum {
  empty = 'empty',
  water = 'water',
  shipX1 = 'ship-x1',
  shipX2 = 'ship-x2',
  shipX3 = 'ship-x3',
  shipX4 = 'ship-x4',
}

export class Cell {
  shipId: number;

  constructor(
    private row: number,
    private col: number,
    private type: CellTypeEnum = CellTypeEnum.empty,
  ) {}

  setType(type: CellTypeEnum) {
    this.type = type;
  }

  setShipId(shipId: number) {
    this.shipId = shipId;
  }

  getShipId() {
    return this.shipId;
  }

  getType(): string {
    return this.type;
  }

  getId(): string {
    return `${this.row}_${this.col}`;
  }

  getRow(): number {
    return this.row;
  }

  getCol(): number {
    return this.col;
  }
}
