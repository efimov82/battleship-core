import { Cell } from '../classes/Cell';
import { GameState } from './game.enums';

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
  playerName: string;
  rivalName: string;
};

export type GameErrorResponse = {
  error: string;
};
