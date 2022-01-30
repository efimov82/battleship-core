import { Test, TestingModule } from '@nestjs/testing';
import { ShipsCount } from 'src/common/game.types';
import { Cell, CellState, CellTypeEnum } from './Cell';
import { Field } from './Field';
import { Ship } from './Ship';

describe('Ship', () => {
  let field: Field;
  const shipsCount: ShipsCount = {
    x1: 2,
    x2: 2,
    x3: 1,
    x4: 1,
  };
  let cells: Cell[] = [];

  beforeEach(() => {
    cells = [
      new Cell(1, 1, CellTypeEnum.empty),
      new Cell(1, 2, CellTypeEnum.empty),
      new Cell(1, 3, CellTypeEnum.empty),
    ];
  });

  it('should throw error if cells not empty', () => {
    const cell = cells[0];
    cell.setType(CellTypeEnum.shipX1_v_1);

    expect(() => {
      new Ship(1, 1, [cell]);
    }).toThrow();
  });

  it('should throw error if cells not equal ship lenght', () => {
    expect(() => {
      new Ship(1, 1, cells);
    }).toThrow();
  });

  it('should Cell state equal killed on shot by 1x ship', () => {
    const cell = cells[0];
    const ship = new Ship(1, 1, [cell]);
    ship.takeShot(cell);

    expect(cell.getType()).toBe(CellTypeEnum.shipX1_1);
    expect(cell.getState()).toBe(CellState.killed);
  });

  it('should Cell state equal killed on shot by 3x ship', () => {
    const ship = new Ship(1, 3, cells);
    ship.takeShot(cells[0]);
    ship.takeShot(cells[1]);
    ship.takeShot(cells[2]);

    expect(cells[0].getState()).toBe(CellState.killed);
    expect(cells[1].getState()).toBe(CellState.killed);
    expect(cells[2].getState()).toBe(CellState.killed);
  });
});
