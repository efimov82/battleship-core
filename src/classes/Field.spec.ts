import { Test, TestingModule } from '@nestjs/testing';
import { ShipsCount } from 'src/common/game.types';
import { Cell, CellTypeEnum } from './Cell';
import { Field } from './Field';

describe('Field', () => {
  let field: Field;
  const shipsCount: ShipsCount = {
    x1: 2,
    x2: 2,
    x3: 1,
    x4: 1,
  };

  describe('Field', () => {
    it('should create"', () => {
      field = new Field(5, 5, shipsCount);
      expect(field.getData().length).toBe(5);
    });

    it('should add 2x ship on left top corner', () => {
      field = new Field(5, 5, shipsCount);
      const shipSize = 2;
      const row = 0;
      const col = 0;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX2_1, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX2_2, shipId, row, col + 1);
    });

    it('should add 2x ship on right top corner', () => {
      field = new Field(10, 10, shipsCount);
      const shipSize = 2;
      const row = 0;
      const col = 8;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX2_1, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX2_2, shipId, row, col + 1);
    });

    it('should add vertical 3x ship on right top corner', () => {
      field = new Field(10, 10, shipsCount);
      const shipSize = 3;
      const row = 0;
      const col = 9;
      const { shipId, cells } = field.addShip(row, col, shipSize, true);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX3_v_1, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX3_v_2, shipId, row + 1, col);
      expectCell(cells[2], CellTypeEnum.shipX3_v_3, shipId, row + 2, col);
    });

    it('should add 2x ship', () => {
      field = new Field(10, 10, shipsCount);
      const shipSize = 2;
      const row = 2;
      const col = 3;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX2_1, shipId, row, col);
      expectCell(cells[1], CellTypeEnum.shipX2_2, shipId, row, col + 1);
    });

    it('should move startRow if vertical ship goes off the board', () => {
      field = new Field(10, 10, shipsCount);
      const shipSize = 3;
      const row = 9;
      const col = 0;
      const { shipId, cells } = field.addShip(row, col, shipSize, true);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX3_v_1, shipId, row - 2, col);
      expectCell(cells[1], CellTypeEnum.shipX3_v_2, shipId, row - 1, col);
      expectCell(cells[2], CellTypeEnum.shipX3_v_3, shipId, row, col);
    });

    it('should move startCol if horizontal ship goes off the board', () => {
      field = new Field(10, 10, shipsCount);
      const shipSize = 3;
      const row = 2;
      const col = 8;
      const { shipId, cells } = field.addShip(row, col, shipSize);

      expect(shipId).toBe(1);
      expect(cells.length).toBe(shipSize);

      expectCell(cells[0], CellTypeEnum.shipX3_1, shipId, row, col - 1);
      expectCell(cells[1], CellTypeEnum.shipX3_2, shipId, row, col);
      expectCell(cells[2], CellTypeEnum.shipX3_3, shipId, row, col + 1);
    });

    it('should not add ship to other ship', () => {
      field = new Field(10, 10, shipsCount);
      const shipSize = 3;
      const row = 2;
      const col = 3;
      field.addShip(row, col, shipSize);
      const res = field.addShip(row - 2, col + 1, shipSize, true);

      expect(res).toBe(null);
    });

    it('should not add ship touched other ship', () => {
      field = new Field(10, 10, shipsCount);
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

    it('should decriment count ships on add ships', () => {
      const field = new Field(10, 10, shipsCount);
      field.addShip(0, 0, 1);
      field.addShip(3, 0, 2);
      field.addShip(5, 0, 3);
      field.addShip(7, 0, 4);

      const expectShipsCount = { ...shipsCount };
      expectShipsCount.x1 = expectShipsCount.x1 - 1;
      expectShipsCount.x2 = expectShipsCount.x2 - 1;
      expectShipsCount.x3 = expectShipsCount.x3 - 1;
      expectShipsCount.x4 = expectShipsCount.x4 - 1;

      expect(field.getAvailableShipsCount()).toEqual(expectShipsCount);
    });

    it('should not add ships over shipsCount', () => {
      const field = new Field(10, 10, shipsCount);
      field.addShip(0, 0, 1);
      field.addShip(3, 0, 1);
      const res1 = field.addShip(5, 0, 1);
      const res2 = field.addShip(7, 0, 1);

      const expectShipsCount = { ...shipsCount };
      expectShipsCount.x1 = 0;

      expect(field.getAvailableShipsCount()).toEqual(expectShipsCount);
      expect(res1).toEqual(null);
      expect(res2).toEqual(null);
    });

    it('should delete ship', () => {
      const field = new Field(10, 10, shipsCount);
      field.addShip(1, 1, 3);
      field.addShip(4, 0, 2);

      expect(field.getShips().size).toEqual(2);
      const res = field.deleteShip(4, 0);
      const ships = field.getShips();

      const availableShips = field.getAvailableShipsCount();

      expect(res).toBeTruthy();
      expect(ships.size).toEqual(1);
      expect(availableShips.x2).toEqual(shipsCount.x2);
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
