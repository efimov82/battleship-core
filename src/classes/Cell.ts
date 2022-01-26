export enum CellTypeEnum {
  empty = 'empty',
  water = 'water',
  shipX1_1 = 'ship-x1-1',
  shipX1_v_1 = 'ship-x1-v-1',
  shipX2_1 = 'ship-x2-1',
  shipX2_2 = 'ship-x2-2',
  shipX2_v_1 = 'ship-x2-v-1',
  shipX2_v_2 = 'ship-x2-v-2',
  shipX3_1 = 'ship-x3-1',
  shipX3_2 = 'ship-x3-2',
  shipX3_3 = 'ship-x3-3',
  shipX3_v_1 = 'ship-x3-v-1',
  shipX3_v_2 = 'ship-x3-v-2',
  shipX3_v_3 = 'ship-x3-v-3',
  shipX4_1 = 'ship-x4-1',
  shipX4_2 = 'ship-x4-2',
  shipX4_3 = 'ship-x4-3',
  shipX4_4 = 'ship-x4-4',
  shipX4_v_1 = 'ship-x4-v-1',
  shipX4_v_2 = 'ship-x4-v-2',
  shipX4_v_3 = 'ship-x4-v-3',
  shipX4_v_4 = 'ship-x4-v-4',
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
