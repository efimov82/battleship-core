import { Cell } from '../classes/Cell';
import { GameState } from './game.enums';

// Responses
export type CheckInPayload = {
  player: string;
  error?: string;
};

export type CreateGamePayload = {
  accessToken: string;
  gameId: string;
  gameState: GameState;
  player1: string;
  player2: string;
};

export type JoinGamePayload = {
  accessToken: string;
  gameId: string;
  gameState: GameState;
  playerName: string;
  rivalName: string;
};

export type rivalConnectedPayload = { nickname: string };

export type GameErrorPayload = {
  error: string;
};

export type GameUpdatePayload = {
  player: {
    nickname: string;
    field: Cell[][];
  };
  rival?: {
    nickname: string;
    field: Cell[][];
  };
};

export type FieldsUpdatePayload = {
  playerField: Cell[][];
  rivalField?: Cell[][];
};
