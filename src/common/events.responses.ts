import { Cell } from '../classes/Cell';
import { GameState } from './game.enums';
import { GameSettings, ShipsCount } from './game.types';

// Requests
export type AddShipPayload = {
  row: number;
  col: number;
  shipSize: number;
  isVertical: boolean;
};

export type RemoveShipPayload = {
  shipId: number;
};

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

export type AutoFillPayload = {
  field: Cell[][];
};

export type GameUpdatePayload = {
  state: GameState;
  settings: GameSettings;
  player: {
    nickname: string;
    field: Cell[][];
    shipsCount: ShipsCount;
    isReady: boolean;
  };
  rival?: {
    nickname: string;
    field: Cell[][];
    shipsCount: ShipsCount;
    isReady: boolean;
  };
  isPlayerTurn: boolean;
};

export type FieldsUpdatePayload = {
  playerField: Cell[][];
  rivalField?: Cell[][];
};
