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

    it('should add 2x ship on left top corner', () => {
      field = new Field();
      const shipSize = 2;
      const row = 0;
      const col = 0;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX2, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX2, shipId, row, col + 1);
    });

    it('should add 2x ship on right top corner', () => {
      field = new Field();
      const shipSize = 2;
      const row = 0;
      const col = 8;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX2, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX2, shipId, row, col + 1);
    });

    it('should add vertical 3x ship on right top corner', () => {
      field = new Field();
      const shipSize = 3;
      const row = 0;
      const col = 9;
      const { shipId, cells } = field.addShip(row, col, shipSize, true);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX3, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX3, shipId, row + 1, col);
      expectCell(cells[2], CellTypeEnum.shipX3, shipId, row + 2, col);
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

    it('should not add ship to other ship', () => {
      field = new Field();
      const shipSize = 3;
      const row = 2;
      const col = 3;
      field.addShip(row, col, shipSize);
      const res = field.addShip(row - 2, col + 1, shipSize, true);

      expect(res).toBe(null);
    });

    it('should not add ship touched other ship', () => {
      field = new Field();
      const shipSize = 3;
      const row = 5;
      const col = 4;
      field.addShip(row, col, shipSize);

      let res = field.addShip(row - 3, col + 1, shipSize, true);
      expect(res).toBe(null);

      res = field.addShip(row + 1, col + 1, shipSize);
      expect(res).toBe(null);

      // touch corner upper
      res = field.addShip(row - 1, col - 3, shipSize);
      expect(res).toBe(null);

      res = field.addShip(row - 1, col + 3, shipSize);
      expect(res).toBe(null);

      // touch corner lower
      res = field.addShip(row + 1, col - 3, shipSize);
      expect(res).toBe(null);

      res = field.addShip(row + 1, col + 3, shipSize);
      expect(res).toBe(null);
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
