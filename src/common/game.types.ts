import { GameState, GameType } from './game.enums';

export interface GameSettings {
  rows: number;
  cols: number;
  type: GameType;
  ships: {
    x1: number;
    x2: number;
    x3: number;
    x4: number;
  };
}

export type createGameResp = {
  gameId: string;
  gameState: GameState;
  player1: string;
  player2: string;
};
