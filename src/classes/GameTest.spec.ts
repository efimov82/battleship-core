import { GameState, GameType } from '../common/game.enums';
import { GameSettings, ShipsCount } from '../common/game.types';
import { CellState } from './Cell';
import { Field } from './Field';
import { Game } from './Game';
import { Player } from './Player';

describe('Game', () => {
  let game: Game;
  const shipsCount: ShipsCount = {
    x1: 1,
    x2: 1,
    x3: 0,
    x4: 0,
  };
  const settings: GameSettings = {
    rows: 10,
    cols: 10,
    gameType: GameType.singlePlay,
    ships: shipsCount,
  };

  it('should create"', () => {
    game = new Game(settings);
    expect(game.getState()).toBe(GameState.created);
  });

  it('should have to finished state if all rival ships killed', () => {
    const player1 = new Player('tester', '123');
    game = new Game(settings);
    game.setPlayer1(player1);

    game.addShip(player1.getAccessToken(), {
      row: 1,
      col: 1,
      shipSize: 1,
      isVertical: false,
    });

    game.addShip(player1.getAccessToken(), {
      row: 5,
      col: 5,
      shipSize: 2,
      isVertical: false,
    });

    game.setPlayerReady(player1.getAccessToken());
    expect(game.getState()).toBe(GameState.started);

    const rivalShips = game.getRivalShips(player1);
    rivalShips.forEach((ship) => {
      const shipCells = ship.getCells();
      shipCells.forEach((cell) => {
        game.takeShot(player1.getAccessToken(), cell.getRow(), cell.getCol());
      });
    });

    expect(game.getState()).toBe(GameState.finished);
  });
});
