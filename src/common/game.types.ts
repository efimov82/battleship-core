import { GameType } from './game.enums';

export interface GameSettings {
  rows: number;
  cols: number;
  gameType: GameType;
  ships: ShipsCount;
}

export type ShipsCount = {
  x1: number;
  x2: number;
  x3: number;
  x4: number;
};
