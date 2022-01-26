import { Test, TestingModule } from '@nestjs/testing';
import { Cell, CellTypeEnum } from './Cell';
import { Field } from './Field';

describe('Field', () => {
  let field: Field;

  describe('Field', () => {
    it('should create"', () => {
      field = new Field(5, 5);
      expect(field.getData().length).toBe(5);
    });

    it('should add 2x ship', () => {
      field = new Field();
      const shipSize = 2;
      const row = 2;
      const col = 3;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX2, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX2, shipId, row, col + 1);
    });

    it('should not add ship to other ship cell', () => {
      // TODO
    });

    it('should move startRow if vertical ship goes off the board', () => {
      field = new Field();
      const shipSize = 3;
      const row = 9;
      const col = 0;
      const { shipId, cells } = field.addShip(row, col, shipSize, true);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX3, shipId, row - 2, col);
      expectCell(cells[1], CellTypeEnum.shipX3, shipId, row - 1, col);
      expectCell(cells[2], CellTypeEnum.shipX3, shipId, row, col);
    });

    it('should move startCol if horizontal ship goes off the board', () => {
      field = new Field();
      const shipSize = 3;
      const row = 2;
      const col = 8;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX3, shipId, row, col - 1);
      expectCell(cells[1], CellTypeEnum.shipX3, shipId, row, col);
      expectCell(cells[2], CellTypeEnum.shipX3, shipId, row, col + 1);
    });
  });
});

function expectCell(
  cell: Cell,
  cellType: CellTypeEnum,
  shipId: number,
  row: number,
  col: number,
) {
  expect(cell.getShipId()).toBe(shipId);
  expect(cell.getType()).toEqual(cellType);
  expect(cell.getRow()).toEqual(row);
  expect(cell.getCol()).toEqual(col);
}
