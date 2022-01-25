import { Cell } from 'src/common/Cell';
import { GameState } from 'src/common/game.enums';

export enum CellTypeEnum {
  empty = 'empty',
  water = 'water',
  shipX1 = 'ship-x1',
  shipX2 = 'ship-x2',
  shipX3 = 'ship-x3',
  shipX4 = 'ship-x4',
}

// Responses
export type CheckInResponse = {
  player: string;
  error?: string;
  field: Cell[][];
};

export type CreateGameResponse = {
  accessToken: string;
  gameId: string;
  gameState: GameState;
  player1: string;
  player2: string;
};

export type JoinGameResponse = {
  accessToken: string;
  gameId: string;
  gameState: GameState;
  player1: string;
  player2: string;
};

export type GameErrorResponse = {
  error: string;
};
