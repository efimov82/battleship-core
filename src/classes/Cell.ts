export enum CellTypeEnum {
  empty = 'empty',
  water = 'water',
  shipX1_1 = 'shipX1_1',
  shipX1_v_1 = 'shipX1_v_1',
  shipX2_1 = 'shipX2_1',
  shipX2_2 = 'shipX2_2',
  shipX2_v_1 = 'shipX2_v_1',
  shipX2_v_2 = 'shipX2_v_2',
  shipX3_1 = 'shipX3_1',
  shipX3_2 = 'shipX3_2',
  shipX3_3 = 'shipX3_3',
  shipX3_v_1 = 'shipX3_v_1',
  shipX3_v_2 = 'shipX3_v_2',
  shipX3_v_3 = 'shipX3_v_3',
  shipX4_1 = 'shipX4_1',
  shipX4_2 = 'shipX4_2',
  shipX4_3 = 'shipX4_3',
  shipX4_4 = 'shipX4_4',
  shipX4_v_1 = 'shipX4_v_1',
  shipX4_v_2 = 'shipX4_v_2',
  shipX4_v_3 = 'shipX4_v_3',
  shipX4_v_4 = 'shipX4_v_4',
}

export class Cell {
  #shipId = 0;

  constructor(
    private row: number,
    private col: number,
    private type: CellTypeEnum = CellTypeEnum.empty,
  ) {}

  setType(type: CellTypeEnum) {
    this.type = type;
  }

  setShipId(shipId: number) {
    this.#shipId = shipId;
  }

  getShipId() {
    return this.#shipId;
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
