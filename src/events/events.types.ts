import { GameState } from 'src/common/game.enums';

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
  message: string;
};
